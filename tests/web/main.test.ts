/**
 * Integration tests for the main frontend application controller.
 *
 * @vitest-environment jsdom
 */

import type { AqiData, GeocodingResult, PersonalizedAdvice } from '@shared/types.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { mockFetchAdvice, mockFetchAqi, mockSearchCities } = vi.hoisted(() => ({
  mockFetchAdvice: vi.fn(),
  mockFetchAqi: vi.fn(),
  mockSearchCities: vi.fn(),
}));

vi.mock('../../src/web/api/client.js', () => ({
  fetchAdvice: mockFetchAdvice,
  fetchAqi: mockFetchAqi,
  searchCities: mockSearchCities,
}));

import { initApp } from '../../src/web/main.js';

const MOCK_CITY: GeocodingResult = {
  id: 1,
  name: 'Delhi',
  admin1: 'Delhi',
  country: 'India',
  countryCode: 'IN',
  latitude: 28.61,
  longitude: 77.21,
};

const MOCK_AQI: AqiData = {
  aqi: 155,
  category: 'Unhealthy',
  dominantPollutant: 'pm2_5',
  timestamp: '2026-11-28T06:00:00Z',
  pollutants: [{ name: 'pm2_5', displayName: 'PM2.5', value: 64.2, unit: 'µg/m³' }],
};

const MOCK_ADVICE: PersonalizedAdvice = {
  riskLevel: 'high',
  riskSummary: 'High winter smog — keep infants indoors.',
  actions: [
    {
      category: 'morning-routine',
      title: 'Seal windows',
      description: 'Keep windows closed during morning haze.',
      impact: 'Limits indoor PM2.5 infiltration.',
      benefit: 'High',
      icon: 'sun',
    },
  ],
  isBasicMode: false,
  personalization: 'ai',
};

function makeBox(tag: keyof HTMLElementTagNameMap, id: string, hidden = false): HTMLElement {
  const el = document.createElement(tag);
  el.id = id;
  if (hidden) {
    el.hidden = true;
  }
  return el;
}

function setupAppDom(): void {
  const errorBanner = makeBox('div', 'error-banner');
  errorBanner.setAttribute('role', 'alert');

  const loading = makeBox('div', 'loading');
  loading.setAttribute('aria-live', 'polite');

  const aqiSection = makeBox('section', 'aqi-section', true);
  aqiSection.appendChild(makeBox('div', 'aqi-display'));

  const adviceSection = makeBox('section', 'advice-section', true);
  adviceSection.appendChild(makeBox('div', 'advice-plan'));

  const footer = makeBox('footer', 'app-footer');

  document.body.replaceChildren(
    makeBox('header', 'app-header'),
    makeBox('div', 'hero'),
    makeBox('div', 'planner-tabs-container'),
    makeBox('div', 'location-search'),
    makeBox('div', 'location-pill-container'),
    makeBox('div', 'context-form'),
    errorBanner,
    loading,
    makeBox('div', 'success-banner'),
    makeBox('div', 'results'),
    aqiSection,
    adviceSection,
    makeBox('section', 'how-it-works'),
    footer,
  );
}

async function flushMicrotasks(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
}

function selectMockLocationViaSearch(): Promise<void> {
  mockSearchCities.mockResolvedValueOnce([MOCK_CITY]);
  const input = document.getElementById('city-search') as HTMLInputElement;
  input.value = 'Delhi';
  input.dispatchEvent(new Event('input'));
  return Promise.resolve();
}

function fillValidContextForm(): void {
  const ageSelect = document.getElementById('childAgeGroup') as HTMLSelectElement;
  ageSelect.value = 'infant';
  ageSelect.dispatchEvent(new Event('change'));

  (document.getElementById('healthConditions-none') as HTMLInputElement).checked = true;
  (document.getElementById('homeType-apartment') as HTMLInputElement).checked = true;
  (document.getElementById('commuteMode-car') as HTMLInputElement).checked = true;
}

