/** Logger utility — thin wrapper around structured logging. */

import { z } from 'zod';

export const logLevelSchema = z.enum(['debug', 'info', 'warn', 'error']);
export type LogLevel = z.infer<typeof logLevelSchema>;

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const parsedLevel = logLevelSchema.safeParse(process.env['LOG_LEVEL']);
const currentLevel: LogLevel = parsedLevel.success ? parsedLevel.data : 'info';

/**
 * Creates a namespaced logger instance.
 * @param namespace - Logger namespace for identifying the source module.
 */
export function createLogger(namespace: string): Record<LogLevel, (...args: unknown[]) => void> {
  const shouldLog = (level: LogLevel): boolean => LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];

  return {
    /* eslint-disable no-console -- Logger utility is the single authorized console wrapper */
    debug: (...args: unknown[]) => {
      if (shouldLog('debug')) {
        console.debug(`[${namespace}]`, ...args);
      }
    },
    info: (...args: unknown[]) => {
      if (shouldLog('info')) {
        console.info(`[${namespace}]`, ...args);
      }
    },
    warn: (...args: unknown[]) => {
      if (shouldLog('warn')) {
        console.warn(`[${namespace}]`, ...args);
      }
    },
    error: (...args: unknown[]) => {
      if (shouldLog('error')) {
        console.error(`[${namespace}]`, ...args);
      }
    },
    /* eslint-enable no-console */
  };
}
