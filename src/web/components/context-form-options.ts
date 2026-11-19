/**
 * Form field options for household context collection.
 */

/** Youngest child age group options [value, display]. */
export const CHILD_AGE_OPTIONS: readonly [string, string][] = [
  ['infant', 'Infant (0–1 year)'],
  ['toddler', 'Toddler (1–3 years)'],
  ['preschool', 'Preschooler (3–5 years)'],
  ['school-age', 'School-age (5–8 years)'],
] as const;

/** Health condition options [value, display]. */
export const HEALTH_CONDITION_OPTIONS: readonly [string, string][] = [
  ['none', 'None'],
  ['asthma', 'Asthma'],
  ['allergies', 'Allergies'],
  ['respiratory', 'Other respiratory condition'],
  ['cardiovascular', 'Cardiovascular condition'],
] as const;

/** Home type options [value, display]. */
export const HOME_TYPE_OPTIONS: readonly [string, string][] = [
  ['apartment', 'Apartment / Flat'],
  ['house', 'House'],
  ['studio', 'Studio'],
] as const;

/** Commute mode options [value, display]. */
export const COMMUTE_MODE_OPTIONS: readonly [string, string][] = [
  ['car', 'Car'],
  ['public-transit', 'Public transit'],
  ['bicycle', 'Bicycle'],
  ['walking', 'Walking'],
  ['work-from-home', 'Work from home'],
] as const;

/** Outdoor activity level options [value, display]. */
export const ACTIVITY_LEVEL_OPTIONS: readonly [string, string][] = [
  ['low', 'Low — mostly indoors'],
  ['moderate', 'Moderate — some outdoor time'],
  ['high', 'High — very active outdoors'],
] as const;

/** Primary heating source options [value, display]. */
export const HEATING_SOURCE_OPTIONS: readonly [string, string][] = [
  ['electric', 'Electric'],
  ['gas', 'Natural gas'],
  ['heat-pump', 'Heat pump'],
  ['wood', 'Wood / Biomass'],
  ['oil', 'Oil'],
  ['none', 'None / Not applicable'],
] as const;
