/**
 * Unit tests for formatting utilities.
 *
 * Tests AQI label formatting, pollutant display names, and other formatters.
 */

import { categorizeAqi, formatCoordinateCacheKey } from '@shared/aqi.js';
import { AQI_BREAKPOINTS, POLLUTANT_DISPLAY_NAMES, POLLUTANT_KEYS } from '@shared/constants.js';
import { describe, it, expect } from 'vitest';

import {
  formatLocalTime,
  formatLocationLabel,
  getAqiDisplay,
  getCategoryLabel,
} from '../../src/web/utils/formatters.js';

describe('formatters', () => {
  describe('AQI_BREAKPOINTS consistency', () => {
    it('should have contiguous, non-overlapping ranges', () => {
      for (let i = 1; i < AQI_BREAKPOINTS.length; i++) {
        const prev = AQI_BREAKPOINTS[i - 1];
        const curr = AQI_BREAKPOINTS[i];
        expect(prev).toBeDefined();
        expect(curr).toBeDefined();
        if (prev && curr) {
          expect(curr.min).toBe(prev.max + 1);
        }
      }
    });

    it('should start at 0', () => {
      expect(AQI_BREAKPOINTS[0]?.min).toBe(0);
    });

    it('should end at 500', () => {
      expect(AQI_BREAKPOINTS[AQI_BREAKPOINTS.length - 1]?.max).toBe(500);
    });

    it('should cover all 6 US EPA categories', () => {
      expect(AQI_BREAKPOINTS).toHaveLength(6);
    });
  });

  describe('POLLUTANT_DISPLAY_NAMES', () => {
    it('should map pm2_5 to PM2.5', () => {
      expect(POLLUTANT_DISPLAY_NAMES['pm2_5']).toBe('PM2.5');
    });

    it('should map nitrogen_dioxide to NO₂', () => {
      expect(POLLUTANT_DISPLAY_NAMES['nitrogen_dioxide']).toBe('NO₂');
    });

    it('should map ozone to O₃', () => {
      expect(POLLUTANT_DISPLAY_NAMES['ozone']).toBe('O₃');
    });

    it('should have entries for all 6 tracked pollutants', () => {
      for (const key of POLLUTANT_KEYS) {
        expect(POLLUTANT_DISPLAY_NAMES[key]).toBeDefined();
      }
    });
  });

  describe('formatCoordinateCacheKey', () => {
    it('rounds latitude and longitude to two decimal places consistently', () => {
      expect(formatCoordinateCacheKey(28.6139, 77.209)).toBe('28.61,77.21');
      expect(formatCoordinateCacheKey(-33.8688, 151.2093)).toBe('-33.87,151.21');
    });
  });

  describe('categorizeAqi label consistency', () => {
    it('should produce a label that matches the breakpoint category', () => {
      for (const bp of AQI_BREAKPOINTS) {
        const midpoint = Math.floor((bp.min + bp.max) / 2);
        const result = categorizeAqi(midpoint);
        expect(result.category).toBe(bp.category);
      }
    });
  });

  describe('web display formatters', () => {
    it('formats locations with and without admin region', () => {
      expect(formatLocationLabel({ name: 'Delhi', admin1: 'Delhi', country: 'India' })).toBe(
        'Delhi, Delhi, India',
      );
      expect(formatLocationLabel({ name: 'Tokyo', country: 'Japan' })).toBe('Tokyo, Japan');
    });

    it('formats valid ISO timestamps and preserves invalid timestamp strings safely', () => {
      expect(formatLocalTime('2026-11-22T10:00:00Z')).not.toBe('Invalid Date');
      expect(formatLocalTime('not-a-timestamp')).toBe('not-a-timestamp');
    });

    it('returns AQI display metadata and category labels with safe fallback', () => {
      expect(getAqiDisplay(50.5).category).toBe('Moderate');
      expect(getCategoryLabel('morning-routine')).toBe('Morning Routine');
      expect(getCategoryLabel('custom-category')).toBe('custom-category');
    });
  });
});
