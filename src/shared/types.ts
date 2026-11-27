/**
 * Shared type definitions for BreatheWell.
 *
 * Domain types are inferred from Zod validation schemas so compile-time
 * types and runtime validators share a single source of truth.
 */

import type { z } from 'zod';

import type {
  actionIconKeySchema,
  activityLevelSchema,
  adviceCategorySchema,
  adviceRequestSchema,
  childAgeGroupSchema,
  commuteModeSchema,
  healthConditionSchema,
  heatingSourceSchema,
  homeTypeSchema,
  personalizedActionSchema,
  riskLevelSchema,
  userContextSchema,
} from './request-schemas.js';
import type {
  aqiCategorySchema,
  aqiDataSchema,
  geocodingResultSchema,
  personalizedAdviceSchema,
  pollutantReadingSchema,
} from './response-schemas.js';

/* ── Location ── */

/** A geocoded location result from the Open-Meteo Geocoding API. */
export type GeocodingResult = Readonly<z.infer<typeof geocodingResultSchema>>;

/* ── Air Quality ── */

/** AQI category levels following US EPA breakpoints. */
export type AqiCategory = z.infer<typeof aqiCategorySchema>;

/** Individual pollutant reading. */
export type PollutantReading = Readonly<z.infer<typeof pollutantReadingSchema>>;

/** Complete air quality data for a location. */
export type AqiData = Omit<Readonly<z.infer<typeof aqiDataSchema>>, 'pollutants'> & {
  readonly pollutants: readonly PollutantReading[];
};

/* ── User Context (Young Families Persona) ── */

/** Age group of the youngest child in the household. */
export type ChildAgeGroup = z.infer<typeof childAgeGroupSchema>;

/** Common health conditions relevant to air quality. */
export type HealthCondition = z.infer<typeof healthConditionSchema>;

/** Type of home the family lives in. */
export type HomeType = z.infer<typeof homeTypeSchema>;

/** Primary commute mode. */
export type CommuteMode = z.infer<typeof commuteModeSchema>;

/** Family's typical outdoor activity level. */
export type ActivityLevel = z.infer<typeof activityLevelSchema>;

/** Primary heating source at home. */
export type HeatingSource = z.infer<typeof heatingSourceSchema>;

/** User context captured from the lifestyle form. */
export type UserContext = Omit<Readonly<z.infer<typeof userContextSchema>>, 'healthConditions'> & {
  readonly healthConditions: readonly HealthCondition[];
};

/* ── Risk Assessment & Advice ── */

/** Computed risk level based on AQI + user context. */
export type RiskLevel = z.infer<typeof riskLevelSchema>;

/** Category of a recommended action. */
export type AdviceCategory = z.infer<typeof adviceCategorySchema>;

/** Allowed icon key for actions (maps to inline SVG icons). */
export type ActionIconKey = z.infer<typeof actionIconKeySchema>;

/** A single structured action from the rules engine. */
export type RecommendedAction = Readonly<z.infer<typeof personalizedActionSchema>>;

/** Alias for personalized advice items returned by Gemini or fallback. */
export type PersonalizedAction = RecommendedAction;

/** Output of the deterministic rules engine. */
export interface RulesEngineOutput {
  /** Computed risk level. */
  readonly riskLevel: RiskLevel;
  /** Short summary of the risk assessment. */
  readonly riskSummary: string;
  /** Ordered list of recommended actions. */
  readonly actions: readonly RecommendedAction[];
}

/** Full personalized advice response. */
export type PersonalizedAdvice = Omit<
  Readonly<z.infer<typeof personalizedAdviceSchema>>,
  'actions'
> & {
  readonly actions: readonly PersonalizedAction[];
};

/* ── API Request / Response ── */

/** Request body for POST /api/advice. */
export type AdviceRequest = Readonly<z.infer<typeof adviceRequestSchema>>;

/** API response wrapper. */
export interface ApiResponse<T> {
  /** Whether the request succeeded. */
  readonly success: boolean;
  /** Response payload (present on success). */
  readonly data?: T;
  /** Error message (present on failure). */
  readonly error?: string;
  /** Machine-readable error code (present on failure). */
  readonly code?: string;
}
