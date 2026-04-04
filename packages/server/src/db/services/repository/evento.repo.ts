import { Campo } from "@app/shared";
import { Database } from "../../types";
import { ColumnDataType, CreateTableBuilder, Kysely, sql } from "kysely";

/**
 * Repositório responsável pelas operações de persistência de eventos e pela
 * criação da estrutura de banco de dados (DDL) de cada evento/retiro.
 *
 * Além das operações CRUD padrão na tabela `_meta.eventos`, este repositório
 * gerencia a criação dinâmica de schemas e tabelas isoladas por evento —
 * permitindo que cada retiro tenha seu próprio namespace no banco de dados.
 *
 * ### Ordem de criação de um evento completo
 * Para garantir integridade referencial, as operações DDL devem ser executadas
 * na seguinte ordem:
 *
 * 1. {@link criarEventoRetiro} — cria o schema isolado (`slug`)
 * 2. {@link criarTabelaEquipes} — cria `slug.equipes` (sem dependências)
 * 3. {@link criarTabelaInscricoes} — cria `slug.inscricoes` (referencia `slug.equipes`)
 * 4. {@link criarTabelaPagamentos} — cria `slug.pagamentos` (referencia `slug.inscricoes`)
 *
 * @example
 * ```ts
 * const repo = new EventoRepository(db);
 *
 * // Criar evento e provisionar estrutura completa
 * const evento = await repo.criar({ slug: 'retiro-2025', nome: 'Retiro 2025' });
 * await repo.criarEventoRetiro(evento.slug);
 * await repo.criarTabelaEquipes(evento.slug);
 * await repo.criarTabelaInscricoes(evento.slug, campos);
 * await repo.criarTabelaPagamentos(evento.slug);
 * ```
 */
export class EventoRepository {
  private db: Kysely<Database>;
  constructor({ bd }: { bd: Kysely<Database> }) {
    this.db = bd;
  }

