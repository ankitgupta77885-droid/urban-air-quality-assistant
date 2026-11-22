/**
 * Security middleware integration tests.
 */

import type { ApiResponse } from '@shared/types.js';
import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { createApp } from '../../src/server/app.js';

describe('Security Middleware - CORS allowlist', () => {
  const app = createApp({ geminiApiKey: 'test-key', geminiModel: 'test-model' });

  it('should allow requests from allowed origins (localhost:5173)', async () => {
    const res = await request(app)
      .get('/api/geocoding/search?q=London')
      .set('Origin', 'http://localhost:5173');

    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5173');
  });

  it('should not allow untrusted origins not in the allowlist', async () => {
    const res = await request(app)
      .get('/api/geocoding/search?q=London')
      .set('Origin', 'http://evil.com');

    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('should enforce strict style-src without unsafe-inline in Content-Security-Policy', async () => {
    const res = await request(app).get('/api/geocoding/search?q=London');

    const csp = res.headers['content-security-policy'] as string;
    expect(csp).toBeDefined();
    expect(csp).toContain("style-src 'self'");
    expect(csp).not.toContain("'unsafe-inline'");
  });

  it('should return safe generic error message on malformed JSON without leaking parser internals', async () => {
    const res = await request(app)
      .post('/api/advice')
      .set('Content-Type', 'application/json')
      .send('{"bad": json}');
    const body = res.body as ApiResponse<unknown>;

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error).toBe('Invalid request payload.');
  });

  it('should return safe generic error message when payload exceeds size limit', async () => {
    const res = await request(app)
      .post('/api/advice')
      .set('Content-Type', 'application/json')
      .send({ data: 'x'.repeat(20_000) });
    const body = res.body as ApiResponse<unknown>;

    expect(res.status).toBe(413);
    expect(body.success).toBe(false);
    expect(body.error).toBe('Request payload too large.');
  });
});
