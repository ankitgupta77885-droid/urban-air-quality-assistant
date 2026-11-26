/**
 * Frontend API client with AbortController support.
 *
 * Provides typed fetch wrappers for all backend endpoints.
 * Cancels stale requests automatically.
 */

import { AQI_CACHE_TTL_MS, MAX_CACHE_ENTRIES } from '@shared/constants.js';
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

interface CacheEntry<T> {
  readonly value: T;
  readonly expiresAt: number;
}

const geocodingCache = new Map<string, CacheEntry<GeocodingResult[]>>();
const aqiClientCache = new Map<string, CacheEntry<AqiData>>();

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
  const existing = controllers.get(key);
  if (existing) {
    existing.abort();
  }
  const controller = new AbortController();
  controllers.set(key, controller);
  return controller.signal;
}

/** Reads a non-expired cached entry from an in-memory client map. */
function getCachedEntry<T>(store: Map<string, CacheEntry<T>>, key: string): T | undefined {
  const entry = store.get(key);
  if (!entry) {
    return undefined;
  }
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return undefined;
  }
  return entry.value;
}

/** Writes an entry to an in-memory client map, evicting the oldest item if full. */
function setCachedEntry<T>(store: Map<string, CacheEntry<T>>, key: string, value: T): void {
  if (store.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = store.keys().next().value;
    if (oldestKey !== undefined) {
      store.delete(oldestKey);
    }
  }
  store.set(key, { value, expiresAt: Date.now() + AQI_CACHE_TTL_MS });
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
  store: Map<string, CacheEntry<T>>,
  cacheKey: string,
  options: ApiRequestOptions<T>,
): Promise<T> {
  const signal = getFreshSignal(options.signalKey);
  const cached = getCachedEntry(store, cacheKey);
  if (cached) {
    return cached;
  }
  const data = await requestApiData(options, signal);
  setCachedEntry(store, cacheKey, data);
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
  return requestWithCache(aqiClientCache, `${lat.toFixed(2)},${lon.toFixed(2)}`, {
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
