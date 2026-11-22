/**
 * Geocoding service using the Open-Meteo Geocoding API.
 *
 * Provides city search with in-memory TTL caching.
 */

import {
  GEOCODING_API_URL,
  GEOCODING_CACHE_TTL_MS,
  MAX_GEOCODING_RESULTS,
} from '@shared/constants.js';
import type { GeocodingResult } from '@shared/types.js';

import { TtlCache } from './cache.js';
import { createLogger } from './logger.js';

const logger = createLogger('geocoding');

/** Cache for geocoding results keyed by normalized query. */
const geocodingCache = new TtlCache<GeocodingResult[]>(GEOCODING_CACHE_TTL_MS);

/** Shape of a single result from the Open-Meteo Geocoding API. */
interface OpenMeteoGeoResult {
  readonly id: number;
  readonly name: string;
  readonly admin1?: string;
  readonly country: string;
  readonly country_code: string;
  readonly latitude: number;
  readonly longitude: number;
}

/** Shape of the Open-Meteo Geocoding API response. */
interface OpenMeteoGeoResponse {
  readonly results?: readonly OpenMeteoGeoResult[];
}

/**
 * Searches for cities matching the given query string.
 * Results are cached by normalized query.
 * @param query - City name search string.
 * @returns Array of geocoding results (max 5).
 */
export async function searchCities(query: string): Promise<GeocodingResult[]> {
  const cacheKey = query.trim().toLowerCase();
  const cached = geocodingCache.get(cacheKey);

  if (cached) {
    logger.debug('Cache hit for geocoding query');
    return cached;
  }

  logger.info('Fetching geocoding results');
  const response = await fetch(buildGeocodingUrl(query), {
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    throw new Error(`Geocoding API returned status ${response.status}`);
  }

  const data = (await response.json()) as OpenMeteoGeoResponse;
  const results = mapGeoResults(data.results ?? []);
  geocodingCache.set(cacheKey, results);
  return results;
}

/**
 * Builds the Open-Meteo Geocoding API URL.
 * @param query - Search query.
 */
function buildGeocodingUrl(query: string): string {
  const url = new URL(GEOCODING_API_URL);
  url.searchParams.set('name', query.trim());
  url.searchParams.set('count', String(MAX_GEOCODING_RESULTS));
  url.searchParams.set('language', 'en');
  url.searchParams.set('format', 'json');
  return url.toString();
}

/**
 * Maps Open-Meteo geocoding results to our domain type.
 * @param results - Raw API results.
 * @returns Mapped geocoding results.
 */
function mapGeoResults(results: readonly OpenMeteoGeoResult[]): GeocodingResult[] {
  return results.map((r) => ({
    id: r.id,
    name: r.name,
    admin1: r.admin1,
    country: r.country,
    countryCode: r.country_code,
    latitude: r.latitude,
    longitude: r.longitude,
  }));
}

/** Clears the geocoding cache (for testing). */
export function clearGeocodingCache(): void {
  geocodingCache.clear();
}
