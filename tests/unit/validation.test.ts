/**
 * Unit tests for Zod validation schemas.
 *
 * Tests input validation for user context, coordinates, queries,
 * and advice requests, including edge cases and invalid inputs.
 */

import { ApiClientError, AppError, UpstreamApiError, ValidationError } from '@shared/errors.js';
import {
  ACTION_ICON_KEYS,
  actionIconKeySchema,
  activityLevelSchema,
  adviceApiResponseSchema,
  adviceCategorySchema,
  adviceRequestSchema,
  aqiApiResponseSchema,
  aqiCategorySchema,
  aqiQuerySchema,
  childAgeGroupSchema,
  commuteModeSchema,
  createApiResponseSchema,
  geocodingApiResponseSchema,
  geocodingQuerySchema,
  geocodingResultSchema,
  geminiResponseSchema,
  healthConditionSchema,
  heatingSourceSchema,
  homeTypeSchema,
  latitudeSchema,
  longitudeSchema,
  openMeteoAqiCurrentSchema,
  openMeteoAqiResponseSchema,
  openMeteoGeoResponseSchema,
  openMeteoGeoResultSchema,
  personalizedActionSchema,
  pollutantReadingSchema,
  riskLevelSchema,
  userContextSchema,
} from '@shared/schemas.js';
import { describe, it, expect } from 'vitest';
import { z } from 'zod';

