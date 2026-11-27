/**
 * Lifestyle action builders (indoor air hacks and sustainable alternatives).
 */

import { ADVICE_CATEGORY_ICONS, PM25_ELEVATED_THRESHOLD } from '../../shared/constants.js';
import type { AqiData, RecommendedAction, RiskLevel, UserContext } from '../../shared/types.js';

import { type ActionTemplate, createAction, isElevatedRisk } from './rules-engine-helpers.js';

const APARTMENT_SEAL_TEMPLATE: ActionTemplate = {
  title: 'Seal gaps around windows and doors',
  description:
    'Use weatherstripping or draft stoppers around windows and doors to prevent outdoor pollutants from seeping indoors.',
  impact:
    'Apartments often have more air leakage points than houses; sealing these reduces passive infiltration of outdoor pollutants.',
  benefit: 'Moderate',
};

const DIY_FILTER_TEMPLATE: ActionTemplate = {
  title: 'Create a DIY air filter',
  description:
    'Attach a MERV-13 or higher furnace filter to a box fan with tape. This creates an effective low-cost air cleaner.',
  impact:
    'A box-fan filter can meaningfully reduce indoor PM2.5 levels at a fraction of the cost of a commercial air purifier.',
  benefit: 'High',
};

const COOKING_EXHAUST_TEMPLATE: ActionTemplate = {
  title: 'Use kitchen exhaust while cooking',
  description:
    'Always run the range hood or kitchen exhaust fan while cooking, especially with gas stoves. Keep it running for 10 minutes after.',
  impact:
    'Cooking generates fine particles, NO₂ from gas burners, and volatile organic compounds that can irritate young lungs.',
  benefit: 'Moderate',
};

const CAR_ALTERNATIVE_TEMPLATE: ActionTemplate = {
  title: 'Try carpooling or public transit once a week',
  description:
    'Replace one car trip per week with carpooling, public transit, or combining errands into a single trip.',
  impact:
    "Reducing vehicle trips lowers both your family's direct exhaust exposure and contributes to overall urban air quality improvement.",
  benefit: 'Moderate',
};

/**
 * Builds indoor air quality hack actions.
 * @param riskLevel - Computed risk level.
 * @param aqiData - Current AQI data.
 * @param context - User context.
 */
export function buildIndoorHacks(
  riskLevel: RiskLevel,
  aqiData: AqiData,
  context: UserContext,
): RecommendedAction[] {
  const icon = ADVICE_CATEGORY_ICONS['indoor-air-hack'];
  const templates: ActionTemplate[] = [];

  if (context.homeType === 'apartment' || context.homeType === 'studio') {
    templates.push(APARTMENT_SEAL_TEMPLATE);
  }

  const hasPm25 = aqiData.pollutants.some(
    (p) => p.name === 'pm2_5' && p.value > PM25_ELEVATED_THRESHOLD,
  );
  if (hasPm25 || isElevatedRisk(riskLevel)) {
    templates.push(DIY_FILTER_TEMPLATE);
  }

  if (context.heatingSource === 'gas' || context.heatingSource === 'wood') {
    templates.push(getHeatingVentilationTemplate(context.heatingSource));
  }

  templates.push(COOKING_EXHAUST_TEMPLATE);
  return templates.map((template) => createAction('indoor-air-hack', icon, template));
}

/** Creates heating ventilation copy for combustion heat sources. */
function getHeatingVentilationTemplate(source: 'gas' | 'wood'): ActionTemplate {
  return {
    title: `Ventilate when using your ${source} heating`,
    description:
      source === 'wood'
        ? 'If using a wood stove or fireplace, ensure the flue is fully open and consider reducing use on high-AQI days.'
        : 'Ensure proper ventilation when gas heating is running. Use exhaust fans and crack a window in a distant room if safe.',
    impact: `${source === 'wood' ? 'Wood' : 'Gas'} combustion releases fine particles and gases indoors, adding to your family's total exposure.`,
    benefit: 'High',
  };
}

/**
 * Builds sustainable alternative actions.
 * @param riskLevel - Computed risk level.
 * @param context - User context.
 */
export function buildSustainableAlternatives(
  riskLevel: RiskLevel,
  context: UserContext,
): RecommendedAction[] {
  const icon = ADVICE_CATEGORY_ICONS['sustainable-alternative'];
  const templates: ActionTemplate[] = [];

  if (context.commuteMode === 'car') {
    templates.push(CAR_ALTERNATIVE_TEMPLATE);
  }

  if (context.heatingSource === 'wood' || context.heatingSource === 'oil') {
    templates.push(getHeatingAlternativeTemplate(context.heatingSource));
  }

  templates.push(getHouseplantTemplate(isElevatedRisk(riskLevel)));
  return templates.map((template) => createAction('sustainable-alternative', icon, template));
}

/** Creates clean heating switch copy for high-emission fuels. */
function getHeatingAlternativeTemplate(source: 'wood' | 'oil'): ActionTemplate {
  return {
    title: 'Consider switching to cleaner heating',
    description: `Explore heat pump or electric heating options as an alternative to ${source}. Many areas offer rebates for the switch.`,
    impact: `${source === 'wood' ? 'Wood burning' : 'Oil heating'} is a significant source of indoor and neighborhood particulate matter.`,
    benefit: 'High',
  };
}

/** Creates houseplant or herb growing copy scaled to risk level. */
function getHouseplantTemplate(elevated: boolean): ActionTemplate {
  return {
    title: elevated ? 'Add air-purifying houseplants' : 'Grow indoor herbs with your child',
    description: elevated
      ? 'Add spider plants, peace lilies, or snake plants to your home. While not a substitute for air purifiers, they contribute to a healthier indoor environment.'
      : 'Growing indoor herbs (basil, mint) is a fun family activity that also contributes marginally to indoor air freshness.',
    impact:
      'Indoor plants can help absorb some volatile organic compounds and add moisture to dry indoor air.',
    benefit: 'Low',
  };
}
