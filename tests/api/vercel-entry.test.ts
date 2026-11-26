/**
 * Tests for the Vercel serverless entry point (api/index.ts).
 *
 * The entry must build the Express app from validated environment variables
 * and export it as the default handler. External services are mocked.
 */

import type { Express } from 'express';
import supertest from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../src/server/services/aqi.service.js', () => ({
  fetchAqiData: vi.fn(),
}));

vi.mock('../../src/server/services/gemini.service.js', () => ({
  personalizeAdvice: vi.fn(),
}));

/** Imports a fresh copy of the entry module so environment changes apply. */
async function loadEntry(): Promise<Express> {
  vi.resetModules();
  const module = await import('../../api/index.js');
  return module.default;
}

describe('Vercel entry point', () => {
  beforeEach(() => {
    vi.stubEnv('GEMINI_API_KEY', 'test-key');
    vi.stubEnv('GEMINI_MODEL', 'test-model');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('exports an Express handler that serves the health endpoint', async () => {
    const app = await loadEntry();
    const response = await supertest(app).get('/api/health');

    expect(typeof app).toBe('function');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  it('keeps the security headers on API responses', async () => {
    const app = await loadEntry();
    const response = await supertest(app).get('/api/health');

    expect(response.headers['content-security-policy']).toContain("img-src 'self' data:");
    expect(response.headers['x-content-type-options']).toBe('nosniff');
  });

  it('rejects invalid input with a validation error', async () => {
    const app = await loadEntry();
    const response = await supertest(app).get('/api/aqi?lat=999&lon=abc');

    expect(response.status).toBe(400);
  });

  it('fails fast when the Gemini API key is missing', async () => {
    vi.stubEnv('GEMINI_API_KEY', '');

    await expect(loadEntry()).rejects.toThrow();
  });
});
