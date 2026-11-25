/**
 * API tests for the health check endpoint.
 *
 * Tests GET /api/health returning status ok.
 */

import supertest from 'supertest';
import { describe, expect, it } from 'vitest';

import { createApp } from '../../src/server/app.js';

describe('GET /api/health', () => {
  const app = createApp({ geminiApiKey: 'test-key', geminiModel: 'test-model' });
  const request = supertest(app);

  it('should return 200 with status ok', async () => {
    const res = await request.get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('should configure trust proxy', () => {
    expect(app.get('trust proxy')).toBe(1);
  });
});
