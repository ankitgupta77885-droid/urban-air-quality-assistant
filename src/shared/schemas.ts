/* v8 ignore start */
/**
 * Shared Zod schemas for input validation and response parsing.
 *
 * Used on the server for request validation and Gemini response parsing,
 * and importable from shared for type inference.
 */
/* v8 ignore stop */

import { z } from 'zod';

import {
  LATITUDE_MAX,
  LATITUDE_MIN,
  LONGITUDE_MAX,
  LONGITUDE_MIN,
  MAX_HEALTH_CONDITIONS,
  MAX_SEARCH_QUERY_LENGTH,
} from './constants.js';

/* ── Enums ── */

/** Valid child age group values. */
export const childAgeGroupSchema = z.enum(['infant', 'toddler', 'preschool', 'school-age']);

/** Valid health condition values. */
export const healthConditionSchema = z.enum([
  'asthma',
  'allergies',
  'respiratory',
  'cardiovascular',
  'none',
]);

/** Valid home type values. */
export const homeTypeSchema = z.enum(['apartment', 'house', 'studio']);

/** Valid commute mode values. */
export const commuteModeSchema = z.enum([
  'car',
  'public-transit',
  'bicycle',
  'walking',
  'work-from-home',
]);

/** Valid activity level values. */
export const activityLevelSchema = z.enum(['low', 'moderate', 'high']);

/** Valid heating source values. */
export const heatingSourceSchema = z.enum(['gas', 'electric', 'wood', 'oil', 'heat-pump', 'none']);

/** Valid advice category values. */
export const adviceCategorySchema = z.enum([
  'morning-routine',
  'commute',
  'outdoor-activity',
  'evening-routine',
  'indoor-air-hack',
  'sustainable-alternative',
]);

/** Valid risk level values. */
export const riskLevelSchema = z.enum(['low', 'moderate', 'high', 'very-high', 'critical']);

/* ── User Context ── */

/** Schema for the user context form input. */
export const userContextSchema = z.object({
  childAgeGroup: childAgeGroupSchema,
  healthConditions: z
    .array(healthConditionSchema)
    .min(1, 'Select at least one health condition option')
    .max(MAX_HEALTH_CONDITIONS, `Select at most ${MAX_HEALTH_CONDITIONS} health conditions`),
  homeType: homeTypeSchema,
  commuteMode: commuteModeSchema,
  activityLevel: activityLevelSchema,
  heatingSource: heatingSourceSchema,
});

/* ── Coordinate Schemas ── */

/** Schema for latitude validation. */
export const latitudeSchema = z.coerce
  .number()
  .min(LATITUDE_MIN, `Latitude must be at least ${LATITUDE_MIN}`)
  .max(LATITUDE_MAX, `Latitude must be at most ${LATITUDE_MAX}`);

/** Schema for longitude validation. */
export const longitudeSchema = z.coerce
  .number()
  .min(LONGITUDE_MIN, `Longitude must be at least ${LONGITUDE_MIN}`)
  .max(LONGITUDE_MAX, `Longitude must be at most ${LONGITUDE_MAX}`);

/* ── API Request Schemas ── */

/** Schema for geocoding search query parameters. */
export const geocodingQuerySchema = z.object({
  q: z
    .string()
    .trim()
    .min(1, 'Search query is required')
    .max(MAX_SEARCH_QUERY_LENGTH, `Query must be at most ${MAX_SEARCH_QUERY_LENGTH} characters`),
});

/** Schema for AQI request query parameters. */
export const aqiQuerySchema = z.object({
  lat: latitudeSchema,
  lon: longitudeSchema,
});

/** Schema for the POST /api/advice request body. */
export const adviceRequestSchema = z.object({
  latitude: latitudeSchema,
  longitude: longitudeSchema,
  context: userContextSchema,
});

/* ── Gemini Response Schema ── */

/** Allowed icon keys for personalized actions. */
export const ACTION_ICON_KEYS = [
  'sun',
  'moon',
  'home',
  'car',
  'walk',
  'leaf',
  'wind',
  'shield',
  'sparkle',
  'alert',
] as const;

/** Schema for action icon keys. */
export const actionIconKeySchema = z.enum(ACTION_ICON_KEYS);

/** Schema for a single personalized action from Gemini. */
export const personalizedActionSchema = z.object({
  category: adviceCategorySchema,
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(1000),
  impact: z.string().min(1).max(500),
  benefit: z.string().min(1).max(100),
  icon: actionIconKeySchema,
});

/** Schema for the full Gemini personalized advice response. */
export const geminiResponseSchema = z.object({
  riskLevel: riskLevelSchema,
  riskSummary: z.string().min(1).max(500),
  actions: z.array(personalizedActionSchema).min(1).max(20),
});

/* ── Open-Meteo External API Schemas ── */

