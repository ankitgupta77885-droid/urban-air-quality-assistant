/**
 * Formatting utilities for the frontend.
 *
 * Provides display-friendly labels for AQI, pollutants, and categories.
 */

import { ADVICE_CATEGORY_LABELS, AQI_BREAKPOINTS } from '@shared/constants.js';
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
  const bp = AQI_BREAKPOINTS.find((b) => aqi >= b.min && aqi <= b.max);
  return bp
    ? { category: bp.category, colorClass: bp.colorClass, icon: bp.icon }
    : { category: 'Hazardous', colorClass: 'aqi-hazardous', icon: '🟤' };
}

/**
 * Returns a human-readable label for an advice category key.
 * @param category - Advice category key.
 * @returns Display label string.
 */
export function getCategoryLabel(category: string): string {
  return ADVICE_CATEGORY_LABELS[category] ?? category;
}
