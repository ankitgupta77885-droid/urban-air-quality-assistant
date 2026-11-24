/**
 * Unit tests for environment configuration loading.
 *
 * Verifies that native .env loading is attempted via process.loadEnvFile,
 * errors are caught gracefully, and env schema validation functions correctly.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { loadEnvConfig } from '../../src/server/config/env.js';
import { getLogLevel } from '../../src/server/services/logger.js';

describe('loadEnvConfig', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv, GEMINI_API_KEY: 'test-key' };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it('attempts to load .env using process.loadEnvFile', () => {
    const loadSpy = vi.spyOn(process, 'loadEnvFile').mockImplementation(() => {});

    loadEnvConfig();

    expect(loadSpy).toHaveBeenCalled();
  });

  it('handles missing .env gracefully when process.loadEnvFile throws', () => {
    vi.spyOn(process, 'loadEnvFile').mockImplementation(() => {
      throw new Error('ENOENT: no such file or directory');
    });

    const config = loadEnvConfig();
    expect(config.GEMINI_API_KEY).toBe('test-key');
  });

  it('throws descriptive error when required variables are missing', () => {
    delete process.env.GEMINI_API_KEY;
    vi.spyOn(process, 'loadEnvFile').mockImplementation(() => {});

    expect(() => loadEnvConfig()).toThrow('GEMINI_API_KEY');
  });

  it('parses comma-separated ALLOWED_ORIGINS into an array', () => {
    process.env.ALLOWED_ORIGINS = 'https://app.breathewell.com, https://preview.breathewell.com';
    vi.spyOn(process, 'loadEnvFile').mockImplementation(() => {});

    const config = loadEnvConfig();
    expect(config.ALLOWED_ORIGINS).toEqual([
      'https://app.breathewell.com',
      'https://preview.breathewell.com',
    ]);
  });

  it('defaults ALLOWED_ORIGINS to empty array when unset', () => {
    delete process.env.ALLOWED_ORIGINS;
    vi.spyOn(process, 'loadEnvFile').mockImplementation(() => {});

    const config = loadEnvConfig();
    expect(config.ALLOWED_ORIGINS).toEqual([]);
  });

  it('updates logger level from LOG_LEVEL config', () => {
    process.env.LOG_LEVEL = 'warn';
    vi.spyOn(process, 'loadEnvFile').mockImplementation(() => {});

    loadEnvConfig();
    expect(getLogLevel()).toBe('warn');
  });
});
