/**
 * Shared Zod schemas for input validation and response parsing.
 *
 * Used on the server for request validation and Gemini response parsing,
 * and importable from shared for type inference.
 */

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

/** Schema for a single personalized action from Gemini. */
export const personalizedActionSchema = z.object({
  category: adviceCategorySchema,
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(1000),
  impact: z.string().min(1).max(500),
  benefit: z.string().min(1).max(100),
  icon: z.string().min(1).max(10),
});

/** Schema for the full Gemini personalized advice response. */
export const geminiResponseSchema = z.object({
  riskLevel: riskLevelSchema,
  riskSummary: z.string().min(1).max(500),
  actions: z.array(personalizedActionSchema).min(1).max(20),
});

/* ── Type Inference ── */

/** Inferred type for user context input. */
export type UserContextInput = z.infer<typeof userContextSchema>;

/** Inferred type for advice request input. */
export type AdviceRequestInput = z.infer<typeof adviceRequestSchema>;

/** Inferred type for Gemini response. */
export type GeminiResponseInput = z.infer<typeof geminiResponseSchema>;
