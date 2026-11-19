/**
 * Deterministic rules engine for the Urban Air Quality Assistant.
 *
 * Converts AQI data + user context into a risk level and structured
 * list of recommended actions. Pure function with no I/O.
 */

import { ADVICE_CATEGORY_ICONS } from '@shared/constants.js';
import type {
  AqiData,
  RecommendedAction,
  RiskLevel,
  RulesEngineOutput,
  UserContext,
} from '@shared/types.js';

import { computeRiskLevel } from './risk-calculator.js';

/* ── Public API ── */

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

/* ── Risk Summary ── */

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

/* ── Action Builders ── */

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
 * Builds morning routine actions.
 * @param riskLevel - Computed risk level.
 * @param context - User context.
 */
function buildMorningActions(riskLevel: RiskLevel, context: UserContext): RecommendedAction[] {
  const icon = ADVICE_CATEGORY_ICONS['morning-routine'] ?? '🌅';
  const actions: RecommendedAction[] = [];
  const isHighRisk = isElevatedRisk(riskLevel);

  actions.push({
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
  });

  if (context.childAgeGroup === 'infant' || context.childAgeGroup === 'toddler') {
    actions.push({
      category: 'morning-routine',
      title: 'Wet-mop floors before your child is active',
      description:
        'Damp-mop hard floors in the morning to capture settled dust and particles before your little one starts crawling or playing on the floor.',
      impact:
        'Removes settled particulate matter that children are exposed to at floor level, where concentrations can be higher.',
      benefit: 'Moderate',
      icon,
    });
  }

  return actions;
}

/**
 * Builds commute-related actions.
 * @param riskLevel - Computed risk level.
 * @param context - User context.
 */
function buildCommuteActions(riskLevel: RiskLevel, context: UserContext): RecommendedAction[] {
  const icon = ADVICE_CATEGORY_ICONS['commute'] ?? '🚗';
  const actions: RecommendedAction[] = [];

  if (context.commuteMode === 'work-from-home') {
    return actions;
  }

  if (context.commuteMode === 'bicycle' || context.commuteMode === 'walking') {
    actions.push({
      category: 'commute',
      title: isElevatedRisk(riskLevel) ? 'Switch to enclosed transport today' : 'Time your commute wisely',
      description: isElevatedRisk(riskLevel)
        ? 'Consider using public transit or a car instead of cycling/walking when AQI is elevated. If you must walk, wear a well-fitted N95/KN95 mask.'
        : 'Walk or cycle during lower-traffic hours when vehicle exhaust concentrations are reduced.',
      impact: isElevatedRisk(riskLevel)
        ? 'Active commuters breathe more deeply and inhale significantly more pollutants than those in enclosed vehicles.'
        : 'Timing your commute to avoid rush hour can reduce your pollution exposure during the trip.',
      benefit: isElevatedRisk(riskLevel) ? 'High' : 'Moderate',
      icon,
    });
  }

  if (context.commuteMode === 'car') {
    actions.push({
      category: 'commute',
      title: 'Use recirculation mode in your car',
      description:
        'Switch your car\'s ventilation to recirculation mode while driving through congested areas to reduce pollutant intake.',
      impact:
        'Recirculating cabin air can reduce in-vehicle particulate matter exposure compared to drawing in outside air.',
      benefit: 'Moderate',
      icon,
    });
  }

  if (context.commuteMode === 'public-transit') {
    actions.push({
      category: 'commute',
      title: isElevatedRisk(riskLevel) ? 'Wear a mask at transit stops' : 'Stand back from the platform edge',
      description: isElevatedRisk(riskLevel)
        ? 'Wear a well-fitted N95/KN95 mask while waiting at bus stops or train platforms where pollution concentrations are higher.'
        : 'Position yourself away from the road or platform edge where exhaust and brake-dust concentrations are highest.',
      impact:
        'Transit stops near busy roads have elevated pollutant levels; reducing direct exposure helps protect your respiratory health.',
      benefit: 'Moderate',
      icon,
    });
  }

  return actions;
}

/**
 * Builds outdoor activity actions.
 * @param riskLevel - Computed risk level.
 * @param context - User context.
 */
