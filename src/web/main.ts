/**
 * Frontend entry point.
 *
 * Orchestrates component initialization and application state flow.
 */

import type { GeocodingResult, UserContext } from '@shared/types.js';

import { fetchAqi, fetchAdvice } from './api/client.js';
import { renderAdvicePlan } from './components/advice-plan.js';
import { renderAqiDisplay } from './components/aqi-display.js';
import { initContextForm, showContextForm } from './components/context-form.js';
import { renderDisclaimer } from './components/disclaimer.js';
import { clearError, showError } from './components/error-banner.js';
import { hideLoading, showLoading } from './components/loading.js';
import { initLocationSearch } from './components/location-search.js';

/** Currently selected location coordinates. */
let selectedLat = 0;
let selectedLon = 0;

/**
 * Handles location selection from search or geolocation.
 * @param result - Selected geocoding result.
 */
async function onLocationSelected(result: GeocodingResult): Promise<void> {
  selectedLat = result.latitude;
  selectedLon = result.longitude;

  clearError();
  showLoading('Fetching air quality data…');

  try {
    const aqiData = await fetchAqi(result.latitude, result.longitude);
    hideLoading();
    renderAqiDisplay(aqiData);
    showContextForm();
  } catch (error: unknown) {
    hideLoading();
    if (error instanceof DOMException && error.name === 'AbortError') {
      return;
    }
    const message = error instanceof Error ? error.message : 'Failed to fetch air quality data';
    showError(message);
  }
}

/**
 * Handles context form submission.
 * @param context - User lifestyle context from the form.
 */
async function onContextSubmit(context: UserContext): Promise<void> {
  clearError();
  showLoading('Generating your personalized advice…');

  try {
    const advice = await fetchAdvice(selectedLat, selectedLon, context);
    hideLoading();
    renderAdvicePlan(advice);
  } catch (error: unknown) {
    hideLoading();
    if (error instanceof DOMException && error.name === 'AbortError') {
      return;
    }
    const message = error instanceof Error ? error.message : 'Failed to generate advice';
    showError(message);
  }
}

/** Initializes the application. */
function init(): void {
  initLocationSearch((result) => {
    void onLocationSelected(result);
  });

  initContextForm((context) => {
    void onContextSubmit(context);
  });

  renderDisclaimer();
}

init();
