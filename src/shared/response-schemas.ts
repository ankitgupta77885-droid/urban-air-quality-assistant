/**
 * Shared Zod schemas for Open-Meteo upstream payloads and API responses.
 *
 * Re-exported through `./schemas.js` to keep modules concise and modular.
 */

import { z } from 'zod';

import { personalizedActionSchema, riskLevelSchema } from './request-schemas.js';

/* ── Open-Meteo External API Schemas ── */

/** Schema for Open-Meteo Air Quality current payload. */
export const openMeteoAqiCurrentSchema = z.object({
  time: z.string().max(64),
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

/** Shared geographic fields across upstream and internal geocoding payloads. */
const geoLocationFieldsSchema = z.object({
  id: z.number(),
  name: z.string().max(200),
  admin1: z.string().max(200).optional(),
  country: z.string().max(200),
  latitude: z.number(),
  longitude: z.number(),
});

/** Schema for a single Open-Meteo Geocoding result. */
export const openMeteoGeoResultSchema = geoLocationFieldsSchema.extend({
  country_code: z.string().max(10),
});

/** Schema for Open-Meteo Geocoding response. */
export const openMeteoGeoResponseSchema = z.object({
  results: z.array(openMeteoGeoResultSchema).optional(),
});

/* ── Client API Response Schemas ── */

/** US EPA AQI category names. */
export const AQI_CATEGORIES = [
  'Good',
  'Moderate',
  'Unhealthy for Sensitive Groups',
  'Unhealthy',
  'Very Unhealthy',
  'Hazardous',
] as const;

/** AQI category levels following US EPA breakpoints. */
export const aqiCategorySchema = z.enum(AQI_CATEGORIES);

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
export const geocodingResultSchema = geoLocationFieldsSchema.extend({
  countryCode: z.string(),
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
