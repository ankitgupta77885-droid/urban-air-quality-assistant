/**
 * Risk calculator for BreatheWell.
 *
 * Computes a composite risk level from the AQI value and user context
 * factors (child age, health conditions, activity level).
 */

import {
  ACTIVITY_RISK_MODIFIERS,
  AGE_RISK_MODIFIERS,
  findAqiBreakpoint,
  HEALTH_RISK_MODIFIERS,
  MAX_RISK_SCORE,
} from '../../shared/aqi.js';
import type { RiskLevel, UserContext } from '../../shared/types.js';

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
  const totalScore = Math.min(baseScore + contextModifier, MAX_RISK_SCORE);

  return scoreToRiskLevel(totalScore);
}

/**
 * Maps an AQI value to a base risk score (1–10).
 * @param aqi - AQI value (0–500).
 */
function getAqiBaseScore(aqi: number): number {
  return findAqiBreakpoint(aqi).baseRiskScore;
}

/**
 * Calculates the context modifier based on vulnerability factors.
 * @param context - User's household and lifestyle context.
 */
function getContextModifier(context: UserContext): number {
  return (
    AGE_RISK_MODIFIERS[context.childAgeGroup] +
    getHealthModifier(context.healthConditions) +
    ACTIVITY_RISK_MODIFIERS[context.activityLevel]
  );
}

/**
 * Returns the risk modifier for health conditions.
 * @param conditions - Array of health conditions.
 */
function getHealthModifier(conditions: readonly UserContext['healthConditions'][number][]): number {
  if (conditions.includes('none')) {
    return 0;
  }

  return conditions.reduce((total, condition) => total + HEALTH_RISK_MODIFIERS[condition], 0);
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
