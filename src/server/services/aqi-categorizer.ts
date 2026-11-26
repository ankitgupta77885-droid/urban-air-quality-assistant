/**
 * AQI categorization utility.
 *
 * Maps raw AQI values to their US EPA category, color class, and icon.
 */

import { AQI_BREAKPOINTS } from '../../shared/constants.js';
import type { AqiCategory } from '../../shared/types.js';

/** Result of categorizing an AQI value. */
export interface AqiCategoryInfo {
  /** Human-readable category label. */
  readonly category: AqiCategory;
  /** CSS class name for styling. */
  readonly colorClass: string;
  /** Accessible icon for the category. */
  readonly icon: string;
}

/** Default category for out-of-range AQI values. */
const HAZARDOUS_FALLBACK: AqiCategoryInfo = {
  category: 'Hazardous',
  colorClass: 'aqi-hazardous',
  icon: '🟤',
};

/**
 * Categorizes an AQI value into its US EPA category with styling info.
 * @param aqi - Raw AQI value (0–500+).
 * @returns Category information including label, color class, and icon.
 */
export function categorizeAqi(aqi: number): AqiCategoryInfo {
  const breakpoint = AQI_BREAKPOINTS.find((bp) => aqi >= bp.min && aqi <= bp.max);

  if (!breakpoint) {
    return HAZARDOUS_FALLBACK;
  }

  return {
    category: breakpoint.category,
    colorClass: breakpoint.colorClass,
    icon: breakpoint.icon,
  };
}
