/* v8 ignore start */
/**
 * AQI breakpoint lookup and risk-scoring tables shared across server and web.
 *
 * Keeping one implementation guarantees the risk calculator, API response,
 * and UI agree on which category an AQI value belongs to.
 */
/* v8 ignore stop */

import type { AqiCategory, HealthCondition, UserContext } from './types.js';

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
  /** Base risk score (1–10) contributed by this AQI range. */
  readonly baseRiskScore: number;
}

/** Hazardous AQI breakpoint, also used for values above the published scale. */
export const HAZARDOUS_BREAKPOINT: AqiBreakpoint = {
  min: 301,
  max: 500,
  category: 'Hazardous',
  colorClass: 'aqi-hazardous',
  icon: '🟤',
  baseRiskScore: 10,
};

/** US EPA AQI breakpoints for categorization. */
export const AQI_BREAKPOINTS: readonly AqiBreakpoint[] = [
  { min: 0, max: 50, category: 'Good', colorClass: 'aqi-good', icon: '🟢', baseRiskScore: 1 },
  {
    min: 51,
    max: 100,
    category: 'Moderate',
    colorClass: 'aqi-moderate',
    icon: '🟡',
    baseRiskScore: 3,
  },
  {
    min: 101,
    max: 150,
    category: 'Unhealthy for Sensitive Groups',
    colorClass: 'aqi-usg',
    icon: '🟠',
    baseRiskScore: 5,
  },
  {
    min: 151,
    max: 200,
    category: 'Unhealthy',
    colorClass: 'aqi-unhealthy',
    icon: '🔴',
    baseRiskScore: 7,
  },
  {
    min: 201,
    max: 300,
    category: 'Very Unhealthy',
    colorClass: 'aqi-very-unhealthy',
    icon: '🟣',
    baseRiskScore: 9,
  },
  HAZARDOUS_BREAKPOINT,
] as const;

/** Highest possible composite risk score. */
export const MAX_RISK_SCORE = 10 as const;

/** Extra risk contributed by the child's age group. */
export const AGE_RISK_MODIFIERS: Readonly<Record<UserContext['childAgeGroup'], number>> = {
  infant: 2,
  toddler: 1.5,
  preschool: 1,
  'school-age': 0.5,
};

/** Extra risk contributed by each health condition. */
export const HEALTH_RISK_MODIFIERS: Readonly<Record<HealthCondition, number>> = {
  none: 0,
  asthma: 1.5,
  respiratory: 1,
  cardiovascular: 1,
  allergies: 0.5,
};

/** Extra risk contributed by the child's outdoor activity level. */
export const ACTIVITY_RISK_MODIFIERS: Readonly<Record<UserContext['activityLevel'], number>> = {
  high: 1,
  moderate: 0.5,
  low: 0,
};

/**
 * Finds the US EPA breakpoint an AQI value falls into.
 * Values above the published scale map to the Hazardous breakpoint.
 * @param aqi - Raw AQI value.
 * @returns The matching AQI breakpoint.
 */
export function findAqiBreakpoint(aqi: number): AqiBreakpoint {
  return AQI_BREAKPOINTS.find((bp) => aqi <= bp.max) ?? HAZARDOUS_BREAKPOINT;
}
