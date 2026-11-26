/**
 * Lifestyle action builders (indoor air hacks and sustainable alternatives).
 */

import { ADVICE_CATEGORY_ICONS } from '../../shared/constants.js';
import type {
  ActionIconKey,
  AqiData,
  RecommendedAction,
  RiskLevel,
  UserContext,
} from '../../shared/types.js';

import { isElevatedRisk } from './rules-engine-helpers.js';

/**
 * Builds indoor air quality hack actions.
 * @param riskLevel - Computed risk level.
 * @param aqiData - Current AQI data.
 * @param context - User context.
 * @returns Indoor hack recommended actions.
 */
export function buildIndoorHacks(
  riskLevel: RiskLevel,
  aqiData: AqiData,
  context: UserContext,
): RecommendedAction[] {
  const icon = ADVICE_CATEGORY_ICONS['indoor-air-hack'] ?? 'home';
  const actions: RecommendedAction[] = [];

  if (context.homeType === 'apartment' || context.homeType === 'studio') {
    actions.push(getApartmentSealAction(icon));
  }

  const hasPm25 = aqiData.pollutants.some((p) => p.name === 'pm2_5' && p.value > 35);
  if (hasPm25 || isElevatedRisk(riskLevel)) {
    actions.push(getDiyFilterAction(icon));
  }

  if (context.heatingSource === 'gas' || context.heatingSource === 'wood') {
    actions.push(getHeatingVentilationAction(context.heatingSource, icon));
  }

  actions.push(getCookingExhaustAction(icon));
  return actions;
}

/** Creates apartment gap-sealing action. */
function getApartmentSealAction(icon: ActionIconKey): RecommendedAction {
  return {
    category: 'indoor-air-hack',
    title: 'Seal gaps around windows and doors',
    description:
      'Use weatherstripping or draft stoppers around windows and doors to prevent outdoor pollutants from seeping indoors.',
    impact:
      'Apartments often have more air leakage points than houses; sealing these reduces passive infiltration of outdoor pollutants.',
    benefit: 'Moderate',
    icon,
  };
}

/** Creates DIY box-fan air cleaner action. */
function getDiyFilterAction(icon: ActionIconKey): RecommendedAction {
  return {
    category: 'indoor-air-hack',
    title: 'Create a DIY air filter',
    description:
      'Attach a MERV-13 or higher furnace filter to a box fan with tape. This creates an effective low-cost air cleaner.',
    impact:
      'A box-fan filter can meaningfully reduce indoor PM2.5 levels at a fraction of the cost of a commercial air purifier.',
    benefit: 'High',
    icon,
  };
}

/** Creates heating ventilation action. */
function getHeatingVentilationAction(
  source: 'gas' | 'wood',
  icon: ActionIconKey,
): RecommendedAction {
  return {
    category: 'indoor-air-hack',
    title: `Ventilate when using your ${source} heating`,
    description:
      source === 'wood'
        ? 'If using a wood stove or fireplace, ensure the flue is fully open and consider reducing use on high-AQI days.'
        : 'Ensure proper ventilation when gas heating is running. Use exhaust fans and crack a window in a distant room if safe.',
    impact: `${source === 'wood' ? 'Wood' : 'Gas'} combustion releases fine particles and gases indoors, adding to your family's total exposure.`,
    benefit: 'High',
    icon,
  };
}

/** Creates cooking exhaust fan action. */
function getCookingExhaustAction(icon: ActionIconKey): RecommendedAction {
  return {
    category: 'indoor-air-hack',
    title: 'Use kitchen exhaust while cooking',
    description:
      'Always run the range hood or kitchen exhaust fan while cooking, especially with gas stoves. Keep it running for 10 minutes after.',
    impact:
      'Cooking generates fine particles, NO₂ from gas burners, and volatile organic compounds that can irritate young lungs.',
    benefit: 'Moderate',
    icon,
  };
}

/**
 * Builds sustainable alternative actions.
 * @param riskLevel - Computed risk level.
 * @param context - User context.
 * @returns Sustainable alternative recommended actions.
 */
export function buildSustainableAlternatives(
  riskLevel: RiskLevel,
  context: UserContext,
): RecommendedAction[] {
  const icon = ADVICE_CATEGORY_ICONS['sustainable-alternative'] ?? 'leaf';
  const actions: RecommendedAction[] = [];

  if (context.commuteMode === 'car') {
    actions.push(getCarAlternativeAction(icon));
  }

  if (context.heatingSource === 'wood' || context.heatingSource === 'oil') {
    actions.push(getHeatingAlternativeAction(context.heatingSource, icon));
  }

  actions.push(getHouseplantAction(isElevatedRisk(riskLevel), icon));
  return actions;
}

/** Creates carpool/transit replacement action. */
function getCarAlternativeAction(icon: ActionIconKey): RecommendedAction {
  return {
    category: 'sustainable-alternative',
    title: 'Try carpooling or public transit once a week',
    description:
      'Replace one car trip per week with carpooling, public transit, or combining errands into a single trip.',
    impact:
      "Reducing vehicle trips lowers both your family's direct exhaust exposure and contributes to overall urban air quality improvement.",
    benefit: 'Moderate',
    icon,
  };
}

/** Creates clean heating switch action. */
function getHeatingAlternativeAction(
  source: 'wood' | 'oil',
  icon: ActionIconKey,
): RecommendedAction {
  return {
    category: 'sustainable-alternative',
    title: 'Consider switching to cleaner heating',
    description: `Explore heat pump or electric heating options as an alternative to ${source}. Many areas offer rebates for the switch.`,
    impact: `${source === 'wood' ? 'Wood burning' : 'Oil heating'} is a significant source of indoor and neighborhood particulate matter.`,
    benefit: 'High',
    icon,
  };
}

/** Creates houseplant/herb growing action. */
function getHouseplantAction(elevated: boolean, icon: ActionIconKey): RecommendedAction {
  return {
    category: 'sustainable-alternative',
    title: elevated ? 'Add air-purifying houseplants' : 'Grow indoor herbs with your child',
    description: elevated
      ? 'Add spider plants, peace lilies, or snake plants to your home. While not a substitute for air purifiers, they contribute to a healthier indoor environment.'
      : 'Growing indoor herbs (basil, mint) is a fun family activity that also contributes marginally to indoor air freshness.',
    impact:
      'Indoor plants can help absorb some volatile organic compounds and add moisture to dry indoor air.',
    benefit: 'Low',
    icon,
  };
}
