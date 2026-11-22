/**
 * Tests for Step 5: How It Works section, empty state, loading state,
 * error banner with retry, and trust strip timestamp.
 *
 * @vitest-environment jsdom
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { clearEmptyState, renderEmptyState } from '../../src/web/components/empty-state.js';
import { clearError, showError } from '../../src/web/components/error-banner.js';
import { updateTrustTimestamp } from '../../src/web/components/footer.js';
import { renderHowItWorks } from '../../src/web/components/how-it-works.js';
import { hideLoading, showLoading } from '../../src/web/components/loading.js';

describe('Step 5: How It Works Section', () => {
  it('should render section title and 3 feature cards with icons and descriptions', () => {
    const container = document.createElement('section');
    renderHowItWorks(container);

    const title = container.querySelector('.how-it-works-title');
    expect(title?.textContent).toBe('Simple steps to cut smog exposure at home');

    const cards = container.querySelectorAll('.how-it-works-card');
    expect(cards.length).toBe(3);

    const cardTitles = Array.from(container.querySelectorAll('.how-it-works-card-title')).map(
      (el) => el.textContent,
    );
    expect(cardTitles).toEqual(['Check Air', 'Personalize', 'Act & Protect']);

    const steps = Array.from(container.querySelectorAll('.how-it-works-step')).map(
      (el) => el.textContent,
    );
    expect(steps).toEqual(['01', '02', '03']);

    const icons = container.querySelectorAll('.how-it-works-icon svg');
    expect(icons.length).toBe(3);
    for (const icon of icons) {
      expect(icon.getAttribute('aria-hidden')).toBe('true');
    }
  });
});

describe('Step 5: Empty State', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
  });

  it('should render initial prompt before first search', () => {
    renderEmptyState(container);

    const heading = container.querySelector('.empty-state-title');
    expect(heading?.textContent).toBe("Search for your city to see today's air quality.");

    const wrapper = container.querySelector('.empty-state');
    expect(wrapper?.getAttribute('role')).toBe('status');
  });

  it('should clear empty state cleanly', () => {
    renderEmptyState(container);
    expect(container.children.length).toBe(1);

    clearEmptyState(container);
    expect(container.children.length).toBe(0);
  });
});

describe('Step 5: Loading State', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="loading" aria-live="polite"></div>';
  });

  it('should render accessible spinner and status message', () => {
    showLoading('Fetching air quality data…');

    const wrapper = document.querySelector('.loading-wrapper');
    expect(wrapper?.getAttribute('role')).toBe('status');

    const spinner = document.querySelector('.loading-spinner');
    expect(spinner?.getAttribute('aria-hidden')).toBe('true');

    const text = document.querySelector('.loading-text');
    expect(text?.textContent).toBe('Fetching air quality data…');
  });

  it('should hide loading indicator on hideLoading()', () => {
    showLoading('Loading…');
    expect(document.getElementById('loading')?.children.length).toBe(1);

    hideLoading();
    expect(document.getElementById('loading')?.children.length).toBe(0);
  });
});

describe('Step 5: Error Banner with Retry', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="error-banner" role="alert" aria-live="assertive"></div>';
  });

  it('should render error message with SVG alert icon and no emoji', () => {
    showError('Network error occurred');

    const banner = document.querySelector('.error-wrapper');
    expect(banner).not.toBeNull();
    expect(banner?.textContent).toContain('Network error occurred');
    expect(banner?.textContent).not.toContain('⚠️');

    const svgIcon = banner?.querySelector('svg');
    expect(svgIcon).not.toBeNull();
  });

  it('should render Retry button when onRetry callback is provided', () => {
    const onRetry = vi.fn();
    showError('Failed to fetch', onRetry);

    const retryBtn = document.querySelector('.error-retry-btn');
    expect(retryBtn).not.toBeNull();
    expect(retryBtn?.textContent).toBe('Retry');

    (retryBtn as HTMLButtonElement).click();
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(document.getElementById('error-banner')?.children.length).toBe(0);
  });

  it('should dismiss error when close button is clicked', () => {
    showError('Something went wrong');
    const closeBtn = document.querySelector('.error-close') as HTMLButtonElement;
    expect(closeBtn).not.toBeNull();

    closeBtn.click();
    expect(document.getElementById('error-banner')?.children.length).toBe(0);
  });

  it('should clear error cleanly via clearError()', () => {
    showError('Temporary error');
    expect(document.getElementById('error-banner')?.children.length).toBe(1);

    clearError();
    expect(document.getElementById('error-banner')?.children.length).toBe(0);
  });
});

describe('Step 5: Trust Strip Timestamp', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="trust-text">Data from Open-Meteo</div>';
  });

  it('should render base source text initially', () => {
    updateTrustTimestamp();
    expect(document.getElementById('trust-text')?.textContent).toBe('Data from Open-Meteo');
  });

  it('should render formatted time with real timestamp without invented sources', () => {
    updateTrustTimestamp('2026-11-22T14:30:00Z');
    const text = document.getElementById('trust-text')?.textContent;
    expect(text).toContain('Data from Open-Meteo • Fetched at');
    expect(text).not.toContain('every 15 minutes');
    expect(text).not.toContain('IQAir');
  });
});
