import { Kysely } from "kysely";
import { Database } from "../../types";

export class MetaRepository {
  constructor(private db: Kysely<Database>) {}

  async listarCongregacoes() {
    return this.db.selectFrom("_meta.congregacoes").selectAll().execute();
  }

  async criarCongregacao(nome: string) {
    return this.db.insertInto("_meta.congregacoes").values({ nome }).execute();
  }

  async atualizarCongregacao(id: number, novo_nome: string) {
    return this.db
      .updateTable("_meta.congregacoes")
      .set({ nome: novo_nome })
      .where("id", "=", id)
      .execute();
  }

  async pegarIdCongregacao(nome: string) {
    const result = await this.db
      .selectFrom("_meta.congregacoes")
      .select("id")
      .where("nome", "=", nome)
      .executeTakeFirst();

    if (!result) {
      throw new Error("Congregação não encontrada");
    }
    return result.id;
  }

  async deletarCongregacao(id: number) {
    await this.db
      .deleteFrom("_meta.congregacoes")
      .where("id", "=", id)
      .execute();
  }
}