function buildOutdoorActions(riskLevel: RiskLevel, context: UserContext): RecommendedAction[] {
  const icon = ADVICE_CATEGORY_ICONS['outdoor-activity'] ?? '🏃';
  const actions: RecommendedAction[] = [];

  if (riskLevel === 'critical' || riskLevel === 'very-high') {
    actions.push({
      category: 'outdoor-activity',
      title: 'Avoid all outdoor activities',
      description:
        'Keep your family indoors today. Reschedule park visits, sports, and playground time until air quality improves.',
      impact:
        'Children breathe faster than adults and are closer to the ground, making them more vulnerable to high pollutant concentrations during physical activity.',
      benefit: 'High',
      icon,
    });
  } else if (riskLevel === 'high') {
    actions.push({
      category: 'outdoor-activity',
      title: 'Shorten outdoor playtime',
      description:
        'Limit outdoor play to 30 minutes or less. Choose locations away from busy roads and prefer green spaces.',
      impact:
        'Reducing outdoor exposure time proportionally reduces the total dose of pollutants inhaled.',
      benefit: 'High',
      icon,
    });
  } else {
    const activityTip =
      context.activityLevel === 'high'
        ? 'Schedule intense activities like running or cycling for early morning when pollution is lowest.'
        : 'Enjoy outdoor activities, but prefer parks and green areas over roadside locations.';

    actions.push({
      category: 'outdoor-activity',
      title: 'Enjoy outdoor time with awareness',
      description: activityTip,
      impact:
        'Green spaces generally have lower pollutant concentrations than areas near traffic, providing a healthier environment for play.',
      benefit: 'Moderate',
      icon,
    });
  }

  return actions;
}

/**
 * Builds evening routine actions.
 * @param riskLevel - Computed risk level.
 * @param context - User context.
 */
function buildEveningActions(riskLevel: RiskLevel, context: UserContext): RecommendedAction[] {
  const icon = ADVICE_CATEGORY_ICONS['evening-routine'] ?? '🌙';
  const actions: RecommendedAction[] = [];

  if (hasHealthCondition(context, 'asthma') || hasHealthCondition(context, 'respiratory')) {
    actions.push({
      category: 'evening-routine',
      title: 'Run the air purifier in the bedroom',
      description:
        'If you have an air purifier with a HEPA filter, run it in the bedroom for at least 30 minutes before bedtime and keep it on overnight.',
      impact:
        'HEPA filters can capture fine particles down to 0.3 microns, helping reduce nighttime respiratory irritation.',
      benefit: 'High',
      icon,
    });
  }

  actions.push({
    category: 'evening-routine',
    title: isElevatedRisk(riskLevel) ? 'Shower and change after being outside' : 'Change outdoor clothes',
    description: isElevatedRisk(riskLevel)
      ? 'Shower and change all clothes after coming home from outside. This removes particles that settle on skin and fabric.'
      : 'Change your child out of outdoor clothes when you get home to avoid tracking pollutants indoors.',
    impact:
      'Particulate matter adheres to clothing and hair; removing these reduces continued indoor exposure.',
    benefit: isElevatedRisk(riskLevel) ? 'Moderate' : 'Low',
    icon,
  });

  return actions;
}

/**
 * Builds indoor air quality hack actions.
 * @param riskLevel - Computed risk level.
 * @param aqiData - Current AQI data.
 * @param context - User context.
 */
