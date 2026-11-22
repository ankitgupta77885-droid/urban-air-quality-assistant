/**
 * Shared type definitions for the Urban Air Quality Assistant.
 *
 * All domain types used across server and client live here to ensure
 * a single source of truth.
 */

/* ── Location ── */

/** A geocoded location result from the Open-Meteo Geocoding API. */
export interface GeocodingResult {
  /** Unique location identifier from the geocoding API. */
  readonly id: number;
  /** City or locality name. */
  readonly name: string;
  /** Administrative region (state, province, etc.). */
  readonly admin1?: string;
  /** Country name. */
  readonly country: string;
  /** Country code (ISO 3166-1 alpha-2). */
  readonly countryCode: string;
  /** Latitude in decimal degrees. */
  readonly latitude: number;
  /** Longitude in decimal degrees. */
  readonly longitude: number;
}

/* ── Air Quality ── */

/** AQI category levels following US EPA breakpoints. */
export type AqiCategory =
  | 'Good'
  | 'Moderate'
  | 'Unhealthy for Sensitive Groups'
  | 'Unhealthy'
  | 'Very Unhealthy'
  | 'Hazardous';

/** Individual pollutant reading. */
export interface PollutantReading {
  /** Pollutant identifier (e.g., "pm2_5", "pm10", "no2"). */
  readonly name: string;
  /** Human-readable display name (e.g., "PM2.5"). */
  readonly displayName: string;
  /** Current concentration value. */
  readonly value: number;
  /** Measurement unit (e.g., "µg/m³"). */
  readonly unit: string;
}

/** Complete air quality data for a location. */
export interface AqiData {
  /** Overall US AQI value (0–500). */
  readonly aqi: number;
  /** Human-readable AQI category. */
  readonly category: AqiCategory;
  /** Individual pollutant readings. */
  readonly pollutants: readonly PollutantReading[];
  /** Dominant pollutant name. */
  readonly dominantPollutant: string;
  /** ISO 8601 timestamp of the reading. */
  readonly timestamp: string;
}

/* ── User Context (Young Families Persona) ── */

/** Age group of the youngest child in the household. */
export type ChildAgeGroup = 'infant' | 'toddler' | 'preschool' | 'school-age';

/** Common health conditions relevant to air quality. */
export type HealthCondition = 'asthma' | 'allergies' | 'respiratory' | 'cardiovascular' | 'none';

/** Type of home the family lives in. */
export type HomeType = 'apartment' | 'house' | 'studio';

/** Primary commute mode. */
export type CommuteMode = 'car' | 'public-transit' | 'bicycle' | 'walking' | 'work-from-home';

/** Family's typical outdoor activity level. */
export type ActivityLevel = 'low' | 'moderate' | 'high';

/** Primary heating source at home. */
export type HeatingSource = 'gas' | 'electric' | 'wood' | 'oil' | 'heat-pump' | 'none';

/** User context captured from the lifestyle form. */
export interface UserContext {
  /** Age group of the youngest child. */
  readonly childAgeGroup: ChildAgeGroup;
  /** Health conditions in the household. */
  readonly healthConditions: readonly HealthCondition[];
  /** Type of home. */
  readonly homeType: HomeType;
  /** Primary commute mode. */
  readonly commuteMode: CommuteMode;
  /** Family's outdoor activity level. */
  readonly activityLevel: ActivityLevel;
  /** Primary heating source. */
  readonly heatingSource: HeatingSource;
}

/* ── Risk Assessment ── */

/** Computed risk level based on AQI + user context. */
export type RiskLevel = 'low' | 'moderate' | 'high' | 'very-high' | 'critical';

/* ── Advice / Recommendations ── */

/** Category of a recommended action. */
export type AdviceCategory =
  | 'morning-routine'
  | 'commute'
  | 'outdoor-activity'
  | 'evening-routine'
  | 'indoor-air-hack'
  | 'sustainable-alternative';

/** Allowed icon key for actions (maps to inline SVG icons). */
export type ActionIconKey =
  | 'sun'
  | 'moon'
  | 'home'
  | 'car'
  | 'walk'
  | 'leaf'
  | 'wind'
  | 'shield'
  | 'sparkle'
  | 'alert';

/** A single structured action from the rules engine. */
export interface RecommendedAction {
  /** Which advice category this belongs to. */
  readonly category: AdviceCategory;
  /** Short title for the action. */
  readonly title: string;
  /** Detailed explanation of the action. */
  readonly description: string;
  /** Why this action helps (plain-language impact explanation). */
  readonly impact: string;
  /** Qualitative/estimated benefit label (e.g., "High", "Moderate"). */
  readonly benefit: string;
  /** Icon identifier for the category. */
  readonly icon: ActionIconKey;
}

/** Output of the deterministic rules engine. */
export interface RulesEngineOutput {
  /** Computed risk level. */
  readonly riskLevel: RiskLevel;
  /** Short summary of the risk assessment. */
  readonly riskSummary: string;
  /** Ordered list of recommended actions. */
  readonly actions: readonly RecommendedAction[];
}

/** A personalized advice item from Gemini (or fallback). */
export interface PersonalizedAction {
  /** Which advice category this belongs to. */
  readonly category: AdviceCategory;
  /** Short title for the action. */
  readonly title: string;
  /** Personalized description. */
  readonly description: string;
  /** Why this helps — personalized impact explanation. */
  readonly impact: string;
  /** Qualitative/estimated benefit label. */
  readonly benefit: string;
  /** Icon identifier for the category. */
  readonly icon: ActionIconKey;
}

/** Full personalized advice response. */
export interface PersonalizedAdvice {
  /** Computed risk level. */
  readonly riskLevel: RiskLevel;
  /** Personalized risk summary. */
  readonly riskSummary: string;
  /** Personalized actions grouped by category. */
  readonly actions: readonly PersonalizedAction[];
  /** Whether this is from Gemini or the rules-engine fallback. */
  readonly isBasicMode: boolean;
}

/* ── API Request / Response ── */

/** Request body for POST /api/advice. */
export interface AdviceRequest {
  /** Latitude of the user's location. */
  readonly latitude: number;
  /** Longitude of the user's location. */
  readonly longitude: number;
  /** User's lifestyle context. */
  readonly context: UserContext;
}

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