describe('Main App Controller', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockFetchAdvice.mockReset();
    mockFetchAqi.mockReset();
    mockSearchCities.mockReset();

    Object.defineProperty(window, 'matchMedia', {
      value: vi.fn().mockReturnValue({ matches: true }),
      writable: true,
    });
    Element.prototype.scrollIntoView = vi.fn();

    setupAppDom();
    initApp();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('bootstraps layout sections, empty state, and disclaimer cleanly', () => {
    expect(document.querySelector('nav[aria-label="Main navigation"]')).not.toBeNull();
    expect(document.querySelector('h1.hero-headline')?.textContent).toContain('Breathe easier');
    expect(document.querySelector('.empty-state')).not.toBeNull();
    expect(document.querySelector('.how-it-works-grid')).not.toBeNull();
    expect(document.querySelector('.disclaimer-notice')).not.toBeNull();
  });

  it('fetches AQI on location selection, then fetches advice and displays plan on submit', async () => {
    mockFetchAqi.mockResolvedValueOnce(MOCK_AQI);
    mockFetchAdvice.mockResolvedValueOnce(MOCK_ADVICE);

    await selectMockLocationViaSearch();
    vi.advanceTimersByTime(350);
    await flushMicrotasks();

    const option = document.querySelector<HTMLLIElement>('.search-result-item');
    expect(option).not.toBeNull();
    option?.click();
    await flushMicrotasks();

    expect(mockFetchAqi).toHaveBeenCalledWith(28.61, 77.21);
    expect(document.getElementById('aqi-section')?.hidden).toBe(false);
    expect(document.querySelector('.location-aqi-pill')?.textContent).toContain('Delhi');
    expect(document.getElementById('trust-text')?.textContent).toContain('Fetched at');

    fillValidContextForm();
    const form = document.querySelector('form.context-form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit', { cancelable: true }));
    await flushMicrotasks();

    expect(mockFetchAdvice).toHaveBeenCalledTimes(1);
    expect(document.getElementById('advice-section')?.hidden).toBe(false);
    expect(document.querySelector('.success-wrapper')?.textContent).toContain(
      'Your personalized plan is generated.',
    );
    const submitBtn = document.getElementById('submit-advice-btn') as HTMLButtonElement;
    expect(submitBtn.disabled).toBe(false);
  });

  it('handles AQI fetch failure with retry button and ignores superseded AbortError', async () => {
    mockFetchAqi.mockRejectedValueOnce(new Error('AQI service unreachable'));
    mockFetchAqi.mockResolvedValueOnce(MOCK_AQI);

    await selectMockLocationViaSearch();
    vi.advanceTimersByTime(350);
    await flushMicrotasks();

    document.querySelector<HTMLLIElement>('.search-result-item')?.click();
    await flushMicrotasks();

    expect(document.querySelector('.error-text')?.textContent).toBe('AQI service unreachable');

    document.querySelector<HTMLButtonElement>('.error-retry-btn')?.click();
    await flushMicrotasks();
    expect(mockFetchAqi).toHaveBeenCalledTimes(2);
    expect(document.querySelector('.error-wrapper')).toBeNull();
    expect(document.getElementById('aqi-section')?.hidden).toBe(false);

    mockFetchAqi.mockRejectedValueOnce(new DOMException('Aborted', 'AbortError'));
    await selectMockLocationViaSearch();
    vi.advanceTimersByTime(350);
    await flushMicrotasks();
    document.querySelector<HTMLLIElement>('.search-result-item')?.click();
    await flushMicrotasks();
    expect(document.querySelector('.error-wrapper')).toBeNull();
  });

  it('shows defensive location error when submit fires without a selected location and handles advice failure', async () => {
    fillValidContextForm();
    const submitBtn = document.getElementById('submit-advice-btn') as HTMLButtonElement;
    submitBtn.disabled = false;

    const form = document.querySelector('form.context-form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit', { cancelable: true }));
    expect(document.querySelector('.error-text')?.textContent).toBe(
      'Please select a city or location first.',
    );

    mockFetchAqi.mockResolvedValueOnce(MOCK_AQI);
    mockFetchAdvice.mockRejectedValueOnce('non-error rejection');
    mockFetchAdvice.mockResolvedValueOnce(MOCK_ADVICE);

    await selectMockLocationViaSearch();
    vi.advanceTimersByTime(350);
    await flushMicrotasks();
    document.querySelector<HTMLLIElement>('.search-result-item')?.click();
    await flushMicrotasks();

    form.dispatchEvent(new Event('submit', { cancelable: true }));
    await flushMicrotasks();
    expect(document.querySelector('.error-text')?.textContent).toBe('Failed to generate advice');

    document.querySelector<HTMLButtonElement>('.error-retry-btn')?.click();
    await flushMicrotasks();
    expect(mockFetchAdvice).toHaveBeenCalledTimes(2);
    expect(document.getElementById('advice-section')?.hidden).toBe(false);
  });
});
