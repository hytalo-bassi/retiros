import { Campo } from "@app/shared";
import { logger } from "../../logger";
import { EventoRepository } from "./repository/evento.repo";
import { SchemaService } from "./schema.service";

/**
 * Representa um campo dinâmico de inscrição com metadados de visibilidade.
 *
 * Estende {@link Campo} (exceto `id`) com as propriedades necessárias para
 * controle de acesso por perfil, usadas tanto na criação da tabela SQL
 * quanto no registro em `_meta.colunas_schema`.
 *
 * @example
 * ```ts
 * const coluna: TipoColunasQuery = {
 *   nome: 'valor_pago',
 *   label: 'Valor Pago',
 *   tipo: 'number',
 *   obrigatorio: false,
 *   ordem: 2,
 *   visibilidade: 'restricted',
 *   visivel_para: ['admin', 'tesoureiro'],
 * };
 * ```
 */
export type TipoColunasQuery =
  Omit<Campo, "id"> & {
    /** Define se o campo é visível para todos (`public`) ou restrito a perfis específicos (`restricted`). */
    visibilidade: "public" | "restricted";
    /** Lista de perfis que podem visualizar este campo quando `visibilidade` é `restricted`. */
    visivel_para: ("lider" | "tesoureiro" | "admin")[];
  };

/**
 * Serviço responsável pela lógica de negócio de eventos/retiros.
 *
 * Orquestra a criação completa de um evento — desde o registro em
 * `_meta.eventos` até o provisionamento do schema isolado no banco de dados
 * e o registro dos campos dinâmicos de inscrição.
 *
 * @example
 * ```ts
 * const service = new EventoService(eventoRepository, schemaService);
 *
 * await service.criar(
 *   'retiro-2025',
 *   'Retiro de Jovens 2025',
 *   1,
 *   true,
 *   campos,
 *   new Date('2025-01-01'),
 *   new Date('2025-03-01'),
 * );
 * ```
 */
export class EventoService {
  constructor(
    private eventoRepository: EventoRepository,
    private schemaService: SchemaService,
  ) {}

