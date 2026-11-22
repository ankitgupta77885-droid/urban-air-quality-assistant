/**
 * Unit tests for environment configuration loading.
 *
 * Verifies that native .env loading is attempted via process.loadEnvFile,
 * errors are caught gracefully, and env schema validation functions correctly.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { loadEnvConfig } from '../../src/server/config/env.js';

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
});
