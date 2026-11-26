/**
 * AQI categorization utility.
 *
 * Maps raw AQI values to their US EPA category, color class, and icon.
 */

import { findAqiBreakpoint } from '../../shared/aqi.js';
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

/**
 * Categorizes an AQI value into its US EPA category with styling info.
 * @param aqi - Raw AQI value (0–500+).
 * @returns Category information including label, color class, and icon.
 */
export function categorizeAqi(aqi: number): AqiCategoryInfo {
  const { category, colorClass, icon } = findAqiBreakpoint(aqi);
  return { category, colorClass, icon };
}
