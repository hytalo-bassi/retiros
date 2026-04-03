import { Kysely, sql } from "kysely";
import { logger } from "../logger";
import type { Database } from "./types";

/**
 * Garante que um schema PostgreSQL existe, criando-o caso ainda não exista.
 *
 * Utiliza `CREATE SCHEMA IF NOT EXISTS` para ser idempotente — seguro de
 * chamar em toda inicialização sem risco de erro ou duplicação.
 *
 * @param db     - Instância do Kysely conectada ao banco de dados.
 * @param schema - Nome do schema a ser verificado/criado (ex.: `_meta`, `_sistema`).
 */
async function conferirEsquema(
  db: Kysely<Database>,
  schema: string,
): Promise<void> {
  await sql`CREATE SCHEMA IF NOT EXISTS ${sql.id(schema)}`.execute(db);
  logger.debug(`Esquema "${schema}" verificado.`);
}

/**
 * Garante que todas as tabelas do schema `_meta` existem no banco de dados.
 *
 * Cria as tabelas abaixo caso ainda não existam (`IF NOT EXISTS`), tornando
 * a função idempotente e segura para execução em toda inicialização:
 *
 * - `congregacoes`   — cadastro de congregações.
 * - `usuarios_admin` — administradores do sistema com controle de acesso.
 * - `eventos`        — eventos gerenciados pela plataforma.
 * - `colunas_schema` — definição dinâmica dos campos de formulário por evento.
 * - `audit_log`      — registro imutável de ações realizadas no sistema.
 *
 * @param db - Instância do Kysely conectada ao banco de dados.
 */
