/**
 * Frontend API client with AbortController support and shared TTL caching.
 *
 * Provides typed fetch wrappers for all backend endpoints and automatically
 * cancels superseded requests of the same type.
 */

import { formatCoordinateCacheKey } from '@shared/aqi.js';
import { TtlCache } from '@shared/cache.js';
import { AQI_CACHE_TTL_MS, GEOCODING_CACHE_TTL_MS } from '@shared/constants.js';
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

const controllers = new Map<string, AbortController>();
const geocodingCache = new TtlCache<GeocodingResult[]>(GEOCODING_CACHE_TTL_MS);
const aqiClientCache = new TtlCache<AqiData>(AQI_CACHE_TTL_MS);

interface ApiRequestOptions<T> {
  readonly signalKey: string;
  readonly url: string;
  readonly schema: z.ZodType<ApiResponse<T>>;
  readonly invalidMessage: string;
  readonly fallbackError: string;
  readonly init?: Omit<RequestInit, 'signal'>;
}

/** Cancels any in-flight request of the given type and returns a new AbortSignal. */
function getFreshSignal(key: string): AbortSignal {
  controllers.get(key)?.abort();
  const controller = new AbortController();
  controllers.set(key, controller);
  return controller.signal;
}

/** Parses response body as JSON, wrapping malformed non-JSON server replies in ApiClientError. */
async function parseResponseJson(res: Response): Promise<unknown> {
  try {
    const raw: unknown = await res.json();
    return raw;
  } catch {
    const status = typeof res.status === 'number' ? res.status : 500;
    throw new ApiClientError(`Server returned an invalid response (HTTP ${status})`, status);
  }
}

/** Shared typed fetch wrapper that validates API envelopes and handles errors uniformly. */
async function requestApiData<T>(
  options: ApiRequestOptions<T>,
  signal: AbortSignal = getFreshSignal(options.signalKey),
): Promise<T> {
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

/** Requests data with client-side TTL caching while still cancelling superseded requests. */
async function requestWithCache<T>(
  cache: TtlCache<T>,
  cacheKey: string,
  options: ApiRequestOptions<T>,
): Promise<T> {
  const signal = getFreshSignal(options.signalKey);
  const cached = cache.get(cacheKey);
  if (cached !== undefined) {
    return cached;
  }
  const data = await requestApiData(options, signal);
  cache.set(cacheKey, data);
  return data;
}

/** Searches for cities matching the given query, using client cache for repeats. */
export async function searchCities(query: string): Promise<GeocodingResult[]> {
  return requestWithCache(geocodingCache, query.trim().toLowerCase(), {
    signalKey: 'geocoding',
    url: `/api/geocoding/search?q=${encodeURIComponent(query)}`,
    schema: geocodingApiResponseSchema,
    invalidMessage: 'Invalid response received from location service',
    fallbackError: 'Failed to search cities',
  });
}

/** Fetches current AQI data for the given coordinates, using client cache for repeats. */
export async function fetchAqi(lat: number, lon: number): Promise<AqiData> {
  return requestWithCache(aqiClientCache, formatCoordinateCacheKey(lat, lon), {
    signalKey: 'aqi',
    url: `/api/aqi?lat=${lat}&lon=${lon}`,
    schema: aqiApiResponseSchema,
    invalidMessage: 'Invalid response received from air quality service',
    fallbackError: 'Failed to fetch AQI data',
  });
}

/** Clears in-memory frontend API caches (for testing). */
export function clearApiClientCache(): void {
  geocodingCache.clear();
  aqiClientCache.clear();
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
