/**
 * Geocoding service using the Open-Meteo Geocoding API.
 *
 * Provides city search with in-memory TTL caching.
 */

import { TtlCache } from '../../shared/cache.js';
import {
  GEOCODING_API_URL,
  GEOCODING_CACHE_TTL_MS,
  MAX_GEOCODING_RESULTS,
} from '../../shared/constants.js';
import { openMeteoGeoResponseSchema, type OpenMeteoGeoResult } from '../../shared/schemas.js';
import type { GeocodingResult } from '../../shared/types.js';

import { fetchValidatedJson } from './http-client.js';
import { createLogger } from './logger.js';

const logger = createLogger('geocoding');

/** Cache for geocoding results keyed by normalized query. */
const geocodingCache = new TtlCache<GeocodingResult[]>(GEOCODING_CACHE_TTL_MS);

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
  const payload = await fetchValidatedJson(
    buildGeocodingUrl(query),
    openMeteoGeoResponseSchema,
    'Geocoding API',
  );

  const results = mapGeoResults(payload.results ?? []);
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
