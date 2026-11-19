/**
 * Shared helper functions for rules engine and action builders.
 */

import type { HealthCondition, RiskLevel, UserContext } from '@shared/types.js';

/**
 * Checks whether the risk level is elevated (high, very-high, or critical).
 * @param riskLevel - Risk level to check.
 * @returns True if risk is elevated.
 */
export function isElevatedRisk(riskLevel: RiskLevel): boolean {
  return riskLevel === 'high' || riskLevel === 'very-high' || riskLevel === 'critical';
}

/**
 * Checks whether the user context includes a specific health condition.
 * @param context - User context.
 * @param condition - Health condition to check for.
 * @returns True if condition is present.
 */
export function hasHealthCondition(context: UserContext, condition: HealthCondition): boolean {
  return context.healthConditions.includes(condition);
}
