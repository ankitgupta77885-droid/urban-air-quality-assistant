/**
 * Deterministic rules engine for the Urban Air Quality Assistant.
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
} from '@shared/types.js';

import { buildCommuteActions, buildOutdoorActions } from './activity-actions.js';
import { buildIndoorHacks, buildSustainableAlternatives } from './lifestyle-actions.js';
import { computeRiskLevel } from './risk-calculator.js';
import { buildEveningActions, buildMorningActions } from './routine-actions.js';

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

/**
 * Builds a plain-language risk summary for the given risk level and context.
 * @param riskLevel - Computed risk level.
 * @param aqiData - Current AQI data.
 * @param context - User context.
 * @returns Human-readable risk summary string.
 */
function buildRiskSummary(riskLevel: RiskLevel, aqiData: AqiData, context: UserContext): string {
  const childLabel = formatChildLabel(context.childAgeGroup);
  const aqiLabel = `AQI ${aqiData.aqi} (${aqiData.category})`;

  const summaries: Record<RiskLevel, string> = {
    low: `Air quality is ${aqiLabel}. Conditions are generally safe for your family, including your ${childLabel}.`,
    moderate: `Air quality is ${aqiLabel}. Take basic precautions, especially for your ${childLabel}.`,
    high: `Air quality is ${aqiLabel}. Limit outdoor exposure for your ${childLabel} and take protective measures.`,
    'very-high': `Air quality is ${aqiLabel}. Keep your ${childLabel} indoors and follow all protective steps below.`,
    critical: `Air quality is ${aqiLabel}. This is dangerous — keep your entire family indoors and follow emergency precautions.`,
  };

  return summaries[riskLevel];
}

/**
 * Builds the full list of recommended actions for the given risk/context.
 * @param riskLevel - Computed risk level.
 * @param aqiData - Current AQI data.
 * @param context - User context.
 * @returns Array of recommended actions sorted by category.
 */
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

/**
 * Formats a child age group into a human-readable label.
 * @param ageGroup - Child age group value.
 * @returns Human-readable child label.
 */
function formatChildLabel(ageGroup: UserContext['childAgeGroup']): string {
  const labels: Record<UserContext['childAgeGroup'], string> = {
    infant: 'infant',
    toddler: 'toddler',
    preschool: 'preschooler',
    'school-age': 'school-age child',
  };
  return labels[ageGroup];
}
