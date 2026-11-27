/**
 * Unit tests for browser geolocation component.
 *
 * @vitest-environment jsdom
 */

import type { GeocodingResult } from '@shared/types.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { handleGeolocation } from '../../src/web/components/geolocation.js';

describe('handleGeolocation', () => {
  let btn: HTMLButtonElement;
  let input: HTMLInputElement;

  beforeEach(() => {
    vi.useFakeTimers();
    document.body.replaceChildren();

    btn = document.createElement('button');
    btn.textContent = 'Use my location';
    document.body.appendChild(btn);

    input = document.createElement('input');
    input.id = 'city-search';
    document.body.appendChild(input);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('displays message when geolocation is not supported by the browser', async () => {
    const onSelect = vi.fn();
    const originalNavigator = globalThis.navigator;

    // Simulate navigator without geolocation
    vi.stubGlobal('navigator', {});

    await handleGeolocation(onSelect, btn);

    expect(btn.textContent).toBe('Geolocation not supported');
    expect(onSelect).not.toHaveBeenCalled();

    vi.stubGlobal('navigator', originalNavigator);
  });

  it('updates input and calls onSelect with coordinates on successful geolocation', async () => {
    const onSelect = vi.fn<(result: GeocodingResult) => void>();

    const mockPosition: GeolocationPosition = {
      coords: {
        latitude: 51.5074,
        longitude: -0.1278,
        accuracy: 10,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
        toJSON: () => ({}),
      },
      timestamp: Date.now(),
      toJSON: () => ({}),
    };

    const mockGeolocation = {
      getCurrentPosition: vi.fn((success: PositionCallback) => {
        success(mockPosition);
      }),
    };

    Object.defineProperty(window.navigator, 'geolocation', {
      value: mockGeolocation,
      configurable: true,
      writable: true,
    });

    await handleGeolocation(onSelect, btn);

    expect(onSelect).toHaveBeenCalledWith({
      id: 0,
      name: 'Your Location',
      country: '',
      countryCode: '',
      latitude: 51.5074,
      longitude: -0.1278,
    });
    expect(input.value).toBe('51.51, -0.13');

    // Button should be re-enabled
    expect(btn.disabled).toBe(false);

    // Fast-forward 3000ms timer to verify button reset
    vi.advanceTimersByTime(3000);
    expect(btn.textContent).toContain('Use my location');
  });

  it('shows error state when geolocation permission is denied', async () => {
    const onSelect = vi.fn();

    const mockGeolocation = {
      getCurrentPosition: vi.fn((_success: PositionCallback, error: PositionErrorCallback) => {
        const err = {
          code: 1,
          message: 'User denied Geolocation',
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3,
        } as GeolocationPositionError;
        error(err);
      }),
    };

    Object.defineProperty(window.navigator, 'geolocation', {
      value: mockGeolocation,
      configurable: true,
      writable: true,
    });

    await handleGeolocation(onSelect, btn);

    expect(btn.textContent).toBe('Location access denied');
    expect(onSelect).not.toHaveBeenCalled();
    expect(btn.disabled).toBe(false);

    vi.advanceTimersByTime(3000);
    expect(btn.textContent).toContain('Use my location');
  });

  it('cancels any pending reset timer when geolocation is triggered again quickly', async () => {
    const onSelect = vi.fn();
    const mockGeolocation = {
      getCurrentPosition: vi.fn((_success: PositionCallback, error: PositionErrorCallback) => {
        error({ code: 1 } as GeolocationPositionError);
      }),
    };
    Object.defineProperty(window.navigator, 'geolocation', {
      value: mockGeolocation,
      configurable: true,
      writable: true,
    });

    await handleGeolocation(onSelect, btn);
    vi.advanceTimersByTime(1500);
    await handleGeolocation(onSelect, btn);

    vi.advanceTimersByTime(1600);
    expect(btn.textContent).toBe('Location access denied');

    vi.advanceTimersByTime(1500);
    expect(btn.textContent).toContain('Use my location');
  });
});