  /**
   * Cria um novo evento e provisiona toda a sua infraestrutura no banco de dados.
   *
   * Esta operação é composta pelas seguintes etapas, executadas em ordem:
   * 1. Valida que o slug não está em uso
   * 2. Insere o registro em `_meta.eventos`
   * 3. Define como padrão atomicamente, se solicitado
   * 4. Cria o schema PostgreSQL isolado (`slug`)
   * 5. Cria `slug.equipes`
   * 6. Cria `slug.inscricoes` com os campos dinâmicos
   * 7. Cria `slug.pagamentos`
   * 8. Registra os campos dinâmicos em `_meta.colunas_schema`
   *
   * @param slug        - Identificador único do evento em formato URL-friendly (ex.: `retiro-2025`).
   * @param nome        - Nome de exibição do evento.
   * @param criadoPor   - ID do usuário administrador que está criando o evento.
   * @param padrao      - Se `true`, define este evento como padrão do sistema atomicamente.
   * @param colunas     - Campos dinâmicos de inscrição com metadados de visibilidade.
   * @param inscricoesDe  - Data de início do período de inscrições. Opcional.
   * @param inscricoesAte - Data de fim do período de inscrições. Opcional.
   * @returns O evento criado, ou `undefined` se o slug já estiver em uso.
   *
   * @remarks
   * As etapas de DDL (criação de schema e tabelas) **não são transacionais**
   * — se uma etapa falhar após o schema ter sido criado, o banco pode ficar
   * em estado parcialmente provisionado. Considere adicionar tratamento de
   * erro com rollback manual (ex.: `DROP SCHEMA slug CASCADE`) na camada
   * superior se isso for crítico para o seu caso de uso.
   *
   * @example
   * ```ts
   * const campos: TipoColunasQuery[] = [
   *   {
   *     nome: 'tamanho_camiseta',
   *     label: 'tamanho_camiseta',
   *     tipo: 'string',
   *     obrigatorio: true,
   *     ordem: 0,
   *     visibilidade: 'public',
   *     visivel_para: [],
   *   },
   *   {
   *     nome: 'valor_pago',
   *     label: 'valor_pago',
   *     tipo: 'number',
   *     obrigatorio: false,
   *     ordem: 1,
   *     visibilidade: 'restricted',
   *     visivel_para: ['admin', 'tesoureiro'],
   *   },
   * ];
   *
   * const evento = await service.criar('retiro-2025', 'Retiro 2025', 1, true, campos);
   *
   * if (!evento) {
   *   // slug já estava em uso
   * }
   * ```
   */
  async criar(
    slug: string,
    nome: string,
    criadoPor: number,
    padrao: boolean,
    colunas: TipoColunasQuery[],
    inscricoesDe?: Date | null,
    inscricoesAte?: Date | null,
  ) {
    if (await this.eventoRepository.acharPorSlug(slug)) {
      logger.warn({ slug }, 'Tentativa de criar evento com slug já existente');
      return;
    }

    const r = await this.eventoRepository.criar({
      slug,
      nome,
      criado_por: criadoPor,
      inscricoes_abertas_de: inscricoesDe,
      inscricoes_abertas_ate: inscricoesAte,
    });

    if (padrao) {
      await this.eventoRepository.definirPadraoTransacional(r.id);
    }

    await this.criarSchemaRetiro(slug);
    await this.eventoRepository.criarTabelaEquipes(slug);
    await this.eventoRepository.criarTabelaInscricoes(slug, colunas);
    await this.eventoRepository.criarTabelaPagamentos(slug);

    for (const campo of colunas) {
      await this.schemaService.criarCampo(r.id, campo, campo.visibilidade, campo.visivel_para);
    }

    return r;
  }

  /**
   * Cria o schema PostgreSQL isolado para um evento.
   *
   * Delega para {@link EventoRepository.criarEventoRetiro}, que valida o slug
   * e executa o `CREATE SCHEMA IF NOT EXISTS` de forma segura.
   *
   * @param slug - Nome do schema a ser criado.
   * @throws {Error} Se o slug contiver caracteres inválidos.
   *
   * @example
   * ```ts
   * await service.criarSchemaRetiro('retiro-2025');
   * ```
   */
  async criarSchemaRetiro(slug: string) {
    return this.eventoRepository.criarEventoRetiro(slug);
  }

  /**
   * Busca um evento pelo seu slug.
   *
   * @param slug - Slug do evento a ser buscado.
   * @returns O evento encontrado, ou `undefined` se não existir.
   *
   * @example
   * ```ts
   * const evento = await service.acharPorSlug('retiro-2025');
   *
   * if (!evento) {
   *   throw new NotFoundError('Evento não encontrado');
   * }
   * ```
   */
  async acharPorSlug(slug: string) {
    return this.eventoRepository.acharPorSlug(slug);
  }

  /**
   * Retorna o evento atualmente definido como padrão do sistema.
   *
   * @returns O evento padrão, ou `undefined` se nenhum estiver definido.
   *
   * @example
   * ```ts
   * const padrao = await service.pegarPadrao();
   *
   * if (!padrao) {
   *   console.warn('Nenhum evento padrão configurado');
   * }
   * ```
   */
  async pegarPadrao() {
    return this.eventoRepository.acharPadrao();
  }

  /**
   * Retorna todos os eventos cadastrados no sistema.
   *
   * @returns Lista com todos os eventos. Retorna array vazio se não houver nenhum.
   *
   * @remarks
   * Sem paginação — use com cautela em produção conforme o volume de eventos crescer.
   *
   * @example
   * ```ts
   * const eventos = await service.pegarEventos();
   * ```
   */
  async pegarEventos() {
    return this.eventoRepository.todosEventos();
  }
}