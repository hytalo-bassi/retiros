import { Pool } from 'pg';
import { logger } from '../logger';
import { conferirEConstruirInfra } from './setup';
import { Kysely, PostgresDialect } from 'kysely';
import { Database } from './types';

/** Instância singleton da conexão com o banco de dados. `null` até `iniciarBd()` ser chamado. */
let _db: Kysely<Database> | null = null;

/**
 * Inicializa a conexão com o banco de dados e prepara a infraestrutura necessária.
 *
 * Na primeira chamada, valida a variável de ambiente, cria o pool de conexões,
 * testa a conectividade e executa {@link conferirEConstruirInfra} para garantir
 * que todos os schemas e tabelas existam. Chamadas subsequentes retornam a
 * instância já existente sem nenhuma operação adicional (singleton).
 *
 * @returns A instância do Kysely pronta para uso.
 *
 * @throws {Error} Se `DATABASE_URL` não estiver definida no ambiente.
 * @throws {Error} Se a conexão com o banco de dados falhar.
 *
 * @example
 * ```ts
 * // Na inicialização da aplicação, antes de registrar rotas ou consumidores:
 * const db = await iniciarBd();
 * ```
 */
export async function iniciarBd(): Promise<Kysely<Database>> {
  if (_db) return _db;

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('Variável de ambiente DATABASE_URL não definida. Resolva isso com `export DATABASE_URL=postgresql://<usuario>:<senha>@postgres:<porta>/retiros_setorh`');
  }

  logger.info('Conectando ao banco de dados...');

  const pool = new Pool({ connectionString });

  const testClient = await pool.connect().catch((err) => {
    throw new Error(`Não foi possível conectar ao banco de dados: ${err.message}`);
  });
  testClient.release();
  logger.info('Conexão estabelecida!');

  const db = new Kysely<Database>({
    dialect: new PostgresDialect({ pool }),
  });

  await conferirEConstruirInfra(db);

  _db = db;
  logger.info('Banco de dados pronto pra conexão');

  return _db;
}

/**
 * Retorna a instância ativa do banco de dados.
 *
 * Deve ser chamada apenas após {@link initDatabase} ter sido concluída com sucesso.
 * Projetada para uso em módulos que não controlam o ciclo de inicialização —
 * repositórios, serviços e handlers podem chamar `getDatabase()` diretamente
 * sem precisar receber a instância por injeção.
 *
 * @returns A instância singleton do Kysely.
 *
 * @throws {Error} Se chamada antes de `initDatabase()` ser concluída.
 *
 * @example
 * ```ts
 * import { getDatabase } from '../db';
 *
 * export async function listarEventos() {
 *   const db = pegarBd();
 *   return db.selectFrom('_meta.eventos').selectAll().execute();
 * }
 * ```
 */
export function pegarBd(): Kysely<Database> {
  if (!_db) {
    throw new Error('Banco de dados não inicializado — chame iniciarBd() primeiro');
  }
  return _db;
}