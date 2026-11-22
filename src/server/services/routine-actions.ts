/**
 * Routine action builders (morning and evening routines).
 */

import { ADVICE_CATEGORY_ICONS } from '@shared/constants.js';
import type { ActionIconKey, RecommendedAction, RiskLevel, UserContext } from '@shared/types.js';

import { hasHealthCondition, isElevatedRisk } from './rules-engine-helpers.js';

/**
 * Builds morning routine actions.
 * @param riskLevel - Computed risk level.
 * @param context - User context.
 * @returns Morning routine recommended actions.
 */
export function buildMorningActions(
  riskLevel: RiskLevel,
  context: UserContext,
): RecommendedAction[] {
  const icon = ADVICE_CATEGORY_ICONS['morning-routine'] ?? 'sun';
  const actions: RecommendedAction[] = [getVentilationAction(isElevatedRisk(riskLevel), icon)];

  if (context.childAgeGroup === 'infant' || context.childAgeGroup === 'toddler') {
    actions.push(getMoppingAction(icon));
  }

  return actions;
}

/**
 * Creates morning ventilation action.
 * @param isHighRisk - Whether risk is elevated.
 * @param icon - Category icon.
 */
function getVentilationAction(isHighRisk: boolean, icon: ActionIconKey): RecommendedAction {
  return {
    category: 'morning-routine',
    title: isHighRisk ? 'Check AQI before opening windows' : 'Open windows for ventilation',
    description: isHighRisk
      ? 'Check the current AQI before opening any windows. Keep them closed if AQI is above 100.'
      : 'Open windows in the early morning when pollution levels are typically lowest for natural ventilation.',
    impact: isHighRisk
      ? 'Prevents outdoor pollutants from entering your home during peak pollution hours.'
      : 'Early morning air tends to have lower pollutant concentrations, improving indoor air quality.',
    benefit: isHighRisk ? 'High' : 'Moderate',
    icon,
  };
}

/**
 * Creates floor damp-mopping action for crawling children.
 * @param icon - Category icon.
 */
function getMoppingAction(icon: ActionIconKey): RecommendedAction {
  return {
    category: 'morning-routine',
    title: 'Wet-mop floors before your child is active',
    description:
      'Damp-mop hard floors in the morning to capture settled dust and particles before your little one starts crawling or playing on the floor.',
    impact:
      'Removes settled particulate matter that children are exposed to at floor level, where concentrations can be higher.',
    benefit: 'Moderate',
    icon,
  };
}

/**
 * Builds evening routine actions.
 * @param riskLevel - Computed risk level.
 * @param context - User context.
 * @returns Evening routine recommended actions.
 */
export function buildEveningActions(
  riskLevel: RiskLevel,
  context: UserContext,
): RecommendedAction[] {
  const icon = ADVICE_CATEGORY_ICONS['evening-routine'] ?? 'moon';
  const actions: RecommendedAction[] = [];

  if (hasHealthCondition(context, 'asthma') || hasHealthCondition(context, 'respiratory')) {
    actions.push(getEveningPurifierAction(icon));
  }

  actions.push(getEveningClothingAction(isElevatedRisk(riskLevel), icon));
  return actions;
}

/** Creates evening air purifier action. */
function getEveningPurifierAction(icon: ActionIconKey): RecommendedAction {
  return {
    category: 'evening-routine',
    title: 'Run the air purifier in the bedroom',
    description:
      'If you have an air purifier with a HEPA filter, run it in the bedroom for at least 30 minutes before bedtime and keep it on overnight.',
    impact:
      'HEPA filters can capture fine particles down to 0.3 microns, helping reduce nighttime respiratory irritation.',
    benefit: 'High',
    icon,
  };
}

/** Creates evening clothing change / shower action. */
function getEveningClothingAction(elevated: boolean, icon: ActionIconKey): RecommendedAction {
  return {
    category: 'evening-routine',
    title: elevated ? 'Shower and change after being outside' : 'Change outdoor clothes',
    description: elevated
      ? 'Shower and change all clothes after coming home from outside. This removes particles that settle on skin and fabric.'
      : 'Change your child out of outdoor clothes when you get home to avoid tracking pollutants indoors.',
    impact:
      'Particulate matter adheres to clothing and hair; removing these reduces continued indoor exposure.',
    benefit: elevated ? 'Moderate' : 'Low',
    icon,
  };
}