  /**
   * Insere um novo evento no banco de dados.
   *
   * @param data - Dados do evento a ser criado.
   * @param data.slug - Identificador único em formato URL-friendly (ex.: `retiro-2025`).
   * @param data.nome - Nome de exibição do evento.
   * @param data.criado_por - ID do usuário administrador que criou o evento. Opcional.
   * @param data.inscricoes_abertas_de - Data de início do período de inscrições. Opcional.
   * @param data.inscricoes_abertas_ate - Data de fim do período de inscrições. Opcional.
   * @returns O evento recém-criado com todos os campos, incluindo o `id` gerado.
   * @throws {NoResultError} Se a inserção não retornar nenhum registro.
   *
   * @example
   * ```ts
   * const evento = await repo.criar({
   *   slug: 'retiro-2025',
   *   nome: 'Retiro de Jovens 2025',
   *   criado_por: 1,
   *   inscricoes_abertas_de: new Date('2025-01-01'),
   *   inscricoes_abertas_ate: new Date('2025-03-01'),
   * });
   * console.log(evento.id); // 7
   * ```
   */
  async criar(data: {
    slug: string;
    nome: string;
    criado_por?: number | null;
    inscricoes_abertas_de?: Date | null;
    inscricoes_abertas_ate?: Date | null;
  }) {
    return this.db
      .insertInto("_meta.eventos")
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  /**
   * Busca um evento pelo seu identificador único.
   *
   * @param id - Identificador único do evento.
   * @returns O evento encontrado, ou `undefined` se não existir.
   *
   * @example
   * ```ts
   * const evento = await repo.acharPorId(7);
   *
   * if (!evento) {
   *   throw new Error('Evento não encontrado');
   * }
   * ```
   */
  async acharPorId(id: number) {
    return this.db
      .selectFrom("_meta.eventos")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst();
  }

  /**
   * Busca um evento pelo seu slug.
   *
   * @param slug - Slug único do evento (ex.: `retiro-2025`).
   * @returns O evento encontrado, ou `undefined` se não existir.
   *
   * @example
   * ```ts
   * const evento = await repo.acharPorSlug('retiro-2025');
   *
   * if (!evento) {
   *   throw new Error('Evento não encontrado');
   * }
   * ```
   */
  async acharPorSlug(slug: string) {
    return this.db
      .selectFrom("_meta.eventos")
      .selectAll()
      .where("slug", "=", slug)
      .executeTakeFirst();
  }

  /**
   * Retorna todos os eventos cadastrados no banco de dados.
   *
   * @returns Lista com todos os eventos. Retorna array vazio se não houver nenhum.
   *
   * @remarks
   * Use com cautela em produção — sem paginação, esta query pode retornar
   * um volume grande de registros. Prefira {@link acharAtivos} quando
   * apenas eventos ativos forem necessários.
   *
   * @example
   * ```ts
   * const eventos = await repo.todosEventos();
   * console.log(`${eventos.length} eventos encontrados`);
   * ```
   */
  async todosEventos() {
    return this.db.selectFrom("_meta.eventos").selectAll().execute();
  }

  /**
   * Atualiza parcialmente um evento existente.
   *
   * Os campos `id`, `criado_em` e `criado_por` são imutáveis e não podem
   * ser alterados por esta operação.
   *
   * @param id - Identificador único do evento a ser atualizado.
   * @param data - Campos a serem atualizados. Apenas os campos fornecidos serão alterados.
   * @returns O evento atualizado com todos os campos.
   * @throws {NoResultError} Se nenhum evento com o `id` fornecido for encontrado.
   *
   * @remarks
   * O tipo do parâmetro `data` está atualmente tipado como `Partial<Omit<any, ...>>`.
   * Considere substituir `any` pelo tipo concreto da tabela de eventos para
   * garantir segurança de tipos em tempo de compilação.
   *
   * @example
   * ```ts
   * const atualizado = await repo.update(7, {
   *   nome: 'Retiro de Jovens 2025 — Edição Especial',
   *   inscricoes_abertas_ate: new Date('2025-04-01'),
   * });
   * ```
   */
  async update(
    id: number,
    data: Partial<Omit<any, "id" | "criado_em" | "criado_por">>,
  ) {
    return this.db
      .updateTable("_meta.eventos")
      .set(data)
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  /**
   * Remove um evento pelo seu identificador único.
   *
   * @param id - Identificador único do evento a ser removido.
   * @returns Lista de registros deletados (vazia se nenhum for encontrado).
   *
   * @remarks
   * Esta operação remove apenas o registro em `_meta.eventos`. O schema
   * isolado do evento (tabelas `inscricoes`, `equipes`, `pagamentos`) **não**
   * é removido automaticamente — isso deve ser tratado na camada de serviço
   * se necessário.
   *
   * @example
   * ```ts
   * await repo.deletar(7);
   * ```
   */
  async deletar(id: number) {
    return this.db
      .deleteFrom("_meta.eventos")
      .where("id", "=", id)
      .execute();
  }

  /**
   * Retorna todos os eventos marcados como ativos.
   *
   * @returns Lista de eventos com `ativo = true`. Retorna array vazio se não houver nenhum.
   *
   * @example
   * ```ts
   * const ativos = await repo.acharAtivos();
   * ```
   */
  async acharAtivos() {
    return this.db
      .selectFrom("_meta.eventos")
      .selectAll()
      .where("ativo", "=", true)
      .execute();
  }

  /**
   * Cria um schema PostgreSQL isolado para o evento, usando o slug como nome.
   *
   * Cada evento possui seu próprio schema no banco de dados, garantindo
   * isolamento total entre os dados de diferentes retiros.
   * A operação é idempotente — não falha se o schema já existir.
   *
   * @param slug - Nome do schema a ser criado. Deve conter apenas letras,
   *               números, underscores e hífens.
   * @throws {Error} Se o slug contiver caracteres inválidos.
   *
   * @remarks
   * Deve ser o **primeiro passo** na criação de um novo evento, pois todas
   * as outras operações DDL (`criarTabelaEquipes`, `criarTabelaInscricoes`,
   * `criarTabelaPagamentos`) dependem deste schema existir.
   *
   * @example
   * ```ts
   * await repo.criarEventoRetiro('retiro-2025');
   * // Cria: CREATE SCHEMA IF NOT EXISTS "retiro-2025"
   * ```
   */
  async criarEventoRetiro(slug: string) {
    const slugRegex = /^[\w-]+$/;
    if (!slugRegex.test(slug)) {
      throw new Error('Slug inválido: deve conter apenas letras, números, underscore e hífen');
    }
    await sql`CREATE SCHEMA IF NOT EXISTS ${sql.id(slug)}`.execute(this.db);
  }

  /**
   * Retorna o evento marcado como padrão do sistema.
   *
   * O evento padrão é utilizado como fallback quando nenhum evento específico
   * é selecionado — por exemplo, na tela inicial de inscrições.
   *
   * @returns O evento padrão, ou `undefined` se nenhum estiver definido.
   *
   * @example
   * ```ts
   * const padrao = await repo.acharPadrao();
   *
   * if (!padrao) {
   *   console.warn('Nenhum evento padrão definido');
   * }
   * ```
   */
  async acharPadrao() {
    return this.db
      .selectFrom("_meta.eventos")
      .selectAll()
      .where("padrao", "=", true)
      .executeTakeFirst();
  }

  /**
   * Remove a flag `padrao` de todos os eventos.
   *
   * Deve ser chamado **antes** de {@link definirPadrao} ou {@link definirPadraoId}
   * para garantir que apenas um evento seja o padrão por vez.
   *
   * @example
   * ```ts
   * // Troca o evento padrão de forma segura
   * await repo.redefinirPadrao();
   * await repo.definirPadraoId(novoEventoId);
   * ```
   */
  async redefinirPadrao() {
    await this.db
      .updateTable("_meta.eventos")
      .set({ padrao: false })
      .execute();
  }

  /**
   * Define um evento como padrão pelo seu slug.
   *
   * @param slug - Slug do evento a ser definido como padrão.
   * @returns Resultado da operação de update.
   *
   * @remarks
   * Chame {@link redefinirPadrao} antes desta operação para evitar múltiplos
   * eventos padrão simultaneamente.
   *
   * @example
   * ```ts
   * await repo.redefinirPadrao();
   * await repo.definirPadrao('retiro-2025');
   * ```
   */
  async definirPadrao(slug: string) {
    return this.db
      .updateTable("_meta.eventos")
      .set({ padrao: true })
      .where("slug", "=", slug)
      .execute();
  }

  /**
   * Define um evento como padrão pelo seu identificador único.
   *
   * Alternativa a {@link definirPadrao} quando o `id` é mais conveniente
   * que o `slug` no contexto da chamada.
   *
   * @param id - Identificador único do evento a ser definido como padrão.
   * @returns Resultado da operação de update.
   *
   * @remarks
   * Chame {@link redefinirPadrao} antes desta operação para evitar múltiplos
   * eventos padrão simultaneamente.
   *
   * @example
   * ```ts
   * await repo.redefinirPadrao();
   * await repo.definirPadraoId(7);
   * ```
   */
  async definirPadraoId(id: number) {
    return this.db
      .updateTable("_meta.eventos")
      .set({ padrao: true })
      .where("id", "=", id)
      .execute();
  }

  /**
   * Cria a tabela `inscricoes` dentro do schema isolado do evento.
   *
   * A tabela inclui colunas fixas de controle (auditoria, cancelamento, vínculos)
   * e colunas dinâmicas definidas pelo schema do evento, mapeadas a partir
   * do array `colunas` via {@link adicionarColunaKysely}.
   * Também cria um índice em `congregacao_id` para otimizar queries de listagem.
   * A operação é idempotente — não falha se a tabela já existir.
   *
   * @param slug    - Nome do schema onde a tabela será criada.
   * @param colunas - Campos dinâmicos do evento que serão adicionados como colunas extras.
   *
   * @remarks
   * **Deve ser chamada após {@link criarTabelaEquipes}**, pois possui uma
   * foreign key para `slug.equipes.id`.
   *
   * @example
   * ```ts
   * const campos: Campo[] = [
   *   { nome: 'tamanho_camiseta', label: 'tamanho_camiseta', tipo: 'string', obrigatorio: true, ordem: 0 },
   *   { nome: 'tem_alergia', label: 'tem_alergia', tipo: 'boolean', obrigatorio: false, ordem: 1 },
   * ];
   *
   * await repo.criarTabelaInscricoes('retiro-2025', campos);
   * // Cria: retiro-2025.inscricoes com colunas fixas + tamanho_camiseta (text) + tem_alergia (boolean)
   * ```
   */
  async criarTabelaInscricoes(slug: string, colunas: Campo[]) {

    await this.db.schema
      .withSchema(slug)
      .createTable('inscricoes')
      .ifNotExists()
      .addColumn('id', 'serial', (col) => col.primaryKey())
      .addColumn('codigo_unico', 'uuid', (col) =>
        col.defaultTo(sql`gen_random_uuid()`).notNull().unique()
      )
      .addColumn('congregacao_id', 'integer', (col) =>
        col.references('_meta.congregacoes.id')
      )
      .addColumn('equipe_id', 'integer', (col) =>
        col.references(`${slug}.equipes.id`).onDelete('set null')
      )
      .addColumn('cancelado', 'boolean', (col) => col.defaultTo(false))
      .addColumn('motivo_cancelamento', 'text')
      .addColumn('criado_em', 'timestamp', (col) => col.defaultTo(sql`now()`))
      .addColumn('atualizado_em', 'timestamp', (col) => col.defaultTo(sql`now()`))
      .$call((builder) =>
        colunas.reduce(
          (b, col) => this.adicionarColunaKysely(b, col),
          builder,
        )
      )
      .execute();

    const indexName = `idx_${slug.replace('-', '_')}_inscricoes_congregacao`;
    await this.db.schema
      .withSchema(slug)
      .createIndex(indexName)
      .ifNotExists()
      .on('inscricoes')
      .column('congregacao_id')
      .execute();
  }

  /**
   * Cria a tabela `equipes` dentro do schema isolado do evento.
   *
   * Cada equipe possui um nome e uma cor em formato hexadecimal, validada
   * por uma constraint `CHECK` no banco de dados.
   * A operação é idempotente — não falha se a tabela já existir.
   *
   * @param slug - Nome do schema onde a tabela será criada.
   *
   * @remarks
   * **Deve ser chamada antes de {@link criarTabelaInscricoes}**, pois
   * `inscricoes` possui uma foreign key para `slug.equipes.id`.
   *
   * @example
   * ```ts
   * await repo.criarTabelaEquipes('retiro-2025');
   * // Cria: retiro-2025.equipes com validação de cor hexadecimal
   * // Exemplo de registro válido: { nome: 'Equipe Azul', cor: '#3B82F6' }
   * ```
   */
  async criarTabelaEquipes(slug: string) {
    await this.db.schema
      .withSchema(slug)
      .createTable('equipes')
      .ifNotExists()
      .addColumn('id', 'serial', (col) => col.primaryKey())
      .addColumn('nome', 'text', (col) => col.notNull())
      .addColumn('cor', 'text', (col) =>
        col.notNull().check(sql`cor ~ '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$'`)
      )
      .execute();
  }

  /**
   * Cria a tabela `pagamentos` dentro do schema isolado do evento.
   *
   * Registra pagamentos vinculados a inscrições via `codigo_unico` (UUID),
   * suportando múltiplos gateways de pagamento, marcação manual por
   * administradores e armazenamento do payload bruto do gateway em `jsonb`.
   * A operação é idempotente — não falha se a tabela já existir.
   *
   * @param slug - Nome do schema onde a tabela será criada.
   *
   * @remarks
   * **Deve ser chamada após {@link criarTabelaInscricoes}**, pois possui
   * uma foreign key para `slug.inscricoes.codigo_unico`.
   *
   * @example
   * ```ts
   * await repo.criarTabelaPagamentos('retiro-2025');
   * // Cria: retiro-2025.pagamentos vinculada a retiro-2025.inscricoes
   * ```
   */
  async criarTabelaPagamentos(slug: string) {
    await this.db.schema
      .withSchema(slug)
      .createTable('pagamentos')
      .ifNotExists()
      .addColumn('id', 'serial', (col) => col.primaryKey())
      .addColumn('inscricao_codigo', 'uuid', (col) =>
        col.notNull().references(`${slug}.inscricoes.codigo_unico`).onDelete('cascade')
      )
      .addColumn('tipo', 'text', (col) => col.notNull())
      .addColumn('modalidade', 'text')
      .addColumn('gateway', 'text')
      .addColumn('gateway_id', 'text')
      .addColumn('status', 'text', (col) => col.notNull())
      .addColumn('valor', sql`decimal(10,2)`)
      .addColumn('payload_raw', sql`jsonb`)
      .addColumn('marcado_manual', 'boolean', (col) => col.defaultTo(false))
      .addColumn('data_pagamento', 'date')
      .addColumn('forma_pagamento', 'text')
      .addColumn('observacao', 'text')
      .addColumn('marcado_por', 'integer', (col) =>
        col.references('_meta.usuarios_admin.id')
      )
      .addColumn('criado_em', 'timestamp', (col) => col.defaultTo(sql`now()`))
      .execute();
  }

  /**
   * Converte um {@link Campo} do domínio para uma coluna Kysely tipada,
   * adicionando-a ao builder da tabela em construção.
   *
   * Realiza o mapeamento entre os tipos de domínio (`string`, `number`, `boolean`, `date`, `email`)
   * e os tipos nativos do PostgreSQL (`text`, `integer`, `boolean`, `date`).
   * Tipos não mapeados explicitamente assumem `text` como fallback seguro.
   *
   * | Tipo do campo | Tipo PostgreSQL |
   * |---------------|----------------|
   * | `number`      | `integer`       |
   * | `boolean`     | `boolean`       |
   * | `date`        | `date`          |
   * | `string`      | `text`          |
   * | `email`       | `text`          |
   * | _(outros)_    | `text`          |
   *
   * @param builder - Builder Kysely da tabela em construção.
   * @param campo   - Campo de domínio a ser adicionado como coluna.
   * @returns O mesmo builder com a nova coluna adicionada, permitindo encadeamento.
   */
  private adicionarColunaKysely(
    builder: CreateTableBuilder<string, never>,
    campo: Campo,
  ) {
    let tipo: ColumnDataType;

    switch (campo.tipo) {
      case 'number':
        tipo = 'integer';
        break;
      case 'boolean':
        tipo = 'boolean';
        break;
      case 'date':
        tipo = 'date';
        break;
      case 'string':
      case 'email':
      default:
        tipo = 'text';
    }

    return builder.addColumn(campo.nome, tipo, (col) =>
      campo.obrigatorio ? col.notNull() : col,
    );
  }

  /**
   * Define um evento como padrão de forma atômica, garantindo que apenas
   * um evento seja o padrão por vez.
   *
   * Envolve {@link redefinirPadrao} e {@link definirPadraoId} em uma única
   * transação — se qualquer operação falhar, ambas são revertidas automaticamente,
   * evitando estados inconsistentes (nenhum ou múltiplos eventos padrão).
   *
   * @param id - Identificador único do evento a ser definido como padrão.
   * @throws {NoResultError} Se nenhum evento com o `id` fornecido for encontrado.
   *
   * @remarks
   * Prefira sempre este método em vez de chamar {@link redefinirPadrao} e
   * {@link definirPadraoId} separadamente, pois chamadas separadas não são
   * atômicas e podem deixar o sistema sem nenhum evento padrão em caso de falha.
   *
   * @example
   * ```ts
   * await repo.definirPadraoTransacional(7);
   * // Garante: todos os outros eventos com padrao = false, evento 7 com padrao = true
   * ```
   */
  async definirPadraoTransacional(id: number) {
    await this.db.transaction().execute(async (trx) => {
      await trx.updateTable("_meta.eventos").set({ padrao: false }).execute();
      await trx
        .updateTable("_meta.eventos")
        .set({ padrao: true })
        .where("id", "=", id)
        .executeTakeFirstOrThrow();
    });
  }
}