import { Kysely } from "kysely";
import { ColunasSchemaTable, Database } from "../../types";

/**
 * Repositório responsável pelas operações de persistência da tabela `_meta.colunas_schema`.
 *
 * Encapsula todas as queries do banco de dados relacionadas a colunas de schema,
 * seguindo o padrão Repository — mantendo a lógica de acesso a dados isolada
 * da camada de serviço.
 *
 * @example
 * ```ts
 * const repo = new SchemaRepository({ bd: db });
 *
 * const coluna = await repo.criar({ evento_id: 1, nome: 'email', ordem: 0 });
 * const colunas = await repo.acharPorEventoId(1);
 * ```
 */
export class SchemaRepository {
  private db: Kysely<Database>;
  constructor({ bd }: { bd: Kysely<Database> }) {
    this.db = bd;
  }

  /**
   * Insere uma nova coluna de schema no banco de dados.
   *
   * @param data - Dados da coluna a ser criada. O campo `id` é omitido pois é gerado automaticamente pelo banco.
   * @returns A coluna recém-criada com todos os campos, incluindo o `id` gerado.
   * @throws {NoResultError} Se a inserção não retornar nenhum registro.
   *
   * @example
   * ```ts
   * const coluna = await repo.criar({
   *   evento_id: 1,
   *   nome: 'email',
   *   ordem: 0,
   * });
   * console.log(coluna.id); // 42
   * ```
   */
  async criar(data: Omit<ColunasSchemaTable, "id">) {
    return this.db
      .insertInto("_meta.colunas_schema")
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  /**
   * Busca uma coluna de schema pelo seu identificador único.
   *
   * @param id - Identificador único da coluna.
   * @returns A coluna encontrada, ou `undefined` se não existir.
   *
   * @example
   * ```ts
   * const coluna = await repo.acharPorId(42);
   *
   * if (!coluna) {
   *   throw new Error('Coluna não encontrada');
   * }
   * ```
   */
  async acharPorId(id: number) {
    return this.db
      .selectFrom("_meta.colunas_schema")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst();
  }

  /**
   * Busca todas as colunas de schema associadas a um evento, ordenadas pelo campo `ordem`.
   *
   * Utilizado para reconstruir a estrutura de um schema dinâmico na ordem
   * correta de exibição.
   *
   * @param eventoId - Identificador do evento cujas colunas serão buscadas.
   * @returns Lista de colunas ordenadas por `ordem` de forma ascendente. Retorna array vazio se nenhuma for encontrada.
   *
   * @example
   * ```ts
   * const colunas = await repo.acharPorEventoId(1);
   * // [
   * //   { id: 1, evento_id: 1, nome: 'nome', ordem: 0 },
   * //   { id: 2, evento_id: 1, nome: 'email', ordem: 1 },
   * // ]
   * ```
   */
  async acharPorEventoId(eventoId: number) {
    return this.db
      .selectFrom("_meta.colunas_schema")
      .selectAll()
      .where("evento_id", "=", eventoId)
      .orderBy("ordem", "asc")
      .execute();
  }

  /**
   * Atualiza parcialmente uma coluna de schema existente.
   *
   * Aceita um subconjunto dos campos de `ColunasSchemaTable` (exceto `id`),
   * permitindo atualizações parciais sem sobrescrever campos não informados.
   *
   * @param id - Identificador único da coluna a ser atualizada.
   * @param data - Campos a serem atualizados.
   * @returns A coluna atualizada com todos os campos.
   * @throws {NoResultError} Se nenhum registro com o `id` fornecido for encontrado.
   *
   * @example
   * ```ts
   * const atualizada = await repo.update(42, { ordem: 3 });
   * console.log(atualizada.ordem); // 3
   * ```
   */
  async update(id: number, data: Partial<Omit<ColunasSchemaTable, "id">>) {
    return this.db
      .updateTable("_meta.colunas_schema")
      .set(data)
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  /**
   * Remove uma coluna de schema pelo seu identificador único.
   *
   * @param id - Identificador único da coluna a ser removida.
   * @returns O registro deletado, ou `undefined` se nenhum registro com o `id` fornecido for encontrado.
   *
   * @example
   * ```ts
   * const deletada = await repo.deletar(42);
   *
   * if (!deletada) {
   *   console.warn('Nenhuma coluna encontrada para deletar');
   * }
   * ```
   */
  async deletar(id: number) {
    return this.db
      .deleteFrom("_meta.colunas_schema")
      .where("id", "=", id)
      .executeTakeFirst();
  }

  /**
   * Retorna todas as colunas de schema cadastradas no banco de dados.
   *
   * @returns Lista com todas as colunas. Retorna array vazio se não houver nenhuma.
   *
   * @remarks
   * Use com cautela em ambientes de produção — sem paginação, esta query
   * pode retornar um volume muito grande de registros.
   *
   * @example
   * ```ts
   * const todas = await repo.acharTodos();
   * console.log(`${todas.length} colunas encontradas`);
   * ```
   */
  async acharTodos() {
    return this.db
      .selectFrom("_meta.colunas_schema")
      .selectAll()
      .execute();
  }
}