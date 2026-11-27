/**
 * Air Quality service using the Open-Meteo Air Quality API.
 *
 * Fetches current AQI and pollutant data with in-memory TTL caching.
 */

import { categorizeAqi, formatCoordinateCacheKey } from '../../shared/aqi.js';
import { TtlCache } from '../../shared/cache.js';
import {
  AIR_QUALITY_API_URL,
  AQI_CACHE_TTL_MS,
  POLLUTANT_DECIMAL_PLACES,
  POLLUTANT_DISPLAY_NAMES,
  POLLUTANT_KEYS,
  POLLUTANT_UNIT,
} from '../../shared/constants.js';
import { openMeteoAqiResponseSchema, type OpenMeteoAqiCurrent } from '../../shared/schemas.js';
import type { AqiData, PollutantReading } from '../../shared/types.js';
import { UpstreamApiError } from '../errors/app-errors.js';

import { fetchValidatedJson } from './http-client.js';
import { createLogger } from './logger.js';

const logger = createLogger('aqi');

/** Cache for AQI data keyed by "lat,lon" (rounded to 2 decimals). */
const aqiCache = new TtlCache<AqiData>(AQI_CACHE_TTL_MS);

/**
 * Fetches current air quality data for the given coordinates.
 * Results are cached by rounded coordinates.
 * @param latitude - Latitude in decimal degrees.
 * @param longitude - Longitude in decimal degrees.
 * @returns Current AQI data with pollutant readings.
 */
export async function fetchAqiData(latitude: number, longitude: number): Promise<AqiData> {
  const cacheKey = formatCoordinateCacheKey(latitude, longitude);
  const cached = aqiCache.get(cacheKey);

  if (cached) {
    logger.debug('Cache hit for AQI:', cacheKey);
    return cached;
  }

  logger.info('Fetching AQI data for:', cacheKey);
  const payload = await fetchValidatedJson(
    buildAqiUrl(latitude, longitude),
    openMeteoAqiResponseSchema,
    'Air Quality API',
  );

  if (!payload.current) {
    throw new UpstreamApiError('Air Quality API returned invalid data');
  }

  const aqiData = mapAqiResponse(payload.current);
  aqiCache.set(cacheKey, aqiData);
  return aqiData;
}

/**
 * Builds the request URL for Open-Meteo Air Quality API.
 * @param lat - Latitude.
 * @param lon - Longitude.
 */
function buildAqiUrl(lat: number, lon: number): string {
  const url = new URL(AIR_QUALITY_API_URL);
  url.searchParams.set('latitude', String(lat));
  url.searchParams.set('longitude', String(lon));
  url.searchParams.set('current', ['us_aqi', ...POLLUTANT_KEYS].join(','));
  return url.toString();
}

/**
 * Maps the Open-Meteo API response to our domain type.
 * @param current - Raw current data from the API.
 * @returns Mapped AQI data.
 */
function mapAqiResponse(current: OpenMeteoAqiCurrent): AqiData {
  const aqi = Math.round(current.us_aqi);
  const { category } = categorizeAqi(aqi);
  const pollutants = buildPollutantReadings(current);
  const dominantPollutant = findDominantPollutant(pollutants);

  return {
    aqi,
    category,
    pollutants,
    dominantPollutant,
    timestamp: current.time,
  };
}

/**
 * Rounds a number to a fixed count of decimal places.
 * @param value - Number to round.
 * @param places - Decimal places to keep.
 */
function roundTo(value: number, places: number): number {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}

/**
 * Extracts pollutant readings from the API response.
 * @param current - Raw current data.
 * @returns Array of pollutant readings.
 */
function buildPollutantReadings(current: OpenMeteoAqiCurrent): PollutantReading[] {
  return POLLUTANT_KEYS.map((name) => ({
    name,
    displayName: POLLUTANT_DISPLAY_NAMES[name],
    value: roundTo(current[name], POLLUTANT_DECIMAL_PLACES),
    unit: POLLUTANT_UNIT,
  }));
}

/**
 * Finds the pollutant with the highest concentration value.
 * @param pollutants - Array of pollutant readings.
 * @returns Name of the dominant pollutant.
 */
function findDominantPollutant(pollutants: readonly PollutantReading[]): string {
  let maxValue = -1;
  let dominant = 'pm2_5';

  for (const p of pollutants) {
    if (p.value > maxValue) {
      maxValue = p.value;
      dominant = p.name;
    }
  }

  return dominant;
}

/** Clears the AQI cache (for testing). */
export function clearAqiCache(): void {
  aqiCache.clear();
}
