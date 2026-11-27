/**
 * Deterministic rules engine for BreatheWell.
 *
 * Converts AQI data + user context into a risk level and structured
 * list of recommended actions. Pure function with no I/O.
 */

import type {
  AqiData,
  RecommendedAction,
  RiskLevel,
  RulesEngineOutput,
  UserContext,
} from '../../shared/types.js';

import { buildCommuteActions, buildOutdoorActions } from './activity-actions.js';
import { buildIndoorHacks, buildSustainableAlternatives } from './lifestyle-actions.js';
import { computeRiskLevel } from './risk-calculator.js';
import { buildEveningActions, buildMorningActions } from './routine-actions.js';

const CHILD_AGE_LABELS: Readonly<Record<UserContext['childAgeGroup'], string>> = {
  infant: 'infant',
  toddler: 'toddler',
  preschool: 'preschooler',
  'school-age': 'school-age child',
};

const RISK_SUMMARY_TEMPLATES: Readonly<
  Record<RiskLevel, (aqiLabel: string, childLabel: string) => string>
> = {
  low: (aqi, child) =>
    `Air quality is ${aqi}. Conditions are generally safe for your family, including your ${child}.`,
  moderate: (aqi, child) =>
    `Air quality is ${aqi}. Take basic precautions, especially for your ${child}.`,
  high: (aqi, child) =>
    `Air quality is ${aqi}. Limit outdoor exposure for your ${child} and take protective measures.`,
  'very-high': (aqi, child) =>
    `Air quality is ${aqi}. Keep your ${child} indoors and follow all protective steps below.`,
  critical: (aqi) =>
    `Air quality is ${aqi}. This is dangerous — keep your entire family indoors and follow emergency precautions.`,
};

/**
 * Generates a structured advice plan from AQI data and user context.
 * @param aqiData - Current air quality data for the user's location.
 * @param context - The user's household and lifestyle context.
 * @returns Deterministic rules-engine output with risk level and actions.
 */
export function generateAdvice(aqiData: AqiData, context: UserContext): RulesEngineOutput {
  const riskLevel = computeRiskLevel(aqiData.aqi, context);
  const riskSummary = buildRiskSummary(riskLevel, aqiData, context);
  const actions = buildActions(riskLevel, aqiData, context);

  return { riskLevel, riskSummary, actions };
}

/** Builds a plain-language risk summary for the given risk level and context. */
function buildRiskSummary(riskLevel: RiskLevel, aqiData: AqiData, context: UserContext): string {
  const aqiLabel = `AQI ${aqiData.aqi} (${aqiData.category})`;
  const childLabel = CHILD_AGE_LABELS[context.childAgeGroup];
  return RISK_SUMMARY_TEMPLATES[riskLevel](aqiLabel, childLabel);
}

/** Builds the combined list of recommended actions across all categories. */
function buildActions(
  riskLevel: RiskLevel,
  aqiData: AqiData,
  context: UserContext,
): RecommendedAction[] {
  return [
    ...buildMorningActions(riskLevel, context),
    ...buildCommuteActions(riskLevel, context),
    ...buildOutdoorActions(riskLevel, context),
    ...buildEveningActions(riskLevel, context),
    ...buildIndoorHacks(riskLevel, aqiData, context),
    ...buildSustainableAlternatives(riskLevel, context),
  ];
}
