/**
 * Shared helpers for the rules engine and category action builders.
 */

import type {
  ActionIconKey,
  AdviceCategory,
  HealthCondition,
  RecommendedAction,
  RiskLevel,
  UserContext,
} from '../../shared/types.js';

/** Content fields describing a recommended action before binding category/icon. */
export interface ActionTemplate {
  readonly title: string;
  readonly description: string;
  readonly impact: string;
  readonly benefit: RecommendedAction['benefit'];
}

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

/**
 * Constructs a complete {@link RecommendedAction} from a template and category metadata.
 * @param category - Target advice category.
 * @param icon - Validated icon key for the category.
 * @param template - Static or parameterized action text.
 */
export function createAction(
  category: AdviceCategory,
  icon: ActionIconKey,
  template: ActionTemplate,
): RecommendedAction {
  return { category, icon, ...template };
}
