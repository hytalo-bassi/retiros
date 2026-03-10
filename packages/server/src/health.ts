import { logger } from "./logger";

/** Status possíveis de um serviço individual. */
export type StatusServico = 'healthy' | 'loading' | 'error';

/**
 * Status agregado do sistema:
 * - `healthy`  — todos os serviços operacionais.
 * - `degraded` — ao menos um serviço com erro.
 * - `loading`  — ao menos um serviço ainda inicializando.
 */
export type StatusServicoGeral = 'healthy' | 'degraded' | 'loading';

/** Mapa de serviços monitorados e seus respectivos status. */
export type Servicos = {
  db: StatusServico;
};

/**
 * Gerencia o estado de saúde da aplicação em tempo de execução.
 *
 * Agrega o status de cada serviço em `Servicos`, calcula um status global
 * do sistema e dispara callbacks registrados no momento em que todos os
 * serviços atingem o estado `healthy`.
 *
 * @example
 * ```ts
 * health.quandoSaudavel(() => iniciarServidor());
 *
 * iniciarBd()
 *   .then(() => health.setBd('healthy'))
 *   .catch(() => health.setBd('error'));
 * ```
 */
export class Health {
  /** Estado atual de cada serviço monitorado. */
  private servicos: Servicos = {
    db: 'loading',
  };

  /** Fila de funções aguardando o sistema ficar saudável. */
  private callbacks: Array<() => void> = [];

  /** Fila de funções aguardando o sistema ficar degradado. */
  private callbacksDegradados: Array<() => void> = [];

  /**
   * Atualiza o status do serviço de banco de dados.
   *
   * Após a atualização, tenta liberar automaticamente os callbacks pendentes
   * caso o sistema inteiro esteja saudável.
   *
   * @param status - Novo status do banco de dados.
   * @param error  - Erro associado à falha de conexão, se aplicável. Será impresso automaticamente.
   *
   * @example
   * ```ts
   * health.setBd('healthy'); // banco pronto
   * health.setBd('error', new Error('Falha na conexão'));// falha na conexão
   * ```
   */
  setBd(status: StatusServico, error?: Error): void {
    this.servicos.db = status;
    if (error) {
      logger.error(`Banco de dados falhou: ${error.message}`);
    }
    this.tryFlush();
  }

  /**
   * Calcula o status agregado do sistema com base em todos os serviços.
   *
   * A precedência de avaliação é:
   * 1. Qualquer serviço `loading`  → retorna `loading`
   * 2. Todos os serviços `healthy` → retorna `healthy`
   * 3. Caso contrário              → retorna `degraded`
   *
   * @returns O status global atual do sistema.
   */
  private statusSistema(): StatusServicoGeral {
    const statuses = Object.values(this.servicos) as StatusServico[];

    if (statuses.some((s) => s === 'loading')) return 'loading';
    if (statuses.every((s) => s === 'healthy')) return 'healthy';
    return 'degraded';
  }

  /**
   * Verifica se o sistema está completamente operacional.
   *
   * @returns `true` quando todos os serviços reportam `healthy`; `false` caso contrário.
   *
   * @example
   * ```ts
   * if (health.eSaudavel()) {
   *   console.log('Sistema pronto para receber requisições.');
   * }
   * ```
   */
  eSaudavel(): boolean {
    return this.statusSistema() === 'healthy';
  }

  /**
   * Executa e esvazia a fila de callbacks pendentes, desde que o sistema esteja saudável ou degradado.
   *
   * Invocado internamente após cada mudança de status para garantir que nenhum
   * callback fique preso na fila após o sistema atingir `healthy` ou `degraded`.
   */
  private tryFlush(): void {
    const status = this.statusSistema();
    switch (status) {
      case 'degraded':
        const pendingDegradados = this.callbacksDegradados.splice(0);
        for (const fn of pendingDegradados) fn();
        break;
      case 'healthy':
        const pending = this.callbacks.splice(0);
        for (const fn of pending) fn();
        break;
      default:
        return; // Não processa callbacks enquanto o sistema estiver carregando
    }
  }

  /**
   * Serializa o estado atual para uso em endpoints de health check (ex.: `GET /health`).
   *
   * @returns Objeto com o status global e o status individual de cada serviço.
   *
   * @example
   * ```ts
   * // Resposta típica de um endpoint de health check:
   * // { "status": "healthy", "servicos": { "db": "healthy" } }
   * res.json(health.toJSON());
   * ```
   */
  toJSON() {
    return {
      status: this.statusSistema(),
      servicos: { ...this.servicos },
    };
  }

  /**
   * Registra um callback para execução assim que o sistema estiver saudável.
   *
   * Se o sistema já estiver saudável no momento da chamada, o callback é
   * executado imediatamente e de forma síncrona. Caso contrário, é enfileirado
   * e executado na próxima vez que `tryFlush` for disparado.
   *
   * @param fn - Função a ser executada quando `eSaudavel()` retornar `true`.
   *
   * @example
   * ```ts
   * health.quandoSaudavel(() => {
   *   server.listen(3000);
   *   console.log('Servidor iniciado na porta 3001.');
   * });
   * ```
   */
  quandoSaudavel(fn: () => void): void {
    if (this.eSaudavel()) {
      fn();
    } else {
      this.callbacks.push(fn);
    }
  }

  /**
   * Registra um callback para execução assim que o sistema estiver degradado. Completo oposto de `quandoSaudavel`.
   *
   * Se o sistema já estiver degradado no momento da chamada, o callback é
   * executado imediatamente e de forma síncrona. Caso contrário, é enfileirado
   * e executado na próxima vez que `tryFlush` for disparado.
   *
   * @param fn - Função a ser executada quando `statusSistema()` retornar `degraded`.
   *
   * @example
   * ```ts
   * health.quandoDegradado(() => {
   *   bd.fechar();
   *   console.log('Conexão ao banco de dados fechada completamente.');
   * });
   * ```
   */
  quandoDegradado(fn: () => void): void {
    if (this.statusSistema() === 'degraded') {
      fn();
    } else {
      this.callbacksDegradados.push(fn);
    }
  }
}

/**
 * Instância singleton imutável de {@link Health}, compartilhada por toda a aplicação.
 *
 * O `Object.freeze` impede substituição acidental da instância em runtime,
 * garantindo uma única fonte de verdade para o estado de saúde do sistema.
 *
 * @example
 * ```ts
 * import { health } from './health';
 *
 * health.quandoSaudavel(() => startServer());
 * health.setBd('healthy');
 * ```
 */
export const health = Object.freeze(new Health());