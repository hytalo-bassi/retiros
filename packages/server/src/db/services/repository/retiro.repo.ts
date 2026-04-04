import { Kysely } from "kysely";
import { Database } from "../../types";
import { logger } from "../../../logger";
import { MetaRepository } from "./meta.repo";

type InscricaoResult = {
  ok: boolean;
  motivo?: "congregacao_not_found" | "schema_not_found" | "server_error";
  dados: { codigo: string } | null;
  error?: unknown;
};

export class RetiroRepository {
  private db: Kysely<Database>;
  private metaRepo: MetaRepository;
  
  constructor({ bd, metaRepo }: { bd: Kysely<Database>; metaRepo: MetaRepository }) {
    this.db = bd;
    this.metaRepo = metaRepo;
  }

  async inscrever(
    slug: string,
    data: { congregacao: string; [key: string]: unknown },
  ): Promise<InscricaoResult> {
    const { congregacao, ...restoDados } = data;

    try {
      const congregacaoExiste = await this.db
        .selectFrom("_meta.congregacoes")
        .where("nome", "=", congregacao)
        .select("nome")
        .executeTakeFirst();

      if (!congregacaoExiste) {
        return { ok: false, motivo: "congregacao_not_found", dados: null };
      }

      const schemaExiste = await this.db
        .selectFrom("information_schema.schemata" as any)
        .where("schema_name", "=", slug)
        .select("schema_name")
        .executeTakeFirst();

      if (!schemaExiste) {
        return { ok: false, motivo: "schema_not_found", dados: null };
      }

      logger.info(
        "TODO: É necessário garantir que exista ou email ou CPF, e que sejam únicos. Isso deve ser garantido tanto no frontend quanto aqui no backend.",
      );
      
      const congregacao_id = await this.metaRepo.pegarIdCongregacao(congregacao);

      const res = (await this.db
        .withSchema(slug)
        .insertInto(`${slug}.inscricoes` as any)
        .values({ congregacao_id, ...restoDados })
        .returning("codigo_unico as codigo_unico")
        .executeTakeFirstOrThrow()) as { codigo_unico: string };

      return {
        ok: true,
        dados: {
          codigo: res.codigo_unico,
        },
      };
    } catch (error) {
      return { ok: false, motivo: "server_error", dados: null, error };
    }
  }

  async validarDocumento(slug: string, documento: string, email: string) {
    const res = await this.db
      .withSchema(slug)
      .selectFrom("inscricoes" as any)
      .where((eb) =>
        eb.or([eb("documento", "=", documento), eb("email", "=", email)]),
      )
      .executeTakeFirst();

    if (res) {
      return false;
    }

    return true;
  }
}
