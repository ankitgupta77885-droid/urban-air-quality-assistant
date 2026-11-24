/**
 * Frontend API client with AbortController support.
 *
 * Provides typed fetch wrappers for all backend endpoints.
 * Cancels stale requests automatically.
 */

import { ApiClientError } from '@shared/errors.js';
import {
  adviceApiResponseSchema,
  aqiApiResponseSchema,
  geocodingApiResponseSchema,
} from '@shared/schemas.js';
import type { AqiData, GeocodingResult, PersonalizedAdvice, UserContext } from '@shared/types.js';

/** Active abort controllers keyed by request type. */
const controllers = new Map<string, AbortController>();

/**
 * Cancels any in-flight request of the given type and returns a new AbortSignal.
 * @param key - Request type identifier.
 * @returns Fresh AbortSignal for the new request.
 */
function getFreshSignal(key: string): AbortSignal {
  const existing = controllers.get(key);
  if (existing) {
    existing.abort();
  }
  const controller = new AbortController();
  controllers.set(key, controller);
  return controller.signal;
}

/**
 * Searches for cities matching the given query.
 * @param query - City name search string.
 * @returns Array of geocoding results.
 */
export async function searchCities(query: string): Promise<GeocodingResult[]> {
  const signal = getFreshSignal('geocoding');
  const url = `/api/geocoding/search?q=${encodeURIComponent(query)}`;

  const res = await fetch(url, { signal });
  const rawJson: unknown = await res.json();
  const parsed = geocodingApiResponseSchema.safeParse(rawJson);

  if (!parsed.success) {
    throw new ApiClientError('Invalid response received from location service');
  }

  const data = parsed.data;
  if (!data.success || !data.data) {
    throw new ApiClientError(data.error ?? 'Failed to search cities');
  }

  return data.data;
}

/**
 * Fetches current AQI data for the given coordinates.
 * @param lat - Latitude.
 * @param lon - Longitude.
 * @returns Current AQI data.
 */
export async function fetchAqi(lat: number, lon: number): Promise<AqiData> {
  const signal = getFreshSignal('aqi');
  const url = `/api/aqi?lat=${lat}&lon=${lon}`;

  const res = await fetch(url, { signal });
  const rawJson: unknown = await res.json();
  const parsed = aqiApiResponseSchema.safeParse(rawJson);

  if (!parsed.success) {
    throw new ApiClientError('Invalid response received from air quality service');
  }

  const data = parsed.data;
  if (!data.success || !data.data) {
    throw new ApiClientError(data.error ?? 'Failed to fetch AQI data');
  }

  return data.data;
}

/**
 * Requests personalized air quality advice.
 * @param lat - Latitude.
 * @param lon - Longitude.
 * @param context - User lifestyle context.
 * @returns Personalized advice response.
 */
export async function fetchAdvice(
  lat: number,
  lon: number,
  context: UserContext,
): Promise<PersonalizedAdvice> {
  const signal = getFreshSignal('advice');

  const res = await fetch('/api/advice', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ latitude: lat, longitude: lon, context }),
    signal,
  });

  const rawJson: unknown = await res.json();
  const parsed = adviceApiResponseSchema.safeParse(rawJson);

  if (!parsed.success) {
    throw new ApiClientError('Invalid response received from advice service');
  }

  const data = parsed.data;
  if (!data.success || !data.data) {
    throw new ApiClientError(data.error ?? 'Failed to fetch advice');
  }

  return data.data;
}
