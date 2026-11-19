/**
 * Air Quality service using the Open-Meteo Air Quality API.
 *
 * Fetches current AQI and pollutant data with in-memory TTL caching.
 */

import {
  AIR_QUALITY_API_URL,
  AQI_CACHE_TTL_MS,
  POLLUTANT_DISPLAY_NAMES,
  POLLUTANT_UNIT,
} from '@shared/constants.js';
import type { AqiData, PollutantReading } from '@shared/types.js';

import { categorizeAqi } from './aqi-categorizer.js';
import { TtlCache } from './cache.js';
import { createLogger } from './logger.js';

const logger = createLogger('aqi');

/** Cache for AQI data keyed by "lat,lon" (rounded to 2 decimals). */
const aqiCache = new TtlCache<AqiData>(AQI_CACHE_TTL_MS);

/** Pollutant variables to request from the API. */
const POLLUTANT_VARS = [
  'pm2_5',
  'pm10',
  'nitrogen_dioxide',
  'ozone',
  'sulphur_dioxide',
  'carbon_monoxide',
] as const;

/** Shape of the Open-Meteo Air Quality API current data. */
interface OpenMeteoAqiCurrent {
  readonly time: string;
  readonly us_aqi: number;
  readonly pm2_5: number;
  readonly pm10: number;
  readonly nitrogen_dioxide: number;
  readonly ozone: number;
  readonly sulphur_dioxide: number;
  readonly carbon_monoxide: number;
}

/** Shape of the Open-Meteo Air Quality API response. */
interface OpenMeteoAqiResponse {
  readonly current?: OpenMeteoAqiCurrent;
}

/**
 * Fetches current air quality data for the given coordinates.
 * Results are cached by rounded coordinates.
 * @param latitude - Latitude in decimal degrees.
 * @param longitude - Longitude in decimal degrees.
 * @returns Current AQI data with pollutant readings.
 */
export async function fetchAqiData(latitude: number, longitude: number): Promise<AqiData> {
  const cacheKey = buildCacheKey(latitude, longitude);
  const cached = aqiCache.get(cacheKey);

  if (cached) {
    logger.debug('Cache hit for AQI:', cacheKey);
    return cached;
  }

  logger.info('Fetching AQI data for:', cacheKey);
  const response = await fetch(buildAqiUrl(latitude, longitude), {
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    throw new Error(`Air Quality API returned status ${response.status}`);
  }

  const data = (await response.json()) as OpenMeteoAqiResponse;
  if (!data.current) {
    throw new Error('Air Quality API returned no current data');
  }

  const aqiData = mapAqiResponse(data.current);
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
  url.searchParams.set('current', ['us_aqi', ...POLLUTANT_VARS].join(','));
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
 * Extracts pollutant readings from the API response.
 * @param current - Raw current data.
 * @returns Array of pollutant readings.
 */
function buildPollutantReadings(current: OpenMeteoAqiCurrent): PollutantReading[] {
  return POLLUTANT_VARS.map((name) => ({
    name,
    displayName: POLLUTANT_DISPLAY_NAMES[name] ?? name,
    value: Math.round(current[name] * 10) / 10,
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

/**
 * Builds a cache key from coordinates, rounded to 2 decimal places.
 * @param lat - Latitude.
 * @param lon - Longitude.
 */
function buildCacheKey(lat: number, lon: number): string {
  return `${lat.toFixed(2)},${lon.toFixed(2)}`;
}

/** Clears the AQI cache (for testing). */
export function clearAqiCache(): void {
  aqiCache.clear();
}
