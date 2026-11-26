/**
 * Unit tests for the shared AQI breakpoint lookup and risk scoring constants.
 */

import {
  ACTIVITY_RISK_MODIFIERS,
  AGE_RISK_MODIFIERS,
  findAqiBreakpoint,
  HEALTH_RISK_MODIFIERS,
  MAX_RISK_SCORE,
} from '@shared/aqi.js';
import { AQI_BREAKPOINTS } from '@shared/constants.js';
import { describe, expect, it } from 'vitest';

describe('findAqiBreakpoint', () => {
  it.each(AQI_BREAKPOINTS.map((bp) => [bp.min, bp] as const))(
    'returns the breakpoint that starts at AQI %i',
    (aqi, breakpoint) => {
      expect(findAqiBreakpoint(aqi)).toBe(breakpoint);
    },
  );

  it.each(AQI_BREAKPOINTS.map((bp) => [bp.max, bp] as const))(
    'returns the breakpoint that ends at AQI %i',
    (aqi, breakpoint) => {
      expect(findAqiBreakpoint(aqi)).toBe(breakpoint);
    },
  );

  it('places fractional values in the next band instead of falling through', () => {
    expect(findAqiBreakpoint(50.5).category).toBe('Moderate');
    expect(findAqiBreakpoint(100.4).category).toBe('Unhealthy for Sensitive Groups');
  });

  it('falls back to the most severe band above the scale', () => {
    expect(findAqiBreakpoint(750).category).toBe('Hazardous');
  });

  it('gives every band a monotonic risk score within the maximum bound', () => {
    const scores = AQI_BREAKPOINTS.map((bp) => bp.baseRiskScore);
    expect(Math.min(...scores)).toBeGreaterThanOrEqual(1);
    expect(Math.max(...scores)).toBeLessThanOrEqual(MAX_RISK_SCORE);
    expect(scores).toEqual([...scores].sort((a, b) => a - b));
    expect(AGE_RISK_MODIFIERS.infant).toBeGreaterThan(AGE_RISK_MODIFIERS['school-age']);
    expect(HEALTH_RISK_MODIFIERS.none).toBe(0);
    expect(ACTIVITY_RISK_MODIFIERS.low).toBe(0);
  });
});
