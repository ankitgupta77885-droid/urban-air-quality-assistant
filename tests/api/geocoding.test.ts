/**
 * API tests for the geocoding endpoint.
 *
 * Tests GET /api/geocoding/search with mocked Open-Meteo API.
 */

import type { ApiResponse, GeocodingResult } from '@shared/types.js';
import supertest from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createApp } from '../../src/server/app.js';

/* ── Mock Setup ── */

const mockSearchCities = vi.fn();

vi.mock('../../src/server/services/geocoding.service.js', () => ({
  searchCities: (...args: unknown[]) => mockSearchCities(...args) as unknown,
}));

const app = createApp({ geminiApiKey: 'test-key', geminiModel: 'test-model' });
const request = supertest(app);

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  mockSearchCities.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

/* ── Tests ── */

describe('GET /api/geocoding/search', () => {
  it('should return geocoding results for a valid query', async () => {
    mockSearchCities.mockResolvedValue([
      {
        id: 1,
        name: 'Delhi',
        admin1: 'Delhi',
        country: 'India',
        countryCode: 'IN',
        latitude: 28.6139,
        longitude: 77.209,
      },
    ]);

    const res = await request.get('/api/geocoding/search?q=Delhi');
    const body = res.body as ApiResponse<GeocodingResult[]>;

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(1);
    expect(body.data?.[0]?.name).toBe('Delhi');
  });

  it('should return 400 for missing query', async () => {
    const res = await request.get('/api/geocoding/search');
    const body = res.body as ApiResponse<unknown>;

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
  });

  it('should return 400 for empty query', async () => {
    const res = await request.get('/api/geocoding/search?q=');
    const body = res.body as ApiResponse<unknown>;

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
  });

  it('should return 400 for query exceeding max length', async () => {
    const longQuery = 'a'.repeat(101);
    const res = await request.get(`/api/geocoding/search?q=${longQuery}`);
    const body = res.body as ApiResponse<unknown>;

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
  });

  it('should return empty array when no results found', async () => {
    mockSearchCities.mockResolvedValue([]);

    const res = await request.get('/api/geocoding/search?q=ZZZZZZZ');
    const body = res.body as ApiResponse<GeocodingResult[]>;

    expect(res.status).toBe(200);
    expect(body.data).toHaveLength(0);
  });

  it('should return 500 when external API fails', async () => {
    mockSearchCities.mockRejectedValue(new Error('API unavailable'));

    const res = await request.get('/api/geocoding/search?q=Delhi');
    const body = res.body as ApiResponse<unknown>;

    expect(res.status).toBe(500);
    expect(body.success).toBe(false);
  });
});
