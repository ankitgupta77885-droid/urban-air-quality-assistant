/**
 * Shared constants for the Urban Air Quality Assistant.
 *
 * All magic numbers, breakpoints, labels, and configuration constants
 * live here as named exports.
 */

import type { AqiCategory } from './types.js';

/* ── AQI Breakpoints (US EPA standard) ── */

/** AQI breakpoint range definition. */
export interface AqiBreakpoint {
  /** Minimum AQI value (inclusive). */
  readonly min: number;
  /** Maximum AQI value (inclusive). */
  readonly max: number;
  /** Human-readable category label. */
  readonly category: AqiCategory;
  /** CSS-safe color class name. */
  readonly colorClass: string;
  /** Accessible icon/emoji for the category. */
  readonly icon: string;
}

/** US EPA AQI breakpoints for categorization. */
export const AQI_BREAKPOINTS: readonly AqiBreakpoint[] = [
  { min: 0, max: 50, category: 'Good', colorClass: 'aqi-good', icon: '🟢' },
  { min: 51, max: 100, category: 'Moderate', colorClass: 'aqi-moderate', icon: '🟡' },
  {
    min: 101,
    max: 150,
    category: 'Unhealthy for Sensitive Groups',
    colorClass: 'aqi-usg',
    icon: '🟠',
  },
  { min: 151, max: 200, category: 'Unhealthy', colorClass: 'aqi-unhealthy', icon: '🔴' },
  {
    min: 201,
    max: 300,
    category: 'Very Unhealthy',
    colorClass: 'aqi-very-unhealthy',
    icon: '🟣',
  },
  { min: 301, max: 500, category: 'Hazardous', colorClass: 'aqi-hazardous', icon: '🟤' },
] as const;

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

/** Icons for advice categories. */
export const ADVICE_CATEGORY_ICONS: Readonly<Record<string, string>> = {
  'morning-routine': '🌅',
  commute: '🚗',
  'outdoor-activity': '🏃',
  'evening-routine': '🌙',
  'indoor-air-hack': '🏠',
  'sustainable-alternative': '♻️',
} as const;

/* ── Input Validation Limits ── */

/** Maximum length for a city search query. */
export const MAX_SEARCH_QUERY_LENGTH = 100 as const;

/** Maximum number of geocoding results to return. */
export const MAX_GEOCODING_RESULTS = 5 as const;

/** Latitude range limits. */
export const LATITUDE_MIN = -90 as const;
export const LATITUDE_MAX = 90 as const;

/** Longitude range limits. */
export const LONGITUDE_MIN = -180 as const;
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

/** Request timeout in milliseconds (15 seconds). */
export const REQUEST_TIMEOUT_MS = 15_000 as const;

/** Gemini API timeout in milliseconds (12 seconds). */
export const GEMINI_TIMEOUT_MS = 12_000 as const;

/** Rate limit: max requests per window. */
export const RATE_LIMIT_MAX = 60 as const;

/** Rate limit: window size in milliseconds (1 minute). */
export const RATE_LIMIT_WINDOW_MS = 60_000 as const;

/* ── Frontend ── */

/** Debounce delay for search input (milliseconds). */
export const SEARCH_DEBOUNCE_MS = 300 as const;

/** Minimum characters before triggering a search. */
export const MIN_SEARCH_LENGTH = 2 as const;
