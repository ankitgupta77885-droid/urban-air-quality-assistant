/**
 * Formatting utilities for the frontend.
 *
 * Provides display-friendly labels for AQI, pollutants, and categories.
 */

import { findAqiBreakpoint } from '@shared/aqi.js';
import { ADVICE_CATEGORY_LABELS } from '@shared/constants.js';
import type { AqiCategory } from '@shared/types.js';

/**
 * Returns the AQI category info for a given AQI value.
 * @param aqi - Raw AQI value.
 * @returns Object with category, colorClass, and icon.
 */
export function getAqiDisplay(aqi: number): {
  category: AqiCategory;
  colorClass: string;
  icon: string;
} {
  const { category, colorClass, icon } = findAqiBreakpoint(aqi);
  return { category, colorClass, icon };
}

/**
 * Returns a human-readable label for an advice category key.
 * @param category - Advice category key.
 * @returns Display label string.
 */
export function getCategoryLabel(category: string): string {
  return ADVICE_CATEGORY_LABELS[category] ?? category;
}
