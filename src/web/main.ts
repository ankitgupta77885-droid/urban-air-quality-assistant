/**
 * Frontend entry point.
 *
 * Orchestrates component initialization and application state flow.
 */

import type { GeocodingResult, UserContext } from '@shared/types.js';

import { fetchAqi, fetchAdvice } from './api/client.js';
import { renderAdvicePlan } from './components/advice-plan.js';
import { renderAqiDisplay } from './components/aqi-display.js';
import {
  initContextForm,
  setContextFormLocationSelected,
  showContextForm,
} from './components/context-form.js';
import { renderDisclaimer } from './components/disclaimer.js';
import { clearEmptyState, renderEmptyState } from './components/empty-state.js';
import { clearError, showError } from './components/error-banner.js';
import { updateTrustTimestamp } from './components/footer.js';
import { renderHero } from './components/hero.js';
import { renderHowItWorks } from './components/how-it-works.js';
import { hideLoading, showLoading } from './components/loading.js';
import { renderLocationPill } from './components/location-pill.js';
import { initLocationSearch } from './components/location-search.js';
import { initPlannerTabs, setPlannerTabsEnabled } from './components/planner-tabs.js';

/** Currently selected location coordinates. */
let selectedLat = 0;
let selectedLon = 0;

/** Handles location selection from search or geolocation. */
async function onLocationSelected(result: GeocodingResult): Promise<void> {
  selectedLat = result.latitude;
  selectedLon = result.longitude;
  const locationLabel = [result.name, result.admin1, result.country].filter(Boolean).join(', ');
  setContextFormLocationSelected(true, locationLabel);

  const resultsContainer = document.getElementById('results');
  if (resultsContainer) {
    clearEmptyState(resultsContainer);
  }

  clearError();
  showLoading('Fetching air quality data…');

  try {
    const aqiData = await fetchAqi(result.latitude, result.longitude);
    hideLoading();
    renderAqiDisplay(aqiData);
    updateTrustTimestamp(aqiData.timestamp);
    showContextForm();
    showLocationPill(locationLabel, aqiData.aqi, aqiData.category);
  } catch (error: unknown) {
    hideLoading();
    if (error instanceof DOMException && error.name === 'AbortError') {
      return;
    }
    const message = error instanceof Error ? error.message : 'Failed to fetch air quality data';
    showError(message, () => {
      void onLocationSelected(result);
    });
  }
}

/** Shows the location pill badge in the planner card. */
function showLocationPill(locationLabel: string, aqi: number, category: string): void {
  const pillContainer = document.getElementById('location-pill-container');
  if (pillContainer) {
    renderLocationPill(pillContainer, { locationName: locationLabel, aqi, category });
  }
}

/** Handles context form submission. */
async function onContextSubmit(context: UserContext): Promise<void> {
  clearError();
  showLoading('Generating your personalized advice…');

  try {
    const advice = await fetchAdvice(selectedLat, selectedLon, context);
    hideLoading();
    renderAdvicePlan(advice);
    setPlannerTabsEnabled(true);
  } catch (error: unknown) {
    hideLoading();
    if (error instanceof DOMException && error.name === 'AbortError') {
      return;
    }
    const message = error instanceof Error ? error.message : 'Failed to generate advice';
    showError(message, () => {
      void onContextSubmit(context);
    });
  }
}

/** Initializes the application layout and components. */
function init(): void {
  const heroContainer = document.getElementById('hero');
  if (heroContainer) {
    renderHero(heroContainer);
  }

  const tabsContainer = document.getElementById('planner-tabs-container');
  if (tabsContainer) {
    initPlannerTabs(tabsContainer);
  }

  const resultsContainer = document.getElementById('results');
  if (resultsContainer) {
    renderEmptyState(resultsContainer);
  }

  const howItWorksContainer = document.getElementById('how-it-works');
  if (howItWorksContainer) {
    renderHowItWorks(howItWorksContainer);
  }

  initLocationSearch((result) => {
    void onLocationSelected(result);
  });
  initContextForm((context) => {
    void onContextSubmit(context);
  });
  renderDisclaimer();
}

init();
