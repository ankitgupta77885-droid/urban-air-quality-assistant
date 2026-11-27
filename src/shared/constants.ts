/* v8 ignore start -- top JSDoc anchors TypeScript ESM preamble sourcemaps */
/**
 * Shared constants for BreatheWell.
 *
 * All magic numbers, breakpoints, labels, and configuration constants
 * live here as named exports.
 */
/* v8 ignore stop */

import type { ActionIconKey, AdviceCategory } from './types.js';

export { AQI_BREAKPOINTS, HAZARDOUS_BREAKPOINT, type AqiBreakpoint } from './aqi.js';

/** Application display name. */
export const APP_NAME = 'BreatheWell';

/** PM2.5 concentration (µg/m³) above which indoor-air advice is escalated. */
export const PM25_ELEVATED_THRESHOLD = 35;

/** Decimal places kept when rounding pollutant concentrations. */
export const POLLUTANT_DECIMAL_PLACES = 1;

/** Characters of a malformed AI response kept in error messages. */
export const ERROR_PREVIEW_MAX_LENGTH = 200;

/* ── Pollutant Keys & Display Names ── */

/** Ordered list of tracked Open-Meteo pollutant variables. */
export const POLLUTANT_KEYS = [
  'pm2_5',
  'pm10',
  'nitrogen_dioxide',
  'ozone',
  'sulphur_dioxide',
  'carbon_monoxide',
] as const;

/** Union of tracked pollutant keys. */
export type PollutantKey = (typeof POLLUTANT_KEYS)[number];

/** Map from API pollutant key to human-readable display name. */
export const POLLUTANT_DISPLAY_NAMES: Readonly<Record<PollutantKey, string>> = {
  pm2_5: 'PM2.5',
  pm10: 'PM10',
  nitrogen_dioxide: 'NO₂',
  ozone: 'O₃',
  sulphur_dioxide: 'SO₂',
  carbon_monoxide: 'CO',
};

/** Measurement unit for pollutant concentrations. */
export const POLLUTANT_UNIT = 'µg/m³';

/* ── Advice Category Labels & Icons ── */

/** Human-readable labels for advice categories (exhaustive across AdviceCategory). */
export const ADVICE_CATEGORY_LABELS: Readonly<Record<AdviceCategory, string>> = {
  'morning-routine': 'Morning Routine',
  commute: 'Commute',
  'outdoor-activity': 'Outdoor Activity',
  'evening-routine': 'Evening Routine',
  'indoor-air-hack': 'Indoor Air Hack',
  'sustainable-alternative': 'Sustainable Alternative',
};

/** Icon key for each advice category (exhaustive, so lookups never miss). */
export const ADVICE_CATEGORY_ICONS: Readonly<Record<AdviceCategory, ActionIconKey>> = {
  'morning-routine': 'sun',
  commute: 'car',
  'outdoor-activity': 'walk',
  'evening-routine': 'moon',
  'indoor-air-hack': 'home',
  'sustainable-alternative': 'leaf',
};

/* ── Input Validation Limits ── */

/** Maximum length for a city search query. */
export const MAX_SEARCH_QUERY_LENGTH = 100;

/** Maximum number of geocoding results to return. */
export const MAX_GEOCODING_RESULTS = 5;

/** Minimum allowable latitude. */
export const LATITUDE_MIN = -90;

/** Maximum allowable latitude. */
export const LATITUDE_MAX = 90;

/** Minimum allowable longitude. */
export const LONGITUDE_MIN = -180;

/** Maximum allowable longitude. */
export const LONGITUDE_MAX = 180;

/** Maximum health conditions a user can select. */
export const MAX_HEALTH_CONDITIONS = 5;

/* ── Cache TTLs (milliseconds) ── */

/** Time-to-live for geocoding cache entries (1 hour). */
export const GEOCODING_CACHE_TTL_MS = 3_600_000;

/** Time-to-live for AQI cache entries (5 minutes). */
export const AQI_CACHE_TTL_MS = 300_000;

/** Maximum cache entries before eviction. */
export const MAX_CACHE_ENTRIES = 500;

/* ── External API URLs ── */

/** Open-Meteo Geocoding API base URL. */
export const GEOCODING_API_URL = 'https://geocoding-api.open-meteo.com/v1/search';

/** Open-Meteo Air Quality API base URL. */
export const AIR_QUALITY_API_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality';

/* ── Server Defaults ── */

/** Default server port. */
export const DEFAULT_PORT = 3000;

/** Request body size limit. */
export const BODY_SIZE_LIMIT = '10kb';

/** Request timeout in milliseconds (25 seconds). */
export const REQUEST_TIMEOUT_MS = 25_000;

/** Outbound external HTTP request timeout in milliseconds (8 seconds). */
export const OUTBOUND_TIMEOUT_MS = 8000;

/** Gemini API timeout in milliseconds (20 seconds). */
export const GEMINI_TIMEOUT_MS = 20_000;

/** Rate limit: max requests per window. */
export const RATE_LIMIT_MAX = 60;

/** Rate limit: window size in milliseconds (1 minute). */
export const RATE_LIMIT_WINDOW_MS = 60_000;

/** CORS preflight cache duration in seconds (10 minutes). */
export const CORS_MAX_AGE_SECONDS = 600;

/* ── Frontend ── */

/** Debounce delay for search input (milliseconds). */
export const SEARCH_DEBOUNCE_MS = 300;

/** Minimum characters before triggering a search. */
export const MIN_SEARCH_LENGTH = 2;

/** Geolocation request timeout in milliseconds (10 seconds). */
export const GEOLOCATION_TIMEOUT_MS = 10_000;

/** Geolocation cached position maximum age in milliseconds (5 minutes). */
export const GEOLOCATION_MAX_AGE_MS = 300_000;

/** Delay before resetting geolocation button feedback label (milliseconds). */
export const GEOLOCATION_RESET_DELAY_MS = 3000;
