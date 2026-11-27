/**
 * Unit tests for AQI service.
 *
 * Tests fetchAqiData caching, response mapping, error handling,
 * and upstream API failures with mocked global fetch.
 */

import { UpstreamApiError } from '@server/errors/app-errors.js';
import { clearAqiCache, fetchAqiData } from '@server/services/aqi.service.js';
import { assertAllowedUpstreamUrl } from '@server/services/http-client.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('fetchAqiData', () => {
  const mockFetch = vi.fn();

  const validOpenMeteoPayload = {
    current: {
      time: '2026-01-15T12:00:00Z',
      us_aqi: 85,
      pm2_5: 35.4,
      pm10: 45.2,
      nitrogen_dioxide: 22.1,
      ozone: 30.5,
      sulphur_dioxide: 10.2,
      carbon_monoxide: 450.0,
    },
  };

  beforeEach(() => {
    clearAqiCache();
    mockFetch.mockReset();
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    clearAqiCache();
  });

  it('fetches AQI data on cache miss and maps pollutants and dominant pollutant', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => Promise.resolve(validOpenMeteoPayload),
    });

    const data = await fetchAqiData(28.6139, 77.209);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(data.aqi).toBe(85);
    expect(data.category).toBe('Moderate');
    expect(data.timestamp).toBe('2026-01-15T12:00:00Z');
    expect(data.dominantPollutant).toBe('carbon_monoxide');
    expect(data.pollutants).toHaveLength(6);

    const pm25 = data.pollutants.find((p) => p.name === 'pm2_5');
    expect(pm25).toBeDefined();
    expect(pm25?.displayName).toBe('PM2.5');
    expect(pm25?.value).toBe(35.4);
    expect(pm25?.unit).toBe('µg/m³');
  });

  it('returns cached data on cache hit without calling fetch again', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => Promise.resolve(validOpenMeteoPayload),
    });

    const first = await fetchAqiData(28.6139, 77.209);
    const second = await fetchAqiData(28.6141, 77.2089);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(second).toEqual(first);
  });

  it('throws UpstreamApiError when API returns non-OK status', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 503,
    });

    await expect(fetchAqiData(28.61, 77.2)).rejects.toThrow(UpstreamApiError);
  });

  it('throws UpstreamApiError when API returns an invalid payload', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => Promise.resolve({ unexpected: 'payload' }),
    });

    await expect(fetchAqiData(28.61, 77.2)).rejects.toThrow(UpstreamApiError);
  });

  it('propagates timeout error when fetch request times out', async () => {
    const timeoutError = new Error('The operation was aborted due to timeout');
    timeoutError.name = 'TimeoutError';
    mockFetch.mockRejectedValueOnce(timeoutError);

    await expect(fetchAqiData(28.61, 77.2)).rejects.toThrow(timeoutError);
  });

  it('throws UpstreamApiError when upstream response body is malformed JSON', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => Promise.reject(new SyntaxError('Unexpected token')),
    });

    await expect(fetchAqiData(28.61, 77.2)).rejects.toThrow(
      'Air Quality API returned malformed JSON',
    );
  });

  it('enforces HTTPS and upstream host allowlist against SSRF', () => {
    expect(() =>
      assertAllowedUpstreamUrl('https://air-quality-api.open-meteo.com/v1/air-quality'),
    ).not.toThrow();
    expect(() =>
      assertAllowedUpstreamUrl('http://air-quality-api.open-meteo.com/v1/air-quality'),
    ).toThrow(UpstreamApiError);
    expect(() => assertAllowedUpstreamUrl('https://169.254.169.254/latest/meta-data')).toThrow(
      UpstreamApiError,
    );
    expect(() => assertAllowedUpstreamUrl('not-a-valid-url')).toThrow(UpstreamApiError);
  });
});
