/**
 * Browser geolocation helper for location search.
 */

import type { GeocodingResult } from '@shared/types.js';

import { clearChildren, setText } from '../utils/dom.js';

import { createLocationPinIcon } from './icons.js';

/** Callback when a location is selected. */
type LocationCallback = (result: GeocodingResult) => void;

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

  setText(btn, 'Getting location…');
  btn.disabled = true;

  try {
    const position = await requestCurrentPosition();
    applyGeolocationResult(position, onSelect);
  } catch {
    setText(btn, 'Location access denied');
  } finally {
    btn.disabled = false;
    setTimeout(() => {
      clearChildren(btn);
      btn.appendChild(createLocationPinIcon());
      btn.appendChild(document.createTextNode(' Use my location'));
    }, 3000);
  }
}

/** Wraps navigator.geolocation.getCurrentPosition in a Promise. */
function requestCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      timeout: 10000,
      maximumAge: 300000,
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