/** Schema for Open-Meteo Air Quality current payload. */
export const openMeteoAqiCurrentSchema = z.object({
  time: z.string(),
  us_aqi: z.number(),
  pm2_5: z.number(),
  pm10: z.number(),
  nitrogen_dioxide: z.number(),
  ozone: z.number(),
  sulphur_dioxide: z.number(),
  carbon_monoxide: z.number(),
});

/** Schema for Open-Meteo Air Quality response. */
export const openMeteoAqiResponseSchema = z.object({
  current: openMeteoAqiCurrentSchema.optional(),
});

/** Schema for a single Open-Meteo Geocoding result. */
export const openMeteoGeoResultSchema = z.object({
  id: z.number(),
  name: z.string(),
  admin1: z.string().optional(),
  country: z.string(),
  country_code: z.string(),
  latitude: z.number(),
  longitude: z.number(),
});

/** Schema for Open-Meteo Geocoding response. */
export const openMeteoGeoResponseSchema = z.object({
  results: z.array(openMeteoGeoResultSchema).optional(),
});

/* ── Client API Response Schemas ── */

/** AQI category levels following US EPA breakpoints. */
export const aqiCategorySchema = z.enum([
  'Good',
  'Moderate',
  'Unhealthy for Sensitive Groups',
  'Unhealthy',
  'Very Unhealthy',
  'Hazardous',
]);

/** Schema for individual pollutant reading. */
export const pollutantReadingSchema = z.object({
  name: z.string(),
  displayName: z.string(),
  value: z.number(),
  unit: z.string(),
});

/** Schema for complete air quality data. */
export const aqiDataSchema = z.object({
  aqi: z.number(),
  category: aqiCategorySchema,
  pollutants: z.array(pollutantReadingSchema),
  dominantPollutant: z.string(),
  timestamp: z.string(),
});

/** Schema for geocoded location result. */
export const geocodingResultSchema = z.object({
  id: z.number(),
  name: z.string(),
  admin1: z.string().optional(),
  country: z.string(),
  countryCode: z.string(),
  latitude: z.number(),
  longitude: z.number(),
});

/** Schema for full personalized advice response. */
export const personalizedAdviceSchema = z.object({
  riskLevel: riskLevelSchema,
  riskSummary: z.string(),
  actions: z.array(personalizedActionSchema),
  isBasicMode: z.boolean(),
  personalization: z.enum(['ai', 'basic']),
});

/** Helper function creating a standardized API response schema. */
export function createApiResponseSchema<T extends z.ZodType>(
  dataSchema: T,
): z.ZodObject<{
  success: z.ZodBoolean;
  data: z.ZodOptional<T>;
  error: z.ZodOptional<z.ZodString>;
  code: z.ZodOptional<z.ZodString>;
}> {
  return z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.string().optional(),
    code: z.string().optional(),
  });
}

/** Schema for GET /api/geocoding/search API response. */
export const geocodingApiResponseSchema = createApiResponseSchema(z.array(geocodingResultSchema));

/** Schema for GET /api/aqi API response. */
export const aqiApiResponseSchema = createApiResponseSchema(aqiDataSchema);

/** Schema for POST /api/advice API response. */
export const adviceApiResponseSchema = createApiResponseSchema(personalizedAdviceSchema);

/* ── Type Inference ── */

/** Inferred type for Open-Meteo AQI current. */
export type OpenMeteoAqiCurrent = z.infer<typeof openMeteoAqiCurrentSchema>;

/** Inferred type for Open-Meteo AQI response. */
export type OpenMeteoAqiResponse = z.infer<typeof openMeteoAqiResponseSchema>;

/** Inferred type for Open-Meteo Geocoding result. */
export type OpenMeteoGeoResult = z.infer<typeof openMeteoGeoResultSchema>;

/** Inferred type for Open-Meteo Geocoding response. */
export type OpenMeteoGeoResponse = z.infer<typeof openMeteoGeoResponseSchema>;

/** Inferred type for Geocoding API response. */
export type GeocodingApiResponse = z.infer<typeof geocodingApiResponseSchema>;

/** Inferred type for AQI API response. */
export type AqiApiResponse = z.infer<typeof aqiApiResponseSchema>;

/** Inferred type for Advice API response. */
export type AdviceApiResponse = z.infer<typeof adviceApiResponseSchema>;

/** Inferred type for user context input. */
export type UserContextInput = z.infer<typeof userContextSchema>;

/** Inferred type for advice request input. */
export type AdviceRequestInput = z.infer<typeof adviceRequestSchema>;

/** Inferred type for action icon key. */
export type ActionIconKey = z.infer<typeof actionIconKeySchema>;

/** Inferred type for Gemini response. */
export type GeminiResponseInput = z.infer<typeof geminiResponseSchema>;
