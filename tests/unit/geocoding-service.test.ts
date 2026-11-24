/**
 * Unit tests for Geocoding service.
 *
 * Tests searchCities caching, mapping, empty results,
 * and error handling with mocked global fetch.
 */

import { UpstreamApiError } from '@server/errors/app-errors.js';
import { clearGeocodingCache, searchCities } from '@server/services/geocoding.service.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('searchCities', () => {
  const mockFetch = vi.fn();

  const validGeoPayload = {
    results: [
      {
        id: 1,
        name: 'Paris',
        admin1: 'Ile-de-France',
        country: 'France',
        country_code: 'FR',
        latitude: 48.8566,
        longitude: 2.3522,
      },
    ],
  };

  beforeEach(() => {
    clearGeocodingCache();
    mockFetch.mockReset();
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    clearGeocodingCache();
  });

  it('searches cities successfully and maps results', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => Promise.resolve(validGeoPayload),
    });

    const results = await searchCities('Paris');

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(results).toHaveLength(1);
    expect(results[0]).toEqual({
      id: 1,
      name: 'Paris',
      admin1: 'Ile-de-France',
      country: 'France',
      countryCode: 'FR',
      latitude: 48.8566,
      longitude: 2.3522,
    });
  });

  it('returns cached results on repeated queries', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => Promise.resolve(validGeoPayload),
    });

    const first = await searchCities('Paris');
    const second = await searchCities('  paris  ');

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(second).toEqual(first);
  });

  it('returns empty array when upstream returns no results', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => Promise.resolve({ results: [] }),
    });

    const results = await searchCities('NonexistentPlace123');
    expect(results).toEqual([]);
  });

  it('throws UpstreamApiError when API returns non-OK status', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
    });

    await expect(searchCities('Berlin')).rejects.toThrow(UpstreamApiError);
  });

  it('throws UpstreamApiError when API returns an invalid payload', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => Promise.resolve({ results: 'invalid-shape' }),
    });

    await expect(searchCities('Rome')).rejects.toThrow(UpstreamApiError);
  });

  it('propagates timeout error when upstream fetch times out', async () => {
    const timeoutError = new Error('The operation was aborted due to timeout');
    timeoutError.name = 'TimeoutError';
    mockFetch.mockRejectedValueOnce(timeoutError);

    await expect(searchCities('Tokyo')).rejects.toThrow(timeoutError);
  });
});
