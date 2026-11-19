/**
 * Unit tests for Zod validation schemas.
 *
 * Tests input validation for user context, coordinates, queries,
 * and advice requests, including edge cases and invalid inputs.
 */

import {
  adviceRequestSchema,
  aqiQuerySchema,
  geocodingQuerySchema,
  geminiResponseSchema,
  userContextSchema,
} from '@shared/schemas.js';
import { describe, it, expect } from 'vitest';

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
        icon: '🌅',
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
});
