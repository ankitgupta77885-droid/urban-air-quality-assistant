/**
 * Unit tests for the risk calculator.
 *
 * Score = AQI base score + age modifier + health modifier + activity modifier,
 * capped at 10. Levels: <=3 low, <=5 moderate, <=7 high, <=9 very-high, else critical.
 */

import type { UserContext } from '@shared/types.js';
import { describe, expect, it } from 'vitest';

import { computeRiskLevel } from '../../src/server/services/risk-calculator.js';

/** Baseline context: a school-age child (+0.5), no conditions, low activity. */
function makeContext(overrides: Partial<UserContext> = {}): UserContext {
  return {
    childAgeGroup: 'school-age',
    healthConditions: ['none'],
    homeType: 'house',
    commuteMode: 'walking',
    activityLevel: 'low',
    heatingSource: 'electric',
    ...overrides,
  };
}

describe('computeRiskLevel', () => {
  describe('AQI base score', () => {
    it.each([
      [25, 'low'],
      [75, 'moderate'],
      [125, 'high'],
      [175, 'very-high'],
      [250, 'critical'],
      [400, 'critical'],
    ] as const)('maps AQI %i to %s for the baseline context', (aqi, expected) => {
      expect(computeRiskLevel(aqi, makeContext())).toBe(expected);
    });

    it('treats a fractional AQI between breakpoints like the next band', () => {
      expect(computeRiskLevel(50.5, makeContext())).toBe(computeRiskLevel(75, makeContext()));
    });
  });

  describe('context modifiers (AQI 100 -> base 3)', () => {
    const asthma = ['asthma'] as const;

    it('raises risk for younger children', () => {
      const infant = makeContext({ childAgeGroup: 'infant', healthConditions: asthma });
      const schoolAge = makeContext({ childAgeGroup: 'school-age', healthConditions: asthma });
      expect(computeRiskLevel(100, infant)).toBe('high');
      expect(computeRiskLevel(100, schoolAge)).toBe('moderate');
    });

    it('adds risk when health conditions stack', () => {
      expect(computeRiskLevel(100, makeContext())).toBe('moderate');
      expect(
        computeRiskLevel(100, makeContext({ healthConditions: ['asthma', 'respiratory'] })),
      ).toBe('high');
      const all = makeContext({
        healthConditions: ['asthma', 'respiratory', 'cardiovascular', 'allergies'],
      });
      expect(computeRiskLevel(100, all)).toBe('very-high');
    });

    it('lets "none" cancel every other listed condition', () => {
      const context = makeContext({ healthConditions: ['none', 'asthma', 'respiratory'] });
      expect(computeRiskLevel(100, context)).toBe('moderate');
    });

    it('raises risk with outdoor activity level', () => {
      const withActivity = (activityLevel: UserContext['activityLevel']): UserContext =>
        makeContext({ healthConditions: asthma, activityLevel });
      expect(computeRiskLevel(100, withActivity('low'))).toBe('moderate');
      expect(computeRiskLevel(100, withActivity('moderate'))).toBe('high');
      expect(computeRiskLevel(100, withActivity('high'))).toBe('high');
    });
  });

  describe('score capping', () => {
    it('returns critical for the worst possible context', () => {
      const worst = makeContext({
        childAgeGroup: 'infant',
        healthConditions: ['asthma', 'respiratory', 'cardiovascular', 'allergies'],
        activityLevel: 'high',
      });
      expect(computeRiskLevel(500, worst)).toBe('critical');
    });
  });
});
