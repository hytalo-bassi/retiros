import pino from 'pino';

// Utiliza níveis de log padronizados do syslog
// https://datatracker.ietf.org/doc/html/rfc5424#page-10
const levels = {
  emerg: 80,
  alert: 70,
  crit: 60,
  error: 50,
  warn: 40,
  notice: 30,
  info: 20,
  debug: 10,
};

export const logger = pino({
  level: process.env.LOG_LEVEL ?? 'debug',
  transport: process.env.NODE_ENV !== 'production'
    ? { target: 'pino-pretty', options: { colorize: true } }
    : undefined,
  customLevels: levels,
  useOnlyCustomLevels: true,
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    },
  },
});
