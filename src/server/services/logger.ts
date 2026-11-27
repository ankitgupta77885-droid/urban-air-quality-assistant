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

let currentLevel: LogLevel = 'info';

/**
 * Sets the active logging level.
 * @param level - Log level to set.
 */
export function setLogLevel(level: LogLevel): void {
  currentLevel = level;
}

/**
 * Gets the current active logging level.
 * @returns The active LogLevel.
 */
export function getLogLevel(): LogLevel {
  return currentLevel;
}

/**
 * Creates a namespaced logger instance.
 * @param namespace - Logger namespace for identifying the source module.
 */
export function createLogger(namespace: string): Record<LogLevel, (...args: unknown[]) => void> {
  const log = (level: LogLevel, ...args: unknown[]): void => {
    if (LOG_LEVELS[level] >= LOG_LEVELS[currentLevel]) {
      /* eslint-disable-next-line no-console -- Logger utility is the single authorized console sink */
      console[level](`[${namespace}]`, ...args);
    }
  };

  return {
    debug: (...args) => {
      log('debug', ...args);
    },
    info: (...args) => {
      log('info', ...args);
    },
    warn: (...args) => {
      log('warn', ...args);
    },
    error: (...args) => {
      log('error', ...args);
    },
  };
}
