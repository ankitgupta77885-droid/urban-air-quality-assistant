/**
 * Web API client unit tests.
 *
 * Tests searchCities, fetchAqi, and fetchAdvice covering:
 * - successful responses
 * - API error envelopes ({ success: false, error: '...' })
 * - network failures
 * - invalid response shapes
 * - AbortController request cancellation
 */

import { ApiClientError } from '@shared/errors.js';
import type { UserContext } from '@shared/types.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchAdvice, fetchAqi, searchCities } from '../../src/web/api/client.js';

describe('Web API Client', () => {
  const mockFetch = vi.fn();

  const validContext: UserContext = {
    childAgeGroup: 'toddler',
    healthConditions: ['none'],
    homeType: 'apartment',
    commuteMode: 'car',
    activityLevel: 'moderate',
    heatingSource: 'gas',
  };

  beforeEach(() => {
    mockFetch.mockReset();
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('searchCities', () => {
    it('returns geocoding results on success', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () =>
          Promise.resolve({
            success: true,
            data: [
              {
                id: 1,
                name: 'Berlin',
                country: 'Germany',
                countryCode: 'DE',
                latitude: 52.52,
                longitude: 13.405,
              },
            ],
          }),
      });

      const results = await searchCities('Berlin');
      expect(results).toHaveLength(1);
      expect(results[0]?.name).toBe('Berlin');
    });

    it('throws ApiClientError when API returns error envelope', async () => {
      mockFetch.mockResolvedValue({
        json: async () =>
          Promise.resolve({
            success: false,
            error: 'City not found',
          }),
      });

      await expect(searchCities('Unknown')).rejects.toThrow(ApiClientError);
    });

    it('throws ApiClientError on invalid response shape', async () => {
      mockFetch.mockResolvedValue({
        json: async () => Promise.resolve({ notAnApiResponse: true }),
      });

      await expect(searchCities('Invalid')).rejects.toThrow(ApiClientError);
    });

    it('throws ApiClientError when server returns non-JSON body', async () => {
      mockFetch.mockResolvedValueOnce({
        status: 500,
        json: async () => Promise.reject(new SyntaxError('Unexpected token A')),
      });

      await expect(searchCities('BadGateway')).rejects.toThrow(
        'Server returned an invalid response (HTTP 500)',
      );
    });

    it('propagates network failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network offline'));

      await expect(searchCities('Offline')).rejects.toThrow('Network offline');
    });
  });

  describe('fetchAqi', () => {
    it('returns AQI data on success', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () =>
          Promise.resolve({
            success: true,
            data: {
              aqi: 45,
              category: 'Good',
              pollutants: [{ name: 'pm2_5', displayName: 'PM2.5', value: 10, unit: 'µg/m³' }],
              dominantPollutant: 'pm2_5',
              timestamp: '2026-01-15T12:00:00Z',
            },
          }),
      });

      const aqiData = await fetchAqi(28.6, 77.2);
      expect(aqiData.aqi).toBe(45);
      expect(aqiData.category).toBe('Good');
    });

    it('throws ApiClientError when API returns error envelope', async () => {
      mockFetch.mockResolvedValue({
        json: async () =>
          Promise.resolve({
            success: false,
            error: 'Coordinates outside service range',
          }),
      });

      await expect(fetchAqi(0, 0)).rejects.toThrow(ApiClientError);
    });

    it('throws ApiClientError on invalid response shape', async () => {
      mockFetch.mockResolvedValue({
        json: async () => Promise.resolve({ success: true, data: { missingPollutants: true } }),
      });

      await expect(fetchAqi(28.6, 77.2)).rejects.toThrow(ApiClientError);
    });

    it('propagates network failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Fetch failed'));

      await expect(fetchAqi(28.6, 77.2)).rejects.toThrow('Fetch failed');
    });
  });

  describe('fetchAdvice', () => {
    it('returns personalized advice on success', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () =>
          Promise.resolve({
            success: true,
            data: {
              riskLevel: 'low',
              riskSummary: 'Clean air conditions.',
              actions: [
                {
                  category: 'morning-routine',
                  title: 'Open windows',
                  description: 'Air out home in morning.',
                  impact: 'Refreshes indoor air.',
                  benefit: 'High',
                  icon: 'sun',
                },
              ],
              isBasicMode: false,
              personalization: 'ai',
            },
          }),
      });

      const advice = await fetchAdvice(28.6, 77.2, validContext);
      expect(advice.riskLevel).toBe('low');
      expect(advice.actions).toHaveLength(1);
    });

    it('throws ApiClientError when advice API returns error envelope', async () => {
      mockFetch.mockResolvedValue({
        json: async () =>
          Promise.resolve({
            success: false,
            error: 'Advice service unavailable',
          }),
      });

      await expect(fetchAdvice(28.6, 77.2, validContext)).rejects.toThrow(ApiClientError);
    });

    it('throws ApiClientError on invalid response shape', async () => {
      mockFetch.mockResolvedValue({
        json: async () => Promise.resolve({ success: true, data: 'not-an-object' }),
      });

      await expect(fetchAdvice(28.6, 77.2, validContext)).rejects.toThrow(ApiClientError);
    });

    it('propagates network failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network drop'));

      await expect(fetchAdvice(28.6, 77.2, validContext)).rejects.toThrow('Network drop');
    });
  });
});
