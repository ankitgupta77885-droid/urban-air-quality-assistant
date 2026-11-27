/**
 * Routine action builders (morning and evening routines).
 */

import { ADVICE_CATEGORY_ICONS } from '../../shared/constants.js';
import type { RecommendedAction, RiskLevel, UserContext } from '../../shared/types.js';

import {
  type ActionTemplate,
  createAction,
  hasHealthCondition,
  isElevatedRisk,
} from './rules-engine-helpers.js';

const MOPPING_TEMPLATE: ActionTemplate = {
  title: 'Wet-mop floors before your child is active',
  description:
    'Damp-mop hard floors in the morning to capture settled dust and particles before your little one starts crawling or playing on the floor.',
  impact:
    'Removes settled particulate matter that children are exposed to at floor level, where concentrations can be higher.',
  benefit: 'Moderate',
};

const EVENING_PURIFIER_TEMPLATE: ActionTemplate = {
  title: 'Run the air purifier in the bedroom',
  description:
    'If you have an air purifier with a HEPA filter, run it in the bedroom for at least 30 minutes before bedtime and keep it on overnight.',
  impact:
    'HEPA filters can capture fine particles down to 0.3 microns, helping reduce nighttime respiratory irritation.',
  benefit: 'High',
};

/**
 * Builds morning routine actions.
 * @param riskLevel - Computed risk level.
 * @param context - User context.
 */
export function buildMorningActions(
  riskLevel: RiskLevel,
  context: UserContext,
): RecommendedAction[] {
  const icon = ADVICE_CATEGORY_ICONS['morning-routine'];
  const templates: ActionTemplate[] = [getVentilationTemplate(isElevatedRisk(riskLevel))];

  if (context.childAgeGroup === 'infant' || context.childAgeGroup === 'toddler') {
    templates.push(MOPPING_TEMPLATE);
  }

  return templates.map((template) => createAction('morning-routine', icon, template));
}

/** Creates morning ventilation action copy based on risk severity. */
function getVentilationTemplate(isHighRisk: boolean): ActionTemplate {
  return {
    title: isHighRisk ? 'Check AQI before opening windows' : 'Open windows for ventilation',
    description: isHighRisk
      ? 'Check the current AQI before opening any windows. Keep them closed if AQI is above 100.'
      : 'Open windows in the early morning when pollution levels are typically lowest for natural ventilation.',
    impact: isHighRisk
      ? 'Prevents outdoor pollutants from entering your home during peak pollution hours.'
      : 'Early morning air tends to have lower pollutant concentrations, improving indoor air quality.',
    benefit: isHighRisk ? 'High' : 'Moderate',
  };
}

/**
 * Builds evening routine actions.
 * @param riskLevel - Computed risk level.
 * @param context - User context.
 */
export function buildEveningActions(
  riskLevel: RiskLevel,
  context: UserContext,
): RecommendedAction[] {
  const icon = ADVICE_CATEGORY_ICONS['evening-routine'];
  const templates: ActionTemplate[] = [];

  if (hasHealthCondition(context, 'asthma') || hasHealthCondition(context, 'respiratory')) {
    templates.push(EVENING_PURIFIER_TEMPLATE);
  }

  templates.push(getEveningClothingTemplate(isElevatedRisk(riskLevel)));
  return templates.map((template) => createAction('evening-routine', icon, template));
}

/** Creates evening clothing change or shower copy. */
function getEveningClothingTemplate(elevated: boolean): ActionTemplate {
  return {
    title: elevated ? 'Shower and change after being outside' : 'Change outdoor clothes',
    description: elevated
      ? 'Shower and change all clothes after coming home from outside. This removes particles that settle on skin and fabric.'
      : 'Change your child out of outdoor clothes when you get home to avoid tracking pollutants indoors.',
    impact:
      'Particulate matter adheres to clothing and hair; removing these reduces continued indoor exposure.',
    benefit: elevated ? 'Moderate' : 'Low',
  };
}
