import { SchemaRepository } from "./repository/schema.repo";
import { Campo } from "@app/shared";

/**
 * Perfis de acesso suportados pelo sistema de visibilidade de campos.
 *
 * - `lider`      — acesso a campos marcados como visíveis para líderes.
 * - `tesoureiro` — acesso a campos marcados como visíveis para tesoureiros.
 * - `admin`      — acesso irrestrito a todos os campos, independente de visibilidade.
 */
export type Role = 'lider' | 'tesoureiro' | 'admin';

/**
 * Opções de filtragem para a busca de campos de um schema.
 *
 * @see {@link SchemaService.pegarCampos}
 */
export interface OpcoesPegarCampos {
  /** Perfil do usuário autenticado. Determina quais campos serão retornados. */
  role: Role;
}

/**
 * Serviço responsável pela lógica de negócio relacionada aos campos de schema dinâmico.
 *
 * Gerencia a criação e a leitura de campos associados a eventos, aplicando
 * regras de visibilidade por perfil de acesso (`role`). Atua como camada
 * intermediária entre os controllers e o {@link SchemaRepository}.
 *
 * @example
 * ```ts
 * const service = new SchemaService(schemaRepository);
 *
 * // Admin vê todos os campos
 * const campos = await service.pegarCampos(1, { role: 'admin' });
 *
 * // Líder vê apenas campos marcados como visíveis para 'lider'
 * const camposLider = await service.pegarCampos(1, { role: 'lider' });
 * ```
 */
export class SchemaService {
  constructor(private schemaRepository: SchemaRepository) {}

  /**
   * Retorna os campos de schema de um evento, aplicando filtro de visibilidade por perfil.
   *
   * Quando `opcoes` não é fornecido ou o perfil é `admin`, todos os campos são retornados.
   * Para outros perfis, apenas os campos cujo array `visivel_para` inclui o perfil
   * do usuário são retornados.
   *
   * @param eventoId - Identificador do evento cujos campos serão buscados.
   * @param opcoes   - Opções de filtragem. Se `null` ou omitido, comporta-se como `admin`.
   * @returns Lista de campos transformados para o formato {@link Campo}, na ordem definida pelo schema.
   *
   * @example
   * ```ts
   * // Sem filtro — retorna todos os campos
   * const todos = await service.pegarCampos(1);
   *
   * // Admin — equivalente a sem filtro
   * const admin = await service.pegarCampos(1, { role: 'admin' });
   *
   * // Tesoureiro — retorna apenas campos visíveis para tesoureiros
   * const tesoureiro = await service.pegarCampos(1, { role: 'tesoureiro' });
   * // [{ nome: 'valor_pago', label: 'Valor Pago', tipo: 'number', ... }]
   * ```
   */
  async pegarCampos(eventoId: number, opcoes?: OpcoesPegarCampos | null): Promise<Campo[]> {
    const campos = await this.schemaRepository.acharPorEventoId(eventoId);

    if (!opcoes?.role || opcoes.role === 'admin') {
      return campos.map(campo => this._transformarCampo(campo));
    }

    return campos
      .filter(campo => campo.visivel_para?.includes(opcoes.role))
      .map(campo => this._transformarCampo(campo));
  }

  /**
   * Cria um novo campo de schema associado a um evento.
   *
   * @param eventoId     - Identificador do evento ao qual o campo será vinculado.
   * @param campo        - Dados do campo a ser criado. O `id` é omitido pois é gerado pelo banco.
   * @param visibilidade - Define se o campo é público (`public`) ou restrito a perfis específicos (`restricted`).
   * @param visivel_para - Lista de perfis que podem visualizar este campo quando `visibilidade` é `restricted`.
   *                       Ignorado efetivamente quando `visibilidade` é `public`.
   * @returns O campo recém-criado no formato {@link Campo}.
   *
   * @example
   * ```ts
   * // Campo público — visível para todos os perfis
   * const campoPublico = await service.criarCampo(
   *   1,
   *   { nome: 'nome_completo', label: 'Nome Completo', tipo: 'text', obrigatorio: true, ordem: 0 },
   *   'public',
   *   [],
   * );
   *
   * // Campo restrito — visível apenas para admin e tesoureiro
   * const campoRestrito = await service.criarCampo(
   *   1,
   *   { nome: 'valor_pago', label: 'Valor Pago', tipo: 'number', obrigatorio: false, ordem: 1 },
   *   'restricted',
   *   ['admin', 'tesoureiro'],
   * );
   * ```
   */
  async criarCampo(
    eventoId: number,
    campo: Omit<Campo, 'id'>,
    visibilidade: 'public' | 'restricted',
    visivel_para: Role[],
  ): Promise<Campo> {
    const novoCampo = await this.schemaRepository.criar({
      evento_id: eventoId,
      ...campo,
      visibilidade,
      visivel_para,
    });

    return this._transformarCampo(novoCampo);
  }

  /**
   * Transforma um registro bruto do banco de dados no formato de domínio {@link Campo}.
   *
   * Garante que apenas os campos do contrato público sejam expostos para fora
   * da camada de dados, isolando detalhes de implementação como `evento_id`,
   * `visivel_para` e `visibilidade` do restante da aplicação.
   *
   * @param campo - Registro bruto retornado pelo {@link SchemaRepository}.
   * @returns Objeto no formato {@link Campo}.
   */
  private _transformarCampo(campo: any): Campo {
    return {
      nome: campo.nome,
      label: campo.label,
      tipo: campo.tipo,
      obrigatorio: campo.obrigatorio,
      ordem: campo.ordem,
    };
  }
}