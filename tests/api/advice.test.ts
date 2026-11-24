/**
 * API tests for the advice endpoint.
 *
 * Tests POST /api/advice with mocked AQI and Gemini services.
 */

import type { ApiResponse, PersonalizedAdvice } from '@shared/types.js';
import supertest from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createApp } from '../../src/server/app.js';

/* ── Mock Setup ── */

const mockFetchAqiData = vi.fn();
const mockPersonalizeAdvice = vi.fn();

vi.mock('../../src/server/services/aqi.service.js', () => ({
  fetchAqiData: (...args: unknown[]) => mockFetchAqiData(...args) as unknown,
}));

vi.mock('../../src/server/services/gemini.service.js', () => ({
  personalizeAdvice: (...args: unknown[]) => mockPersonalizeAdvice(...args) as unknown,
}));

const app = createApp({ geminiApiKey: 'test-key', geminiModel: 'test-model' });
const request = supertest(app);

const validBody = {
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

const mockAqiData = {
  aqi: 85,
  category: 'Moderate',
  pollutants: [{ name: 'pm2_5', displayName: 'PM2.5', value: 30, unit: 'µg/m³' }],
  dominantPollutant: 'pm2_5',
  timestamp: '2026-01-15T10:00:00Z',
};

const mockAdviceResponse = {
  riskLevel: 'moderate',
  riskSummary: 'Air quality is moderate.',
  actions: [
    {
      category: 'morning-routine',
      title: 'Check AQI',
      description: 'Check AQI before opening windows.',
      impact: 'Prevents pollutants from entering.',
      benefit: 'High',
      icon: 'sun',
    },
  ],
  isBasicMode: false,
  personalization: 'ai' as const,
};

beforeEach(() => {
  mockFetchAqiData.mockReset();
  mockPersonalizeAdvice.mockReset();
  mockFetchAqiData.mockResolvedValue(mockAqiData);
  mockPersonalizeAdvice.mockResolvedValue(mockAdviceResponse);
});

afterEach(() => {
  vi.restoreAllMocks();
});

/* ── Tests ── */

describe('POST /api/advice', () => {
  it('should return personalized advice for valid input', async () => {
    const res = await request.post('/api/advice').send(validBody);
    const body = res.body as ApiResponse<PersonalizedAdvice>;

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data?.riskLevel).toBe('moderate');
    expect(body.data?.actions).toHaveLength(1);
  });

  it('should return 400 for missing context', async () => {
    const res = await request.post('/api/advice').send({
      latitude: 28.6,
      longitude: 77.2,
    });
    const body = res.body as ApiResponse<unknown>;

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
  });

  it('should return 400 for invalid coordinates', async () => {
    const res = await request.post('/api/advice').send({
      ...validBody,
      latitude: 999,
    });
    const body = res.body as ApiResponse<unknown>;

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
  });

  it('should return 400 for invalid child age group', async () => {
    const res = await request.post('/api/advice').send({
      ...validBody,
      context: { ...validBody.context, childAgeGroup: 'teenager' },
    });
    const body = res.body as ApiResponse<unknown>;

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
  });

  it('should return 400 for empty health conditions', async () => {
    const res = await request.post('/api/advice').send({
      ...validBody,
      context: { ...validBody.context, healthConditions: [] },
    });
    const body = res.body as ApiResponse<unknown>;

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
  });

  it('should handle AQI service failure gracefully', async () => {
    mockFetchAqiData.mockRejectedValue(new Error('AQI API down'));

    const res = await request.post('/api/advice').send(validBody);
    const body = res.body as ApiResponse<unknown>;

    expect(res.status).toBe(500);
    expect(body.success).toBe(false);
  });

  it('should handle Gemini failure and still return advice with basic personalization flag', async () => {
    mockPersonalizeAdvice.mockResolvedValue({
      ...mockAdviceResponse,
      isBasicMode: true,
      personalization: 'basic',
    });

    const res = await request.post('/api/advice').send(validBody);
    const body = res.body as ApiResponse<PersonalizedAdvice>;

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data?.isBasicMode).toBe(true);
    expect(body.data?.personalization).toBe('basic');
  });

  it('should reject request body exceeding size limit', async () => {
    const largeBody = { ...validBody, extra: 'x'.repeat(20_000) };

    const res = await request.post('/api/advice').send(largeBody);

    expect(res.status).toBe(413);
  });
});
