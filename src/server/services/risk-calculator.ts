/**
 * Risk calculator for BreatheWell.
 *
 * Computes a composite risk level from the AQI value and user context
 * factors (child age, health conditions, activity level).
 */

import type { RiskLevel, UserContext } from '@shared/types.js';

/** Score thresholds for risk level classification. */
const RISK_THRESHOLDS = {
  LOW_MAX: 3,
  MODERATE_MAX: 5,
  HIGH_MAX: 7,
  VERY_HIGH_MAX: 9,
} as const;

/**
 * Computes the overall risk level from the AQI value and user context.
 * @param aqi - Current AQI value (0–500).
 * @param context - User's household and lifestyle context.
 * @returns Computed risk level.
 */
export function computeRiskLevel(aqi: number, context: UserContext): RiskLevel {
  const baseScore = getAqiBaseScore(aqi);
  const contextModifier = getContextModifier(context);
  const totalScore = Math.min(baseScore + contextModifier, 10);

  return scoreToRiskLevel(totalScore);
}

/**
 * Maps an AQI value to a base risk score (1–10).
 * @param aqi - AQI value (0–500).
 */
function getAqiBaseScore(aqi: number): number {
  if (aqi <= 50) {
    return 1;
  }
  if (aqi <= 100) {
    return 3;
  }
  if (aqi <= 150) {
    return 5;
  }
  if (aqi <= 200) {
    return 7;
  }
  if (aqi <= 300) {
    return 9;
  }
  return 10;
}

/**
 * Calculates the context modifier based on vulnerability factors.
 * @param context - User's household and lifestyle context.
 */
function getContextModifier(context: UserContext): number {
  let modifier = 0;

  modifier += getAgeModifier(context.childAgeGroup);
  modifier += getHealthModifier(context.healthConditions);
  modifier += getActivityModifier(context.activityLevel);

  return modifier;
}

/**
 * Returns the risk modifier for the child's age group.
 * @param ageGroup - Child age group.
 */
function getAgeModifier(ageGroup: UserContext['childAgeGroup']): number {
  const modifiers: Record<UserContext['childAgeGroup'], number> = {
    infant: 2,
    toddler: 1.5,
    preschool: 1,
    'school-age': 0.5,
  };
  return modifiers[ageGroup];
}

/**
 * Returns the risk modifier for health conditions.
 * @param conditions - Array of health conditions.
 */
function getHealthModifier(conditions: readonly UserContext['healthConditions'][number][]): number {
  if (conditions.includes('none')) {
    return 0;
  }

  let modifier = 0;
  if (conditions.includes('asthma')) {
    modifier += 1.5;
  }
  if (conditions.includes('respiratory')) {
    modifier += 1;
  }
  if (conditions.includes('cardiovascular')) {
    modifier += 1;
  }
  if (conditions.includes('allergies')) {
    modifier += 0.5;
  }

  return modifier;
}

/**
 * Returns the risk modifier for activity level.
 * @param level - Activity level.
 */
function getActivityModifier(level: UserContext['activityLevel']): number {
  const modifiers: Record<UserContext['activityLevel'], number> = {
    high: 1,
    moderate: 0.5,
    low: 0,
  };
  return modifiers[level];
}

/**
 * Maps a numeric score to a risk level category.
 * @param score - Total risk score (0–10).
 */
function scoreToRiskLevel(score: number): RiskLevel {
  if (score <= RISK_THRESHOLDS.LOW_MAX) {
    return 'low';
  }
  if (score <= RISK_THRESHOLDS.MODERATE_MAX) {
    return 'moderate';
  }
  if (score <= RISK_THRESHOLDS.HIGH_MAX) {
    return 'high';
  }
  if (score <= RISK_THRESHOLDS.VERY_HIGH_MAX) {
    return 'very-high';
  }
  return 'critical';
}
