/**
 * Activity action builders (commute and outdoor activity).
 */

import { ADVICE_CATEGORY_ICONS } from '@shared/constants.js';
import type { RecommendedAction, RiskLevel, UserContext } from '@shared/types.js';

import { isElevatedRisk } from './rules-engine-helpers.js';

/**
 * Builds commute-related actions.
 * @param riskLevel - Computed risk level.
 * @param context - User context.
 * @returns Commute recommended actions.
 */
export function buildCommuteActions(
  riskLevel: RiskLevel,
  context: UserContext,
): RecommendedAction[] {
  const icon = ADVICE_CATEGORY_ICONS['commute'] ?? '🚗';
  const actions: RecommendedAction[] = [];
  const elevated = isElevatedRisk(riskLevel);

  if (context.commuteMode === 'bicycle' || context.commuteMode === 'walking') {
    actions.push(getActiveCommuteAction(elevated, icon));
  } else if (context.commuteMode === 'car') {
    actions.push(getCarCommuteAction(icon));
  } else if (context.commuteMode === 'public-transit') {
    actions.push(getTransitCommuteAction(elevated, icon));
  }

  return actions;
}

/**
 * Creates action for active commuting (walking or cycling).
 * @param elevated - Whether risk is elevated.
 * @param icon - Category icon.
 */
function getActiveCommuteAction(elevated: boolean, icon: string): RecommendedAction {
  return {
    category: 'commute',
    title: elevated ? 'Switch to enclosed transport today' : 'Time your commute wisely',
    description: elevated
      ? 'Consider using public transit or a car instead of cycling/walking when AQI is elevated. If you must walk, wear a well-fitted N95/KN95 mask.'
      : 'Walk or cycle during lower-traffic hours when vehicle exhaust concentrations are reduced.',
    impact: elevated
      ? 'Active commuters breathe more deeply and inhale significantly more pollutants than those in enclosed vehicles.'
      : 'Timing your commute to avoid rush hour can reduce your pollution exposure during the trip.',
    benefit: elevated ? 'High' : 'Moderate',
    icon,
  };
}

/**
 * Creates action for car commuting.
 * @param icon - Category icon.
 */
function getCarCommuteAction(icon: string): RecommendedAction {
  return {
    category: 'commute',
    title: 'Use recirculation mode in your car',
    description:
      "Switch your car's ventilation to recirculation mode while driving through congested areas to reduce pollutant intake.",
    impact:
      'Recirculating cabin air can reduce in-vehicle particulate matter exposure compared to drawing in outside air.',
    benefit: 'Moderate',
    icon,
  };
}

/**
 * Creates action for transit commuting.
 * @param elevated - Whether risk is elevated.
 * @param icon - Category icon.
 */
function getTransitCommuteAction(elevated: boolean, icon: string): RecommendedAction {
  return {
    category: 'commute',
    title: elevated ? 'Wear a mask at transit stops' : 'Stand back from the platform edge',
    description: elevated
      ? 'Wear a well-fitted N95/KN95 mask while waiting at bus stops or train platforms where pollution concentrations are higher.'
      : 'Position yourself away from the road or platform edge where exhaust and brake-dust concentrations are highest.',
    impact:
      'Transit stops near busy roads have elevated pollutant levels; reducing direct exposure helps protect your respiratory health.',
    benefit: 'Moderate',
    icon,
  };
}

/**
 * Builds outdoor activity actions.
 * @param riskLevel - Computed risk level.
 * @param context - User context.
 * @returns Outdoor activity recommended actions.
 */
export function buildOutdoorActions(
  riskLevel: RiskLevel,
  context: UserContext,
): RecommendedAction[] {
  const icon = ADVICE_CATEGORY_ICONS['outdoor-activity'] ?? '🏃';

  if (riskLevel === 'critical' || riskLevel === 'very-high') {
    return [getCriticalOutdoorAction(icon)];
  }

  if (riskLevel === 'high') {
    return [getHighRiskOutdoorAction(icon)];
  }

  return [getStandardOutdoorAction(context.activityLevel, icon)];
}

/** Creates outdoor cancellation action for critical/very-high risk. */
function getCriticalOutdoorAction(icon: string): RecommendedAction {
  return {
    category: 'outdoor-activity',
    title: 'Avoid all outdoor activities',
    description:
      'Keep your family indoors today. Reschedule park visits, sports, and playground time until air quality improves.',
    impact:
      'Children breathe faster than adults and are closer to the ground, making them more vulnerable to high pollutant concentrations during physical activity.',
    benefit: 'High',
    icon,
  };
}

/** Creates shortened outdoor play action for high risk. */
function getHighRiskOutdoorAction(icon: string): RecommendedAction {
  return {
    category: 'outdoor-activity',
    title: 'Shorten outdoor playtime',
    description:
      'Limit outdoor play to 30 minutes or less. Choose locations away from busy roads and prefer green spaces.',
    impact:
      'Reducing outdoor exposure time proportionally reduces the total dose of pollutants inhaled.',
    benefit: 'High',
    icon,
  };
}

/** Creates outdoor awareness action for low/moderate risk. */
function getStandardOutdoorAction(activityLevel: string, icon: string): RecommendedAction {
  const tip =
    activityLevel === 'high'
      ? 'Schedule intense activities like running or cycling for early morning when pollution is lowest.'
      : 'Enjoy outdoor activities, but prefer parks and green areas over roadside locations.';

  return {
    category: 'outdoor-activity',
    title: 'Enjoy outdoor time with awareness',
    description: tip,
    impact:
      'Green spaces generally have lower pollutant concentrations than areas near traffic, providing a healthier environment for play.',
    benefit: 'Moderate',
    icon,
  };
}
