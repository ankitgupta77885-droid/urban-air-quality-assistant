/**
 * Browser geolocation helper for location search.
 */

import {
  GEOLOCATION_MAX_AGE_MS,
  GEOLOCATION_RESET_DELAY_MS,
  GEOLOCATION_TIMEOUT_MS,
} from '@shared/constants.js';
import type { GeocodingResult } from '@shared/types.js';

import { clearChildren, setText } from '../utils/dom.js';

import { createLocationPinIcon } from './icons.js';

/** Callback when a location is selected. */
type LocationCallback = (result: GeocodingResult) => void;

let resetTimerId: ReturnType<typeof setTimeout> | null = null;

/**
 * Handles browser geolocation request with UI feedback.
 * @param onSelect - Callback with a synthetic GeocodingResult.
 * @param btn - Geolocation button for feedback.
 */
export async function handleGeolocation(
  onSelect: LocationCallback,
  btn: HTMLButtonElement,
): Promise<void> {
  if (!('geolocation' in navigator)) {
    setText(btn, 'Geolocation not supported');
    return;
  }

  cancelPendingReset();
  setText(btn, 'Getting location…');
  btn.disabled = true;

  try {
    const position = await requestCurrentPosition();
    applyGeolocationResult(position, onSelect);
  } catch {
    setText(btn, 'Location access denied');
  } finally {
    btn.disabled = false;
    scheduleButtonReset(btn);
  }
}

/** Cancels any pending geolocation button label reset timer. */
function cancelPendingReset(): void {
  if (resetTimerId !== null) {
    clearTimeout(resetTimerId);
    resetTimerId = null;
  }
}

/** Schedules restoring the default geolocation button label and pin icon. */
function scheduleButtonReset(btn: HTMLButtonElement): void {
  resetTimerId = setTimeout(() => {
    resetTimerId = null;
    clearChildren(btn);
    btn.append(createLocationPinIcon(), document.createTextNode(' Use my location'));
  }, GEOLOCATION_RESET_DELAY_MS);
}

/** Wraps navigator.geolocation.getCurrentPosition in a Promise. */
function requestCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      timeout: GEOLOCATION_TIMEOUT_MS,
      maximumAge: GEOLOCATION_MAX_AGE_MS,
    });
  });
}

/** Applies successful geolocation result. */
function applyGeolocationResult(position: GeolocationPosition, onSelect: LocationCallback): void {
  onSelect({
    id: 0,
    name: 'Your Location',
    country: '',
    countryCode: '',
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  });

  const input = document.getElementById('city-search');
  if (input instanceof HTMLInputElement) {
    input.value = `${position.coords.latitude.toFixed(2)}, ${position.coords.longitude.toFixed(2)}`;
  }
}
