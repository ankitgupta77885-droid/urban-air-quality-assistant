/**
 * API tests for the AQI endpoint.
 *
 * Tests GET /api/aqi with mocked Open-Meteo Air Quality API.
 */

import type { ApiResponse, AqiData } from '@shared/types.js';
import supertest from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createApp } from '../../src/server/app.js';

/* ── Mock Setup ── */

const mockFetchAqiData = vi.fn();

vi.mock('../../src/server/services/aqi.service.js', () => ({
  fetchAqiData: (...args: unknown[]) => mockFetchAqiData(...args) as unknown,
}));

const app = createApp({ geminiApiKey: 'test-key', geminiModel: 'test-model' });
const request = supertest(app);

beforeEach(() => {
  mockFetchAqiData.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

/* ── Tests ── */

describe('GET /api/aqi', () => {
  it('should return AQI data for valid coordinates', async () => {
    mockFetchAqiData.mockResolvedValue({
      aqi: 85,
      category: 'Moderate',
      pollutants: [{ name: 'pm2_5', displayName: 'PM2.5', value: 30, unit: 'µg/m³' }],
      dominantPollutant: 'pm2_5',
      timestamp: '2026-01-15T10:00:00Z',
    });

    const res = await request.get('/api/aqi?lat=28.6&lon=77.2');
    const body = res.body as ApiResponse<AqiData>;

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data?.aqi).toBe(85);
    expect(body.data?.category).toBe('Moderate');
  });

  it('should return 400 for missing coordinates', async () => {
    const res = await request.get('/api/aqi');
    const body = res.body as ApiResponse<unknown>;

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
  });

  it('should return 400 for invalid latitude', async () => {
    const res = await request.get('/api/aqi?lat=100&lon=77.2');
    const body = res.body as ApiResponse<unknown>;

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
  });

  it('should return 400 for invalid longitude', async () => {
    const res = await request.get('/api/aqi?lat=28.6&lon=200');
    const body = res.body as ApiResponse<unknown>;

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
  });

  it('should accept boundary coordinates', async () => {
    mockFetchAqiData.mockResolvedValue({
      aqi: 50,
      category: 'Good',
      pollutants: [],
      dominantPollutant: 'pm2_5',
      timestamp: '2026-01-15T10:00:00Z',
    });

    const res = await request.get('/api/aqi?lat=-90&lon=-180');
    const body = res.body as ApiResponse<AqiData>;

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
  });

  it('should return 500 when external API fails', async () => {
    mockFetchAqiData.mockRejectedValue(new Error('API unavailable'));

    const res = await request.get('/api/aqi?lat=28.6&lon=77.2');
    const body = res.body as ApiResponse<unknown>;

    expect(res.status).toBe(500);
    expect(body.success).toBe(false);
  });
});
