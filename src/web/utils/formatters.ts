/**
 * Formatting utilities for the frontend.
 *
 * Provides display-friendly labels for AQI, locations, timestamps, and categories.
 */

import { findAqiBreakpoint } from '@shared/aqi.js';
import { ADVICE_CATEGORY_LABELS } from '@shared/constants.js';
import type { AqiCategory, GeocodingResult } from '@shared/types.js';

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

const CATEGORY_LABELS: Readonly<Record<string, string>> = ADVICE_CATEGORY_LABELS;

/**
 * Returns a human-readable label for an advice category key.
 * @param category - Advice category key.
 * @returns Display label string.
 */
export function getCategoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? category;
}

/**
 * Formats a geocoding result into a comma-separated display label.
 * @param location - Location fields with name, optional admin region, and country.
 */
export function formatLocationLabel(
  location: Pick<GeocodingResult, 'name' | 'admin1' | 'country'>,
): string {
  return [location.name, location.admin1, location.country].filter(Boolean).join(', ');
}

/**
 * Formats an ISO timestamp string into local HH:MM time, falling back safely on invalid values.
 * @param timestamp - Timestamp string to format.
 */
export function formatLocalTime(timestamp: string): string {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return timestamp;
  }
  return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}
