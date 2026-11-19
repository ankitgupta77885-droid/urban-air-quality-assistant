/**
 * Unit tests for AQI categorization.
 *
 * Tests the mapping of raw AQI values to US EPA categories,
 * including boundary values and out-of-range inputs.
 */

import { describe, it, expect } from 'vitest';

import { categorizeAqi } from '../../src/server/services/aqi-categorizer.js';

describe('categorizeAqi', () => {
  describe('standard breakpoints', () => {
    it('should categorize AQI 0 as Good', () => {
      const result = categorizeAqi(0);
      expect(result.category).toBe('Good');
      expect(result.colorClass).toBe('aqi-good');
      expect(result.icon).toBe('🟢');
    });

    it('should categorize AQI 50 as Good (upper boundary)', () => {
      expect(categorizeAqi(50).category).toBe('Good');
    });

    it('should categorize AQI 51 as Moderate (lower boundary)', () => {
      expect(categorizeAqi(51).category).toBe('Moderate');
    });

    it('should categorize AQI 100 as Moderate (upper boundary)', () => {
      expect(categorizeAqi(100).category).toBe('Moderate');
    });

    it('should categorize AQI 101 as Unhealthy for Sensitive Groups', () => {
      expect(categorizeAqi(101).category).toBe('Unhealthy for Sensitive Groups');
    });

    it('should categorize AQI 150 as Unhealthy for Sensitive Groups (upper)', () => {
      expect(categorizeAqi(150).category).toBe('Unhealthy for Sensitive Groups');
    });

    it('should categorize AQI 151 as Unhealthy', () => {
      expect(categorizeAqi(151).category).toBe('Unhealthy');
    });

    it('should categorize AQI 200 as Unhealthy (upper)', () => {
      expect(categorizeAqi(200).category).toBe('Unhealthy');
    });

    it('should categorize AQI 201 as Very Unhealthy', () => {
      expect(categorizeAqi(201).category).toBe('Very Unhealthy');
    });

    it('should categorize AQI 300 as Very Unhealthy (upper)', () => {
      expect(categorizeAqi(300).category).toBe('Very Unhealthy');
    });

    it('should categorize AQI 301 as Hazardous', () => {
      expect(categorizeAqi(301).category).toBe('Hazardous');
    });

    it('should categorize AQI 500 as Hazardous (upper)', () => {
      expect(categorizeAqi(500).category).toBe('Hazardous');
    });
  });

  describe('edge cases', () => {
    it('should return Hazardous for AQI above 500', () => {
      const result = categorizeAqi(600);
      expect(result.category).toBe('Hazardous');
    });

    it('should return correct color classes for each category', () => {
      expect(categorizeAqi(25).colorClass).toBe('aqi-good');
      expect(categorizeAqi(75).colorClass).toBe('aqi-moderate');
      expect(categorizeAqi(125).colorClass).toBe('aqi-usg');
      expect(categorizeAqi(175).colorClass).toBe('aqi-unhealthy');
      expect(categorizeAqi(250).colorClass).toBe('aqi-very-unhealthy');
      expect(categorizeAqi(400).colorClass).toBe('aqi-hazardous');
    });

    it('should return correct icons for each category', () => {
      expect(categorizeAqi(25).icon).toBe('🟢');
      expect(categorizeAqi(75).icon).toBe('🟡');
      expect(categorizeAqi(125).icon).toBe('🟠');
      expect(categorizeAqi(175).icon).toBe('🔴');
      expect(categorizeAqi(250).icon).toBe('🟣');
      expect(categorizeAqi(400).icon).toBe('🟤');
    });
  });
});
