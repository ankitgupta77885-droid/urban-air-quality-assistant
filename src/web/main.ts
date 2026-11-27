/**
 * Frontend entry point.
 *
 * Orchestrates component initialization and application state flow.
 */

import type { GeocodingResult, UserContext } from '@shared/types.js';

import { fetchAdvice, fetchAqi } from './api/client.js';
import { renderAdvicePlan } from './components/advice-plan.js';
import { renderAqiDisplay } from './components/aqi-display.js';
import {
  initContextForm,
  setContextFormBusy,
  setContextFormLocationSelected,
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
import { renderNavbar } from './components/navbar.js';
import { initPlannerTabs, setPlannerTabsEnabled } from './components/planner-tabs.js';
import { clearSuccess, showSuccess } from './components/success-banner.js';
import { mountIfPresent } from './utils/dom.js';
import { formatLocationLabel } from './utils/formatters.js';
import { scrollToElementById } from './utils/scroll.js';

const PLAN_READY_MESSAGE = 'Your personalized plan is generated.';

let selectedLocation: GeocodingResult | null = null;

/** Runs an async UI request with unified loading, AbortError suppression, and error retry handling. */
async function runAsyncUiAction(
  loadingMessage: string,
  fallbackError: string,
  action: () => Promise<void>,
  onRetry: () => void,
): Promise<void> {
  clearError();
  clearSuccess();
  showLoading(loadingMessage);

  try {
    await action();
    hideLoading();
  } catch (error: unknown) {
    hideLoading();
    if (error instanceof DOMException && error.name === 'AbortError') {
      return;
    }
    const message = error instanceof Error ? error.message : fallbackError;
    showError(message, onRetry);
  }
}

/** Handles location selection from search or geolocation. */
async function onLocationSelected(result: GeocodingResult): Promise<void> {
  selectedLocation = result;
  const locationLabel = formatLocationLabel(result);
  setContextFormLocationSelected(true, locationLabel);
  mountIfPresent('results', clearEmptyState);

  await runAsyncUiAction(
    'Fetching air quality data…',
    'Failed to fetch air quality data',
    async () => {
      const aqiData = await fetchAqi(result.latitude, result.longitude);
      renderAqiDisplay(aqiData);
      updateTrustTimestamp(aqiData.timestamp);
      showLocationPill(locationLabel, aqiData.aqi, aqiData.category);
    },
    () => {
      void onLocationSelected(result);
    },
  );
}

/** Shows the location pill badge in the planner card. */
function showLocationPill(locationLabel: string, aqi: number, category: string): void {
  mountIfPresent('location-pill-container', (container) => {
    renderLocationPill(container, { locationName: locationLabel, aqi, category });
  });
}

/** Handles context form submission. */
async function onContextSubmit(context: UserContext): Promise<void> {
  const location = selectedLocation;
  if (!location) {
    showError('Please select a city or location first.');
    return;
  }

  setContextFormBusy(true);
  try {
    await runAsyncUiAction(
      'Generating your personalized advice…',
      'Failed to generate advice',
      async () => {
        const advice = await fetchAdvice(location.latitude, location.longitude, context);
        renderAdvicePlan(advice);
        setPlannerTabsEnabled(true);
        showSuccess(PLAN_READY_MESSAGE, { label: 'View your plan', href: '#advice-section' });
        scrollToElementById('success-banner');
      },
      () => {
        void onContextSubmit(context);
      },
    );
  } finally {
    setContextFormBusy(false);
  }
}

/** Initializes the application layout and components. */
export function initApp(): void {
  selectedLocation = null;
  mountIfPresent('app-header', renderNavbar);
  mountIfPresent('hero', renderHero);
  mountIfPresent('planner-tabs-container', initPlannerTabs);
  mountIfPresent('results', renderEmptyState);
  mountIfPresent('how-it-works', renderHowItWorks);

  initLocationSearch((result) => {
    void onLocationSelected(result);
  });
  initContextForm((context) => {
    void onContextSubmit(context);
  });
  renderDisclaimer();
}

/** Auto-bootstraps when all required mount containers are present in the document. */
if (
  typeof document !== 'undefined' &&
  document.getElementById('location-search') &&
  document.getElementById('context-form') &&
  document.getElementById('disclaimer')
) {
  initApp();
}