function buildIndoorHacks(
  riskLevel: RiskLevel,
  aqiData: AqiData,
  context: UserContext,
): RecommendedAction[] {
  const icon = ADVICE_CATEGORY_ICONS['indoor-air-hack'] ?? '🏠';
  const actions: RecommendedAction[] = [];

  if (context.homeType === 'apartment' || context.homeType === 'studio') {
    actions.push({
      category: 'indoor-air-hack',
      title: 'Seal gaps around windows and doors',
      description:
        'Use weatherstripping or draft stoppers around windows and doors to prevent outdoor pollutants from seeping indoors.',
      impact:
        'Apartments often have more air leakage points than houses; sealing these reduces passive infiltration of outdoor pollutants.',
      benefit: 'Moderate',
      icon,
    });
  }

  const hasPm25 = aqiData.pollutants.some((p) => p.name === 'pm2_5' && p.value > 35);
  if (hasPm25 || isElevatedRisk(riskLevel)) {
    actions.push({
      category: 'indoor-air-hack',
      title: 'Create a DIY air filter',
      description:
        'Attach a MERV-13 or higher furnace filter to a box fan with tape. This creates an effective low-cost air cleaner.',
      impact:
        'A box-fan filter can meaningfully reduce indoor PM2.5 levels at a fraction of the cost of a commercial air purifier.',
      benefit: 'High',
      icon,
    });
  }

  if (context.heatingSource === 'gas' || context.heatingSource === 'wood') {
    actions.push({
      category: 'indoor-air-hack',
      title: `Ventilate when using your ${context.heatingSource} heating`,
      description:
        context.heatingSource === 'wood'
          ? 'If using a wood stove or fireplace, ensure the flue is fully open and consider reducing use on high-AQI days.'
          : 'Ensure proper ventilation when gas heating is running. Use exhaust fans and crack a window in a distant room if safe.',
      impact: `${context.heatingSource === 'wood' ? 'Wood' : 'Gas'} combustion releases fine particles and gases indoors, adding to your family's total exposure.`,
      benefit: 'High',
      icon,
    });
  }

  actions.push({
    category: 'indoor-air-hack',
    title: 'Use kitchen exhaust while cooking',
    description:
      'Always run the range hood or kitchen exhaust fan while cooking, especially with gas stoves. Keep it running for 10 minutes after.',
    impact:
      'Cooking generates fine particles, NO₂ from gas burners, and volatile organic compounds that can irritate young lungs.',
    benefit: 'Moderate',
    icon,
  });

  return actions;
}

/**
 * Builds sustainable alternative actions.
 * @param riskLevel - Computed risk level.
 * @param context - User context.
 */
function buildSustainableAlternatives(
  riskLevel: RiskLevel,
  context: UserContext,
): RecommendedAction[] {
  const icon = ADVICE_CATEGORY_ICONS['sustainable-alternative'] ?? '♻️';
  const actions: RecommendedAction[] = [];

  if (context.commuteMode === 'car') {
    actions.push({
      category: 'sustainable-alternative',
      title: 'Try carpooling or public transit once a week',
      description:
        'Replace one car trip per week with carpooling, public transit, or combining errands into a single trip.',
      impact:
        'Reducing vehicle trips lowers both your family\'s direct exhaust exposure and contributes to overall urban air quality improvement.',
      benefit: 'Moderate',
      icon,
    });
  }

  if (context.heatingSource === 'wood' || context.heatingSource === 'oil') {
    actions.push({
      category: 'sustainable-alternative',
      title: 'Consider switching to cleaner heating',
      description:
        `Explore heat pump or electric heating options as an alternative to ${context.heatingSource}. Many areas offer rebates for the switch.`,
      impact:
        `${context.heatingSource === 'wood' ? 'Wood burning' : 'Oil heating'} is a significant source of indoor and neighborhood particulate matter.`,
      benefit: 'High',
      icon,
    });
  }

  actions.push({
    category: 'sustainable-alternative',
    title: isElevatedRisk(riskLevel) ? 'Add air-purifying houseplants' : 'Grow indoor herbs with your child',
    description: isElevatedRisk(riskLevel)
      ? 'Add spider plants, peace lilies, or snake plants to your home. While not a substitute for air purifiers, they contribute to a healthier indoor environment.'
      : 'Growing indoor herbs (basil, mint) is a fun family activity that also contributes marginally to indoor air freshness.',
    impact:
      'Indoor plants can help absorb some volatile organic compounds and add moisture to dry indoor air.',
    benefit: 'Low',
    icon,
  });

  return actions;
}

/* ── Helpers ── */

/**
 * Checks whether the risk level is elevated (high, very-high, or critical).
 * @param riskLevel - Risk level to check.
 */
function isElevatedRisk(riskLevel: RiskLevel): boolean {
  return riskLevel === 'high' || riskLevel === 'very-high' || riskLevel === 'critical';
}

/**
 * Checks whether the user context includes a specific health condition.
 * @param context - User context.
 * @param condition - Health condition to check for.
 */
function hasHealthCondition(
  context: UserContext,
  condition: UserContext['healthConditions'][number],
): boolean {
  return context.healthConditions.includes(condition);
}

/**
 * Formats a child age group into a human-readable label.
 * @param ageGroup - Child age group value.
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
