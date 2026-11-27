/**
 * Activity action builders (commute and outdoor activity).
 */

import { ADVICE_CATEGORY_ICONS } from '../../shared/constants.js';
import type { RecommendedAction, RiskLevel, UserContext } from '../../shared/types.js';

import { type ActionTemplate, createAction, isElevatedRisk } from './rules-engine-helpers.js';

const CAR_COMMUTE_TEMPLATE: ActionTemplate = {
  title: 'Use recirculation mode in your car',
  description:
    "Switch your car's ventilation to recirculation mode while driving through congested areas to reduce pollutant intake.",
  impact:
    'Recirculating cabin air can reduce in-vehicle particulate matter exposure compared to drawing in outside air.',
  benefit: 'Moderate',
};

const CRITICAL_OUTDOOR_TEMPLATE: ActionTemplate = {
  title: 'Avoid all outdoor activities',
  description:
    'Keep your family indoors today. Reschedule park visits, sports, and playground time until air quality improves.',
  impact:
    'Children breathe faster than adults and are closer to the ground, making them more vulnerable to high pollutant concentrations during physical activity.',
  benefit: 'High',
};

const HIGH_RISK_OUTDOOR_TEMPLATE: ActionTemplate = {
  title: 'Shorten outdoor playtime',
  description:
    'Limit outdoor play to 30 minutes or less. Choose locations away from busy roads and prefer green spaces.',
  impact:
    'Reducing outdoor exposure time proportionally reduces the total dose of pollutants inhaled.',
  benefit: 'High',
};

/**
 * Builds commute-related actions tailored to the family's commute mode and risk.
 * @param riskLevel - Computed risk level.
 * @param context - User context.
 */
export function buildCommuteActions(
  riskLevel: RiskLevel,
  context: UserContext,
): RecommendedAction[] {
  const icon = ADVICE_CATEGORY_ICONS['commute'];
  const elevated = isElevatedRisk(riskLevel);
  const template = selectCommuteTemplate(context.commuteMode, elevated);
  return template ? [createAction('commute', icon, template)] : [];
}

/** Selects the commute action template for a mode, or null for work-from-home. */
function selectCommuteTemplate(
  mode: UserContext['commuteMode'],
  elevated: boolean,
): ActionTemplate | null {
  if (mode === 'bicycle' || mode === 'walking') {
    return getActiveCommuteTemplate(elevated);
  }
  if (mode === 'car') {
    return CAR_COMMUTE_TEMPLATE;
  }
  if (mode === 'public-transit') {
    return getTransitCommuteTemplate(elevated);
  }
  return null;
}

/** Returns action copy for walking or cycling commuters. */
function getActiveCommuteTemplate(elevated: boolean): ActionTemplate {
  return {
    title: elevated ? 'Switch to enclosed transport today' : 'Time your commute wisely',
    description: elevated
      ? 'Consider using public transit or a car instead of cycling/walking when AQI is elevated. If you must walk, wear a well-fitted N95/KN95 mask.'
      : 'Walk or cycle during lower-traffic hours when vehicle exhaust concentrations are reduced.',
    impact: elevated
      ? 'Active commuters breathe more deeply and inhale significantly more pollutants than those in enclosed vehicles.'
      : 'Timing your commute to avoid rush hour can reduce your pollution exposure during the trip.',
    benefit: elevated ? 'High' : 'Moderate',
  };
}

/** Returns action copy for public transit commuters. */
function getTransitCommuteTemplate(elevated: boolean): ActionTemplate {
  return {
    title: elevated ? 'Wear a mask at transit stops' : 'Stand back from the platform edge',
    description: elevated
      ? 'Wear a well-fitted N95/KN95 mask while waiting at bus stops or train platforms where pollution concentrations are higher.'
      : 'Position yourself away from the road or platform edge where exhaust and brake-dust concentrations are highest.',
    impact:
      'Transit stops near busy roads have elevated pollutant levels; reducing direct exposure helps protect your respiratory health.',
    benefit: 'Moderate',
  };
}

/**
 * Builds outdoor activity actions based on risk severity and activity level.
 * @param riskLevel - Computed risk level.
 * @param context - User context.
 */
export function buildOutdoorActions(
  riskLevel: RiskLevel,
  context: UserContext,
): RecommendedAction[] {
  const icon = ADVICE_CATEGORY_ICONS['outdoor-activity'];
  const template = selectOutdoorTemplate(riskLevel, context.activityLevel);
  return [createAction('outdoor-activity', icon, template)];
}

/** Selects the outdoor activity template matching risk severity. */
function selectOutdoorTemplate(
  riskLevel: RiskLevel,
  activityLevel: UserContext['activityLevel'],
): ActionTemplate {
  if (riskLevel === 'critical' || riskLevel === 'very-high') {
    return CRITICAL_OUTDOOR_TEMPLATE;
  }
  if (riskLevel === 'high') {
    return HIGH_RISK_OUTDOOR_TEMPLATE;
  }
  return {
    title: 'Enjoy outdoor time with awareness',
    description:
      activityLevel === 'high'
        ? 'Schedule intense activities like running or cycling for early morning when pollution is lowest.'
        : 'Enjoy outdoor activities, but prefer parks and green areas over roadside locations.',
    impact:
      'Green spaces generally have lower pollutant concentrations than areas near traffic, providing a healthier environment for play.',
    benefit: 'Moderate',
  };
}