describe('userContextSchema', () => {
  const validContext = {
    childAgeGroup: 'toddler',
    healthConditions: ['none'],
    homeType: 'apartment',
    commuteMode: 'car',
    activityLevel: 'moderate',
    heatingSource: 'gas',
  };

  it('should accept valid user context', () => {
    const result = userContextSchema.safeParse(validContext);
    expect(result.success).toBe(true);
  });

  it('should accept multiple health conditions', () => {
    const result = userContextSchema.safeParse({
      ...validContext,
      healthConditions: ['asthma', 'allergies'],
    });
    expect(result.success).toBe(true);
  });

  it('should reject empty health conditions array', () => {
    const result = userContextSchema.safeParse({
      ...validContext,
      healthConditions: [],
    });
    expect(result.success).toBe(false);
  });

  it('should reject too many health conditions', () => {
    const result = userContextSchema.safeParse({
      ...validContext,
      healthConditions: ['asthma', 'allergies', 'respiratory', 'cardiovascular', 'none', 'asthma'],
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid child age group', () => {
    const result = userContextSchema.safeParse({
      ...validContext,
      childAgeGroup: 'teenager',
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid commute mode', () => {
    const result = userContextSchema.safeParse({
      ...validContext,
      commuteMode: 'helicopter',
    });
    expect(result.success).toBe(false);
  });

  it('should reject missing fields', () => {
    const result = userContextSchema.safeParse({
      childAgeGroup: 'toddler',
    });
    expect(result.success).toBe(false);
  });
});

describe('geocodingQuerySchema', () => {
  it('should accept a valid query', () => {
    const result = geocodingQuerySchema.safeParse({ q: 'Delhi' });
    expect(result.success).toBe(true);
  });

  it('should trim whitespace', () => {
    const result = geocodingQuerySchema.safeParse({ q: '  London  ' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.q).toBe('London');
    }
  });

  it('should reject empty query', () => {
    const result = geocodingQuerySchema.safeParse({ q: '' });
    expect(result.success).toBe(false);
  });

  it('should reject query exceeding max length', () => {
    const result = geocodingQuerySchema.safeParse({ q: 'a'.repeat(101) });
    expect(result.success).toBe(false);
  });

  it('should reject missing q parameter', () => {
    const result = geocodingQuerySchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe('aqiQuerySchema', () => {
  it('should accept valid coordinates', () => {
    const result = aqiQuerySchema.safeParse({ lat: '28.6', lon: '77.2' });
    expect(result.success).toBe(true);
  });

  it('should coerce string numbers to numbers', () => {
    const result = aqiQuerySchema.safeParse({ lat: '28.6139', lon: '77.2090' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(typeof result.data.lat).toBe('number');
      expect(typeof result.data.lon).toBe('number');
    }
  });

  it('should reject latitude below -90', () => {
    const result = aqiQuerySchema.safeParse({ lat: '-91', lon: '0' });
    expect(result.success).toBe(false);
  });

  it('should reject latitude above 90', () => {
    const result = aqiQuerySchema.safeParse({ lat: '91', lon: '0' });
    expect(result.success).toBe(false);
  });

  it('should reject longitude below -180', () => {
    const result = aqiQuerySchema.safeParse({ lat: '0', lon: '-181' });
    expect(result.success).toBe(false);
  });

  it('should reject longitude above 180', () => {
    const result = aqiQuerySchema.safeParse({ lat: '0', lon: '181' });
    expect(result.success).toBe(false);
  });

  it('should accept boundary values', () => {
    expect(aqiQuerySchema.safeParse({ lat: '-90', lon: '-180' }).success).toBe(true);
    expect(aqiQuerySchema.safeParse({ lat: '90', lon: '180' }).success).toBe(true);
  });
});

describe('adviceRequestSchema', () => {
  const validRequest = {
    latitude: 28.6139,
    longitude: 77.209,
    context: {
      childAgeGroup: 'toddler',
      healthConditions: ['none'],
      homeType: 'apartment',
      commuteMode: 'car',
      activityLevel: 'moderate',
      heatingSource: 'gas',
    },
  };

  it('should accept a valid advice request', () => {
    const result = adviceRequestSchema.safeParse(validRequest);
    expect(result.success).toBe(true);
  });

  it('should reject request with invalid coordinates', () => {
    const result = adviceRequestSchema.safeParse({
      ...validRequest,
      latitude: 999,
    });
    expect(result.success).toBe(false);
  });

  it('should reject request with invalid context', () => {
    const result = adviceRequestSchema.safeParse({
      ...validRequest,
      context: { childAgeGroup: 'invalid' },
    });
    expect(result.success).toBe(false);
  });

  it('should reject request with missing context', () => {
    const result = adviceRequestSchema.safeParse({
      latitude: 28.6,
      longitude: 77.2,
    });
    expect(result.success).toBe(false);
  });
});

describe('geminiResponseSchema', () => {
  const validResponse = {
    riskLevel: 'moderate',
    riskSummary: 'Air quality is moderate.',
    actions: [
      {
        category: 'morning-routine',
        title: 'Open windows carefully',
        description: 'Open windows early in the morning.',
        impact: 'Improves ventilation.',
        benefit: 'Moderate',
        icon: 'sun',
      },
    ],
  };

  it('should accept a valid Gemini response', () => {
    const result = geminiResponseSchema.safeParse(validResponse);
    expect(result.success).toBe(true);
  });

  it('should reject response with invalid risk level', () => {
    const result = geminiResponseSchema.safeParse({
      ...validResponse,
      riskLevel: 'extreme',
    });
    expect(result.success).toBe(false);
  });

  it('should reject response with empty actions', () => {
    const result = geminiResponseSchema.safeParse({
      ...validResponse,
      actions: [],
    });
    expect(result.success).toBe(false);
  });

  it('should reject response with too many actions', () => {
    const result = geminiResponseSchema.safeParse({
      ...validResponse,
      actions: Array.from({ length: 21 }, () => validResponse.actions[0]),
    });
    expect(result.success).toBe(false);
  });

  it('should reject action with empty title', () => {
    const result = geminiResponseSchema.safeParse({
      ...validResponse,
      actions: [{ ...validResponse.actions[0], title: '' }],
    });
    expect(result.success).toBe(false);
  });

  it('should reject action with invalid category', () => {
    const result = geminiResponseSchema.safeParse({
      ...validResponse,
      actions: [{ ...validResponse.actions[0], category: 'lunch-break' }],
    });
    expect(result.success).toBe(false);
  });

  it('should reject action with emoji or non-enum icon', () => {
    const result = geminiResponseSchema.safeParse({
      ...validResponse,
      actions: [{ ...validResponse.actions[0], icon: '🌅' }],
    });
    expect(result.success).toBe(false);
  });
});

describe('openMeteoAqiResponseSchema', () => {
  it('should accept valid Open-Meteo AQI payload', () => {
    const result = openMeteoAqiResponseSchema.safeParse({
      current: {
        time: '2026-01-15T12:00:00Z',
        us_aqi: 55,
        pm2_5: 14.2,
        pm10: 25.1,
        nitrogen_dioxide: 18.5,
        ozone: 32.0,
        sulphur_dioxide: 5.2,
        carbon_monoxide: 210.0,
      },
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid current field types', () => {
    const result = openMeteoAqiResponseSchema.safeParse({
      current: {
        time: 12345,
        us_aqi: 'not-a-number',
      },
    });
    expect(result.success).toBe(false);
  });
});

describe('openMeteoGeoResponseSchema', () => {
  it('should accept valid Open-Meteo geocoding payload', () => {
    const result = openMeteoGeoResponseSchema.safeParse({
      results: [
        {
          id: 1,
          name: 'London',
          country: 'United Kingdom',
          country_code: 'GB',
          latitude: 51.5,
          longitude: -0.1,
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('should accept payload with missing results', () => {
    const result = openMeteoGeoResponseSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});

describe('Client API response schemas', () => {
  it('should validate generic createApiResponseSchema with success and failure payloads', () => {
    const stringResponseSchema = createApiResponseSchema(z.string());

    const successResult = stringResponseSchema.safeParse({ success: true, data: 'hello' });
    expect(successResult.success).toBe(true);

    const errorResult = stringResponseSchema.safeParse({
      success: false,
      error: 'Not found',
      code: 'ERR_NOT_FOUND',
    });
    expect(errorResult.success).toBe(true);
  });

  it('should validate geocodingApiResponseSchema', () => {
    const result = geocodingApiResponseSchema.safeParse({
      success: true,
      data: [
        {
          id: 1,
          name: 'Delhi',
          country: 'India',
          countryCode: 'IN',
          latitude: 28.6,
          longitude: 77.2,
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('should validate aqiApiResponseSchema', () => {
    const result = aqiApiResponseSchema.safeParse({
      success: true,
      data: {
        aqi: 72,
        category: 'Moderate',
        pollutants: [{ name: 'pm2_5', displayName: 'PM2.5', value: 22.4, unit: 'µg/m³' }],
        dominantPollutant: 'pm2_5',
        timestamp: '2026-01-15T12:00:00Z',
      },
    });
    expect(result.success).toBe(true);
  });

  it('should validate adviceApiResponseSchema', () => {
    const result = adviceApiResponseSchema.safeParse({
      success: true,
      data: {
        riskLevel: 'moderate',
        riskSummary: 'Moderate air pollution level.',
        actions: [
          {
            category: 'outdoor-activity',
            title: 'Shift workout indoors',
            description: 'Avoid running outdoors during peak traffic.',
            impact: 'Reduces particulate exposure by 60%.',
            benefit: 'High',
            icon: 'shield',
          },
        ],
        isBasicMode: false,
        personalization: 'ai',
      },
    });
    expect(result.success).toBe(true);
  });
});

describe('Application error classes', () => {
  it('should construct AppError with defaults and custom values', () => {
    const defaultError = new AppError('Server error');
    expect(defaultError.message).toBe('Server error');
    expect(defaultError.statusCode).toBe(500);
    expect(defaultError.code).toBe('INTERNAL_ERROR');
    expect(defaultError.name).toBe('AppError');

    const statusOnlyError = new AppError('Status only', 403);
    expect(statusOnlyError.statusCode).toBe(403);
    expect(statusOnlyError.code).toBe('INTERNAL_ERROR');

    const customError = new AppError('Custom error', 503, 'SERVICE_UNAVAILABLE');
    expect(customError.statusCode).toBe(503);
    expect(customError.code).toBe('SERVICE_UNAVAILABLE');
  });

  it('should construct ValidationError with 400', () => {
    const error = new ValidationError('Bad request');
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe('VALIDATION_ERROR');
  });

  it('should construct UpstreamApiError with defaults and custom arguments', () => {
    const defaultError = new UpstreamApiError();
    expect(defaultError.statusCode).toBe(502);
    expect(defaultError.code).toBe('UPSTREAM_API_ERROR');
    expect(defaultError.message).toBe('Upstream service returned an invalid response');

    const msgOnlyError = new UpstreamApiError('Custom message');
    expect(msgOnlyError.statusCode).toBe(502);
    expect(msgOnlyError.message).toBe('Custom message');

    const customError = new UpstreamApiError('Downstream timeout', 504);
    expect(customError.statusCode).toBe(504);
    expect(customError.message).toBe('Downstream timeout');
  });

  it('should construct ApiClientError with default and custom status', () => {
    const defaultError = new ApiClientError('Client error');
    expect(defaultError.statusCode).toBe(500);
    expect(defaultError.code).toBe('API_CLIENT_ERROR');

    const statusOnlyError = new ApiClientError('Custom status', 422);
    expect(statusOnlyError.statusCode).toBe(422);
    expect(statusOnlyError.code).toBe('API_CLIENT_ERROR');

    const error = new ApiClientError('Client failure', 404, 'NOT_FOUND');
    expect(error.statusCode).toBe(404);
    expect(error.code).toBe('NOT_FOUND');
  });

  it('should validate standalone enum and building-block schemas', () => {
    expect(childAgeGroupSchema.safeParse('toddler').success).toBe(true);
    expect(childAgeGroupSchema.safeParse('invalid').success).toBe(false);

    expect(healthConditionSchema.safeParse('asthma').success).toBe(true);
    expect(homeTypeSchema.safeParse('apartment').success).toBe(true);
    expect(commuteModeSchema.safeParse('bicycle').success).toBe(true);
    expect(activityLevelSchema.safeParse('high').success).toBe(true);
    expect(heatingSourceSchema.safeParse('wood').success).toBe(true);
    expect(adviceCategorySchema.safeParse('commute').success).toBe(true);
    expect(riskLevelSchema.safeParse('moderate').success).toBe(true);
    expect(aqiCategorySchema.safeParse('Moderate').success).toBe(true);
    expect(actionIconKeySchema.safeParse(ACTION_ICON_KEYS[0]).success).toBe(true);

    expect(latitudeSchema.safeParse('28.61').success).toBe(true);
    expect(longitudeSchema.safeParse('77.21').success).toBe(true);

    expect(
      pollutantReadingSchema.safeParse({
        name: 'pm2_5',
        displayName: 'PM2.5',
        value: 25,
        unit: 'µg/m³',
      }).success,
    ).toBe(true);

    expect(
      geocodingResultSchema.safeParse({
        id: 1,
        name: 'Delhi',
        country: 'India',
        countryCode: 'IN',
        latitude: 28.61,
        longitude: 77.21,
      }).success,
    ).toBe(true);

    expect(
      openMeteoGeoResultSchema.safeParse({
        id: 1,
        name: 'Delhi',
        country: 'India',
        country_code: 'IN',
        latitude: 28.61,
        longitude: 77.21,
      }).success,
    ).toBe(true);

    expect(
      openMeteoAqiCurrentSchema.safeParse({
        time: '2026-01-15T10:00:00Z',
        us_aqi: 55,
        pm2_5: 20,
        pm10: 35,
        nitrogen_dioxide: 12,
        ozone: 25,
        sulphur_dioxide: 8,
        carbon_monoxide: 300,
      }).success,
    ).toBe(true);

    expect(
      personalizedActionSchema.safeParse({
        category: 'commute',
        title: 'Title',
        description: 'Desc',
        impact: 'Impact',
        benefit: 'Benefit',
        icon: 'car',
      }).success,
    ).toBe(true);
  });
});
