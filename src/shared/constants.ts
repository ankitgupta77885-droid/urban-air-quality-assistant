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
export const PM25_ELEVATED_THRESHOLD = 35 as const;

/** Decimal places kept when rounding pollutant concentrations. */
export const POLLUTANT_DECIMAL_PLACES = 1 as const;

/** Characters of a malformed AI response kept in error messages. */
export const ERROR_PREVIEW_MAX_LENGTH = 200 as const;

/* ── Pollutant Display Names ── */

/** Map from API pollutant key to human-readable display name. */
export const POLLUTANT_DISPLAY_NAMES: Readonly<Record<string, string>> = {
  pm2_5: 'PM2.5',
  pm10: 'PM10',
  nitrogen_dioxide: 'NO₂',
  ozone: 'O₃',
  sulphur_dioxide: 'SO₂',
  carbon_monoxide: 'CO',
} as const;

/** Measurement unit for pollutant concentrations. */
export const POLLUTANT_UNIT = 'µg/m³' as const;

/* ── Advice Category Labels & Icons ── */

/** Human-readable labels for advice categories. */
export const ADVICE_CATEGORY_LABELS: Readonly<Record<string, string>> = {
  'morning-routine': 'Morning Routine',
  commute: 'Commute',
  'outdoor-activity': 'Outdoor Activity',
  'evening-routine': 'Evening Routine',
  'indoor-air-hack': 'Indoor Air Hack',
  'sustainable-alternative': 'Sustainable Alternative',
} as const;

/** Icon key for each advice category (exhaustive, so lookups never miss). */
export const ADVICE_CATEGORY_ICONS: Readonly<Record<AdviceCategory, ActionIconKey>> = {
  'morning-routine': 'sun',
  commute: 'car',
  'outdoor-activity': 'walk',
  'evening-routine': 'moon',
  'indoor-air-hack': 'home',
  'sustainable-alternative': 'leaf',
} as const;

/* ── Input Validation Limits ── */

/** Maximum length for a city search query. */
export const MAX_SEARCH_QUERY_LENGTH = 100 as const;

/** Maximum number of geocoding results to return. */
export const MAX_GEOCODING_RESULTS = 5 as const;

/** Minimum allowable latitude. */
export const LATITUDE_MIN = -90 as const;

/** Maximum allowable latitude. */
export const LATITUDE_MAX = 90 as const;

/** Minimum allowable longitude. */
export const LONGITUDE_MIN = -180 as const;

/** Maximum allowable longitude. */
export const LONGITUDE_MAX = 180 as const;

/** Maximum health conditions a user can select. */
export const MAX_HEALTH_CONDITIONS = 5 as const;

/* ── Cache TTLs (milliseconds) ── */

/** Time-to-live for geocoding cache entries (1 hour). */
export const GEOCODING_CACHE_TTL_MS = 3_600_000 as const;

/** Time-to-live for AQI cache entries (5 minutes). */
export const AQI_CACHE_TTL_MS = 300_000 as const;

/** Maximum cache entries before eviction. */
export const MAX_CACHE_ENTRIES = 500 as const;

/* ── External API URLs ── */

/** Open-Meteo Geocoding API base URL. */
export const GEOCODING_API_URL = 'https://geocoding-api.open-meteo.com/v1/search' as const;

/** Open-Meteo Air Quality API base URL. */
export const AIR_QUALITY_API_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality' as const;

/* ── Server Defaults ── */

/** Default server port. */
export const DEFAULT_PORT = 3000 as const;

/** Request body size limit. */
export const BODY_SIZE_LIMIT = '10kb' as const;

/** Request timeout in milliseconds (25 seconds). */
export const REQUEST_TIMEOUT_MS = 25_000 as const;

/** Outbound external HTTP request timeout in milliseconds (8 seconds). */
export const OUTBOUND_TIMEOUT_MS = 8000 as const;

/** Gemini API timeout in milliseconds (20 seconds). */
export const GEMINI_TIMEOUT_MS = 20_000 as const;

/** Rate limit: max requests per window. */
export const RATE_LIMIT_MAX = 60 as const;

/** Rate limit: window size in milliseconds (1 minute). */
export const RATE_LIMIT_WINDOW_MS = 60_000 as const;

/** CORS preflight cache duration in seconds (10 minutes). */
export const CORS_MAX_AGE_SECONDS = 600 as const;

/* ── Frontend ── */

/** Debounce delay for search input (milliseconds). */
export const SEARCH_DEBOUNCE_MS = 300 as const;

/** Minimum characters before triggering a search. */
export const MIN_SEARCH_LENGTH = 2 as const;

/** Geolocation request timeout in milliseconds (10 seconds). */
export const GEOLOCATION_TIMEOUT_MS = 10_000 as const;

/** Geolocation cached position maximum age in milliseconds (5 minutes). */
export const GEOLOCATION_MAX_AGE_MS = 300_000 as const;

/** Delay before resetting geolocation button feedback label (milliseconds). */
export const GEOLOCATION_RESET_DELAY_MS = 3000 as const;
