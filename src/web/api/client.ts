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
import type {
  ApiResponse,
  AqiData,
  GeocodingResult,
  PersonalizedAdvice,
  UserContext,
} from '@shared/types.js';
import type { z } from 'zod';

/** Active abort controllers keyed by request type. */
const controllers = new Map<string, AbortController>();

interface ApiRequestOptions<T> {
  readonly signalKey: string;
  readonly url: string;
  readonly schema: z.ZodType<ApiResponse<T>>;
  readonly invalidMessage: string;
  readonly fallbackError: string;
  readonly init?: Omit<RequestInit, 'signal'>;
}

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

/** Parses response body as JSON, wrapping malformed non-JSON server replies in ApiClientError. */
async function parseResponseJson(res: Response): Promise<unknown> {
  try {
    return (await res.json()) as unknown;
  } catch {
    const status = typeof res.status === 'number' ? res.status : 500;
    throw new ApiClientError(`Server returned an invalid response (HTTP ${status})`, status);
  }
}

/** Shared typed fetch wrapper that validates API envelopes and handles errors uniformly. */
async function requestApiData<T>(options: ApiRequestOptions<T>): Promise<T> {
  const signal = getFreshSignal(options.signalKey);
  const res = await fetch(options.url, { ...options.init, signal });
  const rawJson = await parseResponseJson(res);
  const parsed = options.schema.safeParse(rawJson);

  if (!parsed.success) {
    throw new ApiClientError(options.invalidMessage);
  }

  const envelope = parsed.data;
  if (!envelope.success || envelope.data === undefined) {
    throw new ApiClientError(envelope.error ?? options.fallbackError);
  }

  return envelope.data;
}

/**
 * Searches for cities matching the given query.
 * @param query - City name search string.
 * @returns Array of geocoding results.
 */
export async function searchCities(query: string): Promise<GeocodingResult[]> {
  return requestApiData({
    signalKey: 'geocoding',
    url: `/api/geocoding/search?q=${encodeURIComponent(query)}`,
    schema: geocodingApiResponseSchema,
    invalidMessage: 'Invalid response received from location service',
    fallbackError: 'Failed to search cities',
  });
}

/**
 * Fetches current AQI data for the given coordinates.
 * @param lat - Latitude.
 * @param lon - Longitude.
 * @returns Current AQI data.
 */
export async function fetchAqi(lat: number, lon: number): Promise<AqiData> {
  return requestApiData({
    signalKey: 'aqi',
    url: `/api/aqi?lat=${lat}&lon=${lon}`,
    schema: aqiApiResponseSchema,
    invalidMessage: 'Invalid response received from air quality service',
    fallbackError: 'Failed to fetch AQI data',
  });
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
  return requestApiData({
    signalKey: 'advice',
    url: '/api/advice',
    schema: adviceApiResponseSchema,
    invalidMessage: 'Invalid response received from advice service',
    fallbackError: 'Failed to fetch advice',
    init: {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ latitude: lat, longitude: lon, context }),
    },
  });
}