async function conferirTabelaMeta(db: Kysely<Database>): Promise<void> {
  await db.schema
    .withSchema("_meta")
    .createTable("congregacoes")
    .ifNotExists()
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("nome", "text", (col) => col.notNull())
    .execute();

  await db.schema
    .withSchema("_meta")
    .createTable("usuarios_admin")
    .ifNotExists()
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("nome", "text", (col) => col.notNull())
    .addColumn("login", "text", (col) => col.notNull().unique())
    .addColumn("senha_hash", "text", (col) => col.notNull())
    .addColumn("funcao", "text", (col) => col.notNull())
    .addColumn("ativo", "boolean", (col) => col.notNull().defaultTo(true))
    .addColumn("senha_inicial", "boolean", (col) =>
      col.notNull().defaultTo(true),
    )
    .addColumn("criado_em", "timestamp", (col) =>
      col.notNull().defaultTo(sql`NOW()`),
    )
    .addColumn("congregacao_id", "integer", (col) =>
      col.references("_meta.congregacoes.id"),
    )
    .addColumn("criado_por", "integer", (col) =>
      col.references("_meta.usuarios_admin.id"),
    )
    .execute();

  await db.schema
    .withSchema("_meta")
    .createTable("eventos")
    .ifNotExists()
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("slug", "text", (col) => col.notNull().unique())
    .addColumn("nome", "text", (col) => col.notNull())
    .addColumn("ativo", "boolean", (col) => col.notNull().defaultTo(true))
    .addColumn("padrao", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("inscricoes_abertas", "boolean", (col) =>
      col.notNull().defaultTo(false),
    )
    .addColumn("inscricoes_abertas_de", "timestamp")
    .addColumn("inscricoes_abertas_ate", "timestamp")
    .addColumn("criado_em", "timestamp", (col) =>
      col.notNull().defaultTo(sql`NOW()`),
    )
    .addColumn("criado_por", "integer", (col) =>
      col.references("_meta.usuarios_admin.id"),
    )
    .execute();

  await db.schema
    .withSchema("_meta")
    .createTable("colunas_schema")
    .ifNotExists()
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("evento_id", "integer", (col) =>
      col.notNull().references("_meta.eventos.id").onDelete("cascade"),
    )
    .addColumn("nome", "text", (col) => col.notNull())
    .addColumn("label", "text", (col) => col.notNull())
    .addColumn("tipo", "text", (col) => col.notNull())
    .addColumn("obrigatorio", "boolean", (col) => col.notNull().defaultTo(true))
    .addColumn("visibilidade", "text", (col) =>
      col.notNull().defaultTo("public"),
    )
    .addColumn("visivel_para", sql`text[]`)
    .addColumn("ordem", "integer", (col) => col.notNull().defaultTo(0))
    .execute();

  await db.schema
    .withSchema("_meta")
    .createTable("audit_log")
    .ifNotExists()
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("evento_slug", "text")
    .addColumn("usuario_id", "integer", (col) =>
      col.references("_meta.usuarios_admin.id"),
    )
    .addColumn("acao", "text", (col) => col.notNull())
    .addColumn("entidade", "text")
    .addColumn("entidade_id", "text")
    .addColumn("payload", "jsonb")
    .addColumn("ip", "text")
    .addColumn("criado_em", "timestamp", (col) =>
      col.notNull().defaultTo(sql`NOW()`),
    )
    .execute();

  logger.debug('Tabelas do esquema "_meta" verificadas.');
}

/**
 * Garante que todas as tabelas do schema `_sistema` existem no banco de dados.
 *
 * Cria as tabelas abaixo caso ainda não existam (`IF NOT EXISTS`):
 *
 * - `sessoes_jovens` — tokens de autenticação de inscritos para acesso ao portal.
 * - `documentos`     — arquivos enviados por inscritos ou líderes vinculados a um evento.
 *
 * @param db - Instância do Kysely conectada ao banco de dados.
 */
async function conferirTabelaSistema(db: Kysely<Database>): Promise<void> {
  await db.schema
    .withSchema("_sistema")
    .createTable("sessoes_jovens")
    .ifNotExists()
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("evento_slug", "text", (col) => col.notNull())
    .addColumn("token", "text", (col) => col.notNull().unique())
    .addColumn("expira_em", "timestamp", (col) => col.notNull())
    .addColumn("criado_em", "timestamp", (col) =>
      col.notNull().defaultTo(sql`NOW()`),
    )
    .addColumn("inscricao_codigo", "uuid", (col) => col.notNull())
    .execute();

  await db.schema
    .withSchema("_sistema")
    .createTable("documentos")
    .ifNotExists()
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("nome", "text", (col) => col.notNull())
    .addColumn("caminho", "text", (col) => col.notNull())
    .addColumn("enviado_por", "text", (col) => col.notNull())
    .addColumn("evento_slug", "text", (col) => col.notNull())
    .addColumn("inscricao_codigo", "uuid", (col) => col.notNull())
    .addColumn("lider_id", "integer", (col) =>
      col.references("_meta.usuarios_admin.id"),
    )
    .addColumn("enviado_em", "timestamp", (col) =>
      col.notNull().defaultTo(sql`NOW()`),
    )
    .execute();

  logger.debug('Tabelas do esquema "_sistema" verificadas.');
}

/**
 * Ponto de entrada para inicialização da infraestrutura do banco de dados.
 *
 * Executa em sequência a verificação e criação de todos os schemas e tabelas
 * necessários para o funcionamento da aplicação. Todas as operações são
 * idempotentes — podem ser chamadas repetidamente sem efeitos colaterais.
 *
 * Ordem de execução:
 * 1. Schema `_meta`    → tabelas de configuração e administração.
 * 2. Schema `_sistema` → tabelas de operação em tempo de execução.
 *
 * @param db - Instância do Kysely conectada ao banco de dados.
 * @throws  Propaga qualquer erro de conexão ou DDL lançado pelo Kysely/PostgreSQL.
 *
 * @example
 * ```ts
 * import { db } from './db';
 * import { conferirEConstruirInfra } from './setup';
 *
 * await conferirEConstruirInfra(db);
 * // Banco de dados pronto — seguro para iniciar a aplicação.
 * ```
 */
export async function conferirEConstruirInfra(
  db: Kysely<Database>,
): Promise<void> {
  logger.info("Conferindo estrutura do banco de dados...");

  await conferirEsquema(db, "_meta");
  await conferirTabelaMeta(db);

  await conferirEsquema(db, "_sistema");
  await conferirTabelaSistema(db);

  logger.info("Infraestrutura do banco de dados correta.");
}
