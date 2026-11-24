import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createLogger,
  getLogLevel,
  logLevelSchema,
  setLogLevel,
} from '../../src/server/services/logger.js';

describe('logger service', () => {
  let debugSpy: ReturnType<typeof vi.spyOn>;
  let infoSpy: ReturnType<typeof vi.spyOn>;
  let warnSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    setLogLevel('info');
    debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    setLogLevel('info');
    vi.restoreAllMocks();
  });

  it('validates log levels using logLevelSchema', () => {
    expect(logLevelSchema.safeParse('debug').success).toBe(true);
    expect(logLevelSchema.safeParse('info').success).toBe(true);
    expect(logLevelSchema.safeParse('warn').success).toBe(true);
    expect(logLevelSchema.safeParse('error').success).toBe(true);
    expect(logLevelSchema.safeParse('invalid').success).toBe(false);
  });

  it('gets and sets the active log level', () => {
    expect(getLogLevel()).toBe('info');
    setLogLevel('debug');
    expect(getLogLevel()).toBe('debug');
    setLogLevel('error');
    expect(getLogLevel()).toBe('error');
  });

  it('respects log level filtering', () => {
    const logger = createLogger('test-ns');

    setLogLevel('warn');
    logger.debug('debug message');
    logger.info('info message');
    logger.warn('warn message');
    logger.error('error message');

    expect(debugSpy).not.toHaveBeenCalled();
    expect(infoSpy).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledWith('[test-ns]', 'warn message');
    expect(errorSpy).toHaveBeenCalledWith('[test-ns]', 'error message');
  });

  it('logs debug and info messages when level is debug', () => {
    const logger = createLogger('debug-ns');

    setLogLevel('debug');
    logger.debug('debug-level detail');
    logger.info('info-level detail');

    expect(debugSpy).toHaveBeenCalledWith('[debug-ns]', 'debug-level detail');
    expect(infoSpy).toHaveBeenCalledWith('[debug-ns]', 'info-level detail');
  });
});
