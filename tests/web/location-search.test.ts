/**
 * Unit tests for location-search component.
 *
 * @vitest-environment jsdom
 */

import type { GeocodingResult } from '@shared/types.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockSearchCities = vi.fn();
const mockHandleGeolocation = vi.fn();

vi.mock('../../src/web/api/client.js', () => ({
  searchCities: (...args: unknown[]) => mockSearchCities(...args) as unknown,
}));

vi.mock('../../src/web/components/geolocation.js', () => ({
  handleGeolocation: (...args: unknown[]) => mockHandleGeolocation(...args) as unknown,
}));

import { initLocationSearch } from '../../src/web/components/location-search.js';

function requireInput(parent: ParentNode, selector: string): HTMLInputElement {
  const el = parent.querySelector(selector);
  if (!(el instanceof HTMLInputElement)) {
    throw new Error(`Input not found: ${selector}`);
  }
  return el;
}

function requireList(parent: ParentNode, selector: string): HTMLUListElement {
  const el = parent.querySelector(selector);
  if (!(el instanceof HTMLUListElement)) {
    throw new Error(`List not found: ${selector}`);
  }
  return el;
}

function requireButton(parent: ParentNode, selector: string): HTMLButtonElement {
  const el = parent.querySelector(selector);
  if (!(el instanceof HTMLButtonElement)) {
    throw new Error(`Button not found: ${selector}`);
  }
  return el;
}

describe('initLocationSearch', () => {
  let container: HTMLElement;
  const mockCities: GeocodingResult[] = [
    {
      id: 1,
      name: 'Tokyo',
      country: 'Japan',
      countryCode: 'JP',
      latitude: 35.6762,
      longitude: 139.6503,
    },
    {
      id: 2,
      name: 'Kyoto',
      admin1: 'Kyoto',
      country: 'Japan',
      countryCode: 'JP',
      latitude: 35.0116,
      longitude: 135.7681,
    },
  ];

  beforeEach(() => {
    vi.useFakeTimers();
    document.body.innerHTML = '<div id="location-search"></div>';
    const root = document.getElementById('location-search');
    if (!root) {
      throw new Error('missing location-search container');
    }
    container = root;
    mockSearchCities.mockReset();
    mockHandleGeolocation.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('initializes search controls and DOM structure', () => {
    const onSelect = vi.fn();
    initLocationSearch(onSelect);

    const input = container.querySelector<HTMLInputElement>('#city-search');
    const geoBtn = container.querySelector<HTMLButtonElement>('.geo-btn');
    const results = container.querySelector<HTMLUListElement>('#search-results');

    expect(input).not.toBeNull();
    expect(geoBtn).not.toBeNull();
    expect(results).not.toBeNull();
    expect(results?.getAttribute('role')).toBe('listbox');
  });

  it('does not search when query length is less than 2 characters', () => {
    const onSelect = vi.fn();
    initLocationSearch(onSelect);

    const input = requireInput(container, '#city-search');
    input.value = 'a';
    input.dispatchEvent(new Event('input'));

    vi.advanceTimersByTime(500);

    expect(mockSearchCities).not.toHaveBeenCalled();
  });

  it('searches cities on debounced input and renders selectable results', async () => {
    const onSelect = vi.fn();
    mockSearchCities.mockResolvedValue(mockCities);

    initLocationSearch(onSelect);
    const input = requireInput(container, '#city-search');
    const results = requireList(container, '#search-results');

    input.value = 'Tokyo';
    input.dispatchEvent(new Event('input'));

    vi.advanceTimersByTime(300);
    await vi.runAllTimersAsync();

    expect(mockSearchCities).toHaveBeenCalledWith('Tokyo');
    const items = results.querySelectorAll('.search-result-item');
    expect(items).toHaveLength(2);
    expect(items[0]?.textContent).toBe('Tokyo, Japan');
    expect(items[1]?.textContent).toBe('Kyoto, Kyoto, Japan');

    // Click first item to select
    items[0]?.dispatchEvent(new MouseEvent('click'));
    expect(onSelect).toHaveBeenCalledWith(mockCities[0]);
    expect(input.value).toBe('Tokyo, Japan');
  });

  it('allows keyboard navigation selecting item with Enter or Space', async () => {
    const onSelect = vi.fn();
    mockSearchCities.mockResolvedValue(mockCities);

    initLocationSearch(onSelect);
    const results = requireList(container, '#search-results');

    const input = requireInput(container, '#city-search');
    input.value = 'Tokyo';
    input.dispatchEvent(new Event('input'));

    vi.advanceTimersByTime(300);
    await vi.runAllTimersAsync();

    const items = results.querySelectorAll('.search-result-item');
    items[1]?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

    expect(onSelect).toHaveBeenCalledWith(mockCities[1]);
  });

  it('renders "No cities found" when search returns empty results', async () => {
    const onSelect = vi.fn();
    mockSearchCities.mockResolvedValue([]);

    initLocationSearch(onSelect);
    const input = requireInput(container, '#city-search');
    const results = requireList(container, '#search-results');

    input.value = 'UnknownCity';
    input.dispatchEvent(new Event('input'));

    vi.advanceTimersByTime(300);
    await vi.runAllTimersAsync();

    const noResults = results.querySelector('.search-no-results');
    expect(noResults).not.toBeNull();
    expect(noResults?.textContent).toBe('No cities found');
  });

  it('renders error message when searchCities rejects with an error', async () => {
    const onSelect = vi.fn();
    mockSearchCities.mockRejectedValue(new Error('Network error'));

    initLocationSearch(onSelect);
    const input = requireInput(container, '#city-search');
    const results = requireList(container, '#search-results');

    input.value = 'FailCity';
    input.dispatchEvent(new Event('input'));

    vi.advanceTimersByTime(300);
    await vi.runAllTimersAsync();

    const errorItem = results.querySelector('.search-error');
    expect(errorItem).not.toBeNull();
    expect(errorItem?.textContent).toBe('Search failed. Please try again.');
  });

  it('triggers handleGeolocation when geo-btn is clicked', () => {
    const onSelect = vi.fn();
    initLocationSearch(onSelect);

    const geoBtn = requireButton(container, '.geo-btn');
    geoBtn.click();

    expect(mockHandleGeolocation).toHaveBeenCalledWith(onSelect, geoBtn);
  });
});
