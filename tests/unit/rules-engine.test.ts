/**
 * Unit tests for the rules engine.
 *
 * Tests the deterministic advice generation across various AQI levels,
 * user contexts, and edge cases.
 */

import type { AqiData, UserContext } from '@shared/types.js';
import { describe, it, expect } from 'vitest';

import { generateAdvice } from '../../src/server/services/rules-engine.js';

/* ── Test Helpers ── */

function makeAqiData(overrides: Partial<AqiData> = {}): AqiData {
  return {
    aqi: 75,
    category: 'Moderate',
    pollutants: [
      { name: 'pm2_5', displayName: 'PM2.5', value: 25, unit: 'µg/m³' },
      { name: 'pm10', displayName: 'PM10', value: 40, unit: 'µg/m³' },
    ],
    dominantPollutant: 'pm2_5',
    timestamp: '2026-01-15T10:00:00Z',
    ...overrides,
  };
}

function makeContext(overrides: Partial<UserContext> = {}): UserContext {
  return {
    childAgeGroup: 'toddler',
    healthConditions: ['none'],
    homeType: 'apartment',
    commuteMode: 'car',
    activityLevel: 'moderate',
    heatingSource: 'gas',
    ...overrides,
  };
}

/* ── Test Suites ── */

describe('generateAdvice', () => {
  describe('risk level computation', () => {
    it('should return low risk for good AQI with healthy school-age child', () => {
      const result = generateAdvice(
        makeAqiData({ aqi: 30, category: 'Good' }),
        makeContext({ childAgeGroup: 'school-age' }),
      );
      expect(result.riskLevel).toBe('low');
    });

    it('should return moderate risk for moderate AQI with toddler', () => {
      const result = generateAdvice(makeAqiData({ aqi: 75, category: 'Moderate' }), makeContext());
      expect(result.riskLevel).toBe('moderate');
    });

    it('should return high risk for unhealthy AQI with asthmatic child', () => {
      const result = generateAdvice(
        makeAqiData({ aqi: 160, category: 'Unhealthy' }),
        makeContext({ healthConditions: ['asthma'], childAgeGroup: 'infant' }),
      );
      expect(result.riskLevel).toBe('critical');
    });

    it('should return critical risk for hazardous AQI', () => {
      const result = generateAdvice(
        makeAqiData({ aqi: 350, category: 'Hazardous' }),
        makeContext(),
      );
      expect(result.riskLevel).toBe('critical');
    });

    it('should increase risk for infants vs school-age children', () => {
      const aqiData = makeAqiData({ aqi: 120, category: 'Unhealthy for Sensitive Groups' });
      const infantResult = generateAdvice(aqiData, makeContext({ childAgeGroup: 'infant' }));
      const schoolResult = generateAdvice(aqiData, makeContext({ childAgeGroup: 'school-age' }));
      expect(riskToNumber(infantResult.riskLevel)).toBeGreaterThan(
        riskToNumber(schoolResult.riskLevel),
      );
    });

    it('should increase risk for multiple health conditions', () => {
      const aqiData = makeAqiData({ aqi: 100, category: 'Moderate' });
      const healthyResult = generateAdvice(aqiData, makeContext({ healthConditions: ['none'] }));
      const sickResult = generateAdvice(
        aqiData,
        makeContext({ healthConditions: ['asthma', 'allergies'] }),
      );
      expect(riskToNumber(sickResult.riskLevel)).toBeGreaterThanOrEqual(
        riskToNumber(healthyResult.riskLevel),
      );
    });
  });

  describe('risk summary', () => {
    it('should include AQI value and category in the summary', () => {
      const result = generateAdvice(makeAqiData({ aqi: 75, category: 'Moderate' }), makeContext());
      expect(result.riskSummary).toContain('AQI 75');
      expect(result.riskSummary).toContain('Moderate');
    });

    it('should include the child age label in the summary', () => {
      const result = generateAdvice(makeAqiData(), makeContext({ childAgeGroup: 'infant' }));
      expect(result.riskSummary).toContain('infant');
    });
  });

  describe('action generation', () => {
    it('should always generate at least one action per core category', () => {
      const result = generateAdvice(makeAqiData(), makeContext());
      const categories = new Set(result.actions.map((a) => a.category));
      expect(categories.has('morning-routine')).toBe(true);
      expect(categories.has('outdoor-activity')).toBe(true);
      expect(categories.has('evening-routine')).toBe(true);
      expect(categories.has('indoor-air-hack')).toBe(true);
      expect(categories.has('sustainable-alternative')).toBe(true);
    });

    it('should not generate commute actions for work-from-home', () => {
      const result = generateAdvice(makeAqiData(), makeContext({ commuteMode: 'work-from-home' }));
      const commuteActions = result.actions.filter((a) => a.category === 'commute');
      expect(commuteActions).toHaveLength(0);
    });

    it('should generate commute actions for car commuters', () => {
      const result = generateAdvice(makeAqiData(), makeContext({ commuteMode: 'car' }));
      const commuteActions = result.actions.filter((a) => a.category === 'commute');
      expect(commuteActions.length).toBeGreaterThan(0);
    });

    it('should generate wet-mop action for infants and toddlers', () => {
      const infantResult = generateAdvice(makeAqiData(), makeContext({ childAgeGroup: 'infant' }));
      const mopAction = infantResult.actions.find((a) => a.title.includes('Wet-mop'));
      expect(mopAction).toBeDefined();
    });

    it('should not generate wet-mop action for school-age children', () => {
      const result = generateAdvice(makeAqiData(), makeContext({ childAgeGroup: 'school-age' }));
      const mopAction = result.actions.find((a) => a.title.includes('Wet-mop'));
      expect(mopAction).toBeUndefined();
    });

    it('should generate air purifier action for asthma or respiratory conditions', () => {
      const result = generateAdvice(makeAqiData(), makeContext({ healthConditions: ['asthma'] }));
      const purifierAction = result.actions.find((a) => a.title.includes('air purifier'));
      expect(purifierAction).toBeDefined();
    });

    it('should recommend avoiding outdoor activities at critical risk', () => {
      const result = generateAdvice(
        makeAqiData({ aqi: 350, category: 'Hazardous' }),
        makeContext(),
      );
      const outdoorAction = result.actions.find((a) => a.category === 'outdoor-activity');
      expect(outdoorAction?.title).toContain('Avoid');
    });

    it('should include heating-related indoor hack for wood heating', () => {
      const result = generateAdvice(makeAqiData(), makeContext({ heatingSource: 'wood' }));
      const heatingAction = result.actions.find((a) => a.title.includes('wood'));
      expect(heatingAction).toBeDefined();
    });

    it('should include sustainable alternative for car commuters', () => {
      const result = generateAdvice(makeAqiData(), makeContext({ commuteMode: 'car' }));
      const sustainableAction = result.actions.find(
        (a) => a.category === 'sustainable-alternative' && a.title.includes('carpooling'),
      );
      expect(sustainableAction).toBeDefined();
    });

    it('should include apartment-specific sealing advice', () => {
      const result = generateAdvice(makeAqiData(), makeContext({ homeType: 'apartment' }));
      const sealAction = result.actions.find((a) => a.title.includes('Seal'));
      expect(sealAction).toBeDefined();
    });
  });

  describe('action structure', () => {
    it('should have all required fields on every action', () => {
      const result = generateAdvice(makeAqiData(), makeContext());
      for (const action of result.actions) {
        expect(action.category).toBeTruthy();
        expect(action.title).toBeTruthy();
        expect(action.description).toBeTruthy();
        expect(action.impact).toBeTruthy();
        expect(action.benefit).toBeTruthy();
        expect(action.icon).toBeTruthy();
      }
    });

    it('should have benefit values of Low, Moderate, or High', () => {
      const result = generateAdvice(makeAqiData(), makeContext());
      const validBenefits = ['Low', 'Moderate', 'High'];
      for (const action of result.actions) {
        expect(validBenefits).toContain(action.benefit);
      }
    });
  });

  describe('edge cases', () => {
    it('should handle AQI of 0', () => {
      const result = generateAdvice(makeAqiData({ aqi: 0, category: 'Good' }), makeContext());
      expect(result.riskLevel).toBeDefined();
      expect(result.actions.length).toBeGreaterThan(0);
    });

    it('should handle AQI of 500', () => {
      const result = generateAdvice(
        makeAqiData({ aqi: 500, category: 'Hazardous' }),
        makeContext(),
      );
      expect(result.riskLevel).toBe('critical');
    });

    it('should handle all health conditions selected', () => {
      const result = generateAdvice(
        makeAqiData(),
        makeContext({
          healthConditions: ['asthma', 'allergies', 'respiratory', 'cardiovascular'],
        }),
      );
      expect(result.riskLevel).toBeDefined();
      expect(result.actions.length).toBeGreaterThan(0);
    });

    it('should handle high PM2.5 triggering DIY filter advice', () => {
      const result = generateAdvice(
        makeAqiData({
          pollutants: [{ name: 'pm2_5', displayName: 'PM2.5', value: 50, unit: 'µg/m³' }],
        }),
        makeContext({ homeType: 'house' }),
      );
      const diyFilter = result.actions.find((a) => a.title.includes('DIY'));
      expect(diyFilter).toBeDefined();
    });
  });
});

/* ── Helpers ── */

function riskToNumber(risk: string): number {
  const levels: Record<string, number> = {
    low: 1,
    moderate: 2,
    high: 3,
    'very-high': 4,
    critical: 5,
  };
  return levels[risk] ?? 0;
}
