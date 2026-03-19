import { iniciarBd, pegarBd } from "./db/database";
import express from "express";
import { router as healthRouter } from "./routes/health";
import { health } from "./health";
import cors from "cors";
import { logger } from "./logger";
import { requestLoggerMiddleware } from "./middlewares/requestLogger";
import { errorHandler } from "./middlewares/errorHandler";

/**
 * Encerra o sistema de forma controlada ao receber um sinal do sistema operacional.
 *
 * Garante que todas as conexões abertas sejam finalizadas corretamente antes
 * de sair — evitando requisições HTTP interrompidas e conexões de banco
 * de dados penduradas.
 *
 * A ordem de encerramento é intencional:
 * 1. Para o servidor HTTP — rejeita novas conexões, aguarda as ativas terminarem
 * 2. Destrói o pool de conexões com o banco
 * 3. Encerra o processo com código `0` (sucesso)
 *
 * @param signal - Nome do sinal recebido (`SIGINT` ou `SIGTERM`), usado apenas para log.
 *
 * @example
 * ```ts
 * process.on('SIGINT', () => gracefulShutdown('SIGINT'));   // Ctrl+C, desenvolvimento
 * process.on('SIGTERM', () => gracefulShutdown('SIGTERM')); // Docker, Kubernetes, PM2
 * ```
 */
async function gracefulShutdown(signal: string) {
  logger.info(`Recebido ${signal}. Encerrando sistema...`);
  webServer.close();
  await pegarBd().destroy();
  process.exit(0);
}

/**
 * Porta HTTP do servidor. Configurável via variável de ambiente `WEB_PORT`.
 * @default 3000
 */
const webPort = parseInt(process.env.WEB_PORT || "3000", 10);

const app = express();

// ---------------------------------------------------------------------------
// Inicialização do banco de dados
// Notifica o sistema de health sobre o resultado da conexão.
// Se falhar, `health.quandoDegradado` será disparado e o processo encerrado.
// ---------------------------------------------------------------------------
iniciarBd()
  .then(() => health.set('db', 'healthy'))
  .catch((err) => health.set('db', 'error', err));

// ---------------------------------------------------------------------------
// Middlewares globais
// Ordem importa: requestLogger deve vir antes de express.json() para garantir
// que todas as requisições sejam logadas, inclusive as malformadas.
// ---------------------------------------------------------------------------
app.use(requestLoggerMiddleware);
app.use(cors({
  origin: process.env.CLIENT_URL,
}));
app.use(express.json());

// ---------------------------------------------------------------------------
// Rotas sempre disponíveis
// /health é registrado imediatamente, antes do sistema estar saudável,
// para que load balancers e orquestradores possam monitorar a inicialização.
// ---------------------------------------------------------------------------
app.use('/health', healthRouter);

// ---------------------------------------------------------------------------
// Inicialização do servidor HTTP
// Notifica o sistema de health sobre o resultado da abertura da porta.
// ---------------------------------------------------------------------------
const webServer = app.listen(webPort, () => {
  logger.info(`Servidor rodando em ${webPort}`);
  health.set("web", "healthy");
}).on("error", (error: Error) => {
  health.set("web", "error", error);
});

// ---------------------------------------------------------------------------
// Rotas protegidas — carregadas apenas quando o sistema está 100% saudável
//
// O import dinâmico de adminRouter é intencional: garante que as rotas de
// admin só sejam registradas após banco de dados e servidor estarem prontos,
// evitando requisições em um sistema parcialmente inicializado.
// ---------------------------------------------------------------------------
health.quandoSaudavel(async () => {
  const { router: adminRouter } = await import("./routes/admin");
  app.use(`/admin`, adminRouter);

  // necessário tomar cuidado com esta forma de gerenciar os erros, pois
  // se um dia houver mais pontos de inicialização de rotas ou middlewares, pode ser
  // fácil esquecer de adicionar.
  app.use(errorHandler);
  
  logger.info('Sistema saudável — rotas de admin registradas');
});

// ---------------------------------------------------------------------------
// Sistema degradado — encerra o processo
//
// Disparado quando qualquer serviço monitorado entra em estado de erro.
// O código de saída não-zero sinaliza ao orquestrador (ex.: Docker, PM2)
// que o processo deve ser reiniciado.
// ---------------------------------------------------------------------------
health.quandoDegradado(() => {
  logger.error('Sistema degradado. Parando sistema...');
  process.exit(1);
});

// ---------------------------------------------------------------------------
// Sinais de encerramento do processo
// ---------------------------------------------------------------------------

/**
 * Loga o momento exato de encerramento do processo.
 * Executado ao final de qualquer encerramento, seja por SIGINT, SIGTERM ou erro.
 */
process.on('exit', () => {
  logger.info({ timestamp: new Date().toISOString() }, 'Sistema encerrado.');
});

process.on('SIGINT', () => gracefulShutdown('SIGINT'));   // Ctrl+C / desenvolvimento
process.on('SIGTERM', () => gracefulShutdown('SIGTERM')); // Docker / Kubernetes / PM2