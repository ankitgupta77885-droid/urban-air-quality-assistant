/**
 * Location search component with city autocomplete and geolocation.
 */

import { MIN_SEARCH_LENGTH, SEARCH_DEBOUNCE_MS } from '@shared/constants.js';
import type { GeocodingResult } from '@shared/types.js';

import { searchCities } from '../api/client.js';
import { debounce } from '../utils/debounce.js';
import { clearChildren, createElement, getElement, setText } from '../utils/dom.js';

import { handleGeolocation } from './geolocation.js';

/** Callback when a location is selected. */
type LocationCallback = (result: GeocodingResult) => void;

/**
 * Initializes the location search component.
 * @param onSelect - Callback fired when the user selects a location.
 */
export function initLocationSearch(onSelect: LocationCallback): void {
  const container = getElement('location-search');
  const { input, results, geoBtn } = createSearchControls();

  container.appendChild(input.label);
  container.appendChild(input.field);
  container.appendChild(input.hint);
  container.appendChild(results);
  container.appendChild(geoBtn);

  const debouncedSearch = debounce((query: string) => {
    void handleSearch(query, results, onSelect);
  }, SEARCH_DEBOUNCE_MS);

  input.field.addEventListener('input', () => {
    const query = input.field.value.trim();
    if (query.length < MIN_SEARCH_LENGTH) {
      clearChildren(results);
      return;
    }
    debouncedSearch(query);
  });

  geoBtn.addEventListener('click', () => {
    void handleGeolocation(onSelect, geoBtn);
  });
}

/** Creates the search DOM controls. */
function createSearchControls(): {
  input: { label: HTMLElement; field: HTMLInputElement; hint: HTMLElement };
  results: HTMLElement;
  geoBtn: HTMLButtonElement;
} {
  const label = createElement('label', 'search-label');
  label.setAttribute('for', 'city-search');
  setText(label, 'Search for your city');

  const field = createElement('input', 'search-input');
  field.type = 'text';
  field.id = 'city-search';
  field.placeholder = 'e.g., Delhi, London, Beijing…';
  field.setAttribute('autocomplete', 'off');
  field.setAttribute('aria-describedby', 'search-hint');

  const hint = createElement('p', 'search-hint');
  hint.id = 'search-hint';
  setText(hint, 'Type at least 2 characters to search');

  const results = createElement('ul', 'search-results');
  results.id = 'search-results';
  results.setAttribute('role', 'listbox');
  results.setAttribute('aria-label', 'City search results');

  const geoBtn = createElement('button', 'geo-btn');
  geoBtn.type = 'button';
  setText(geoBtn, '📍 Use my location');

  return { input: { label, field, hint }, results, geoBtn };
}

/**
 * Handles the city search and renders results.
 * @param query - Search query string.
 * @param listEl - UL element to render results into.
 * @param onSelect - Selection callback.
 */
async function handleSearch(
  query: string,
  listEl: HTMLElement,
  onSelect: LocationCallback,
): Promise<void> {
  try {
    const cities = await searchCities(query);
    clearChildren(listEl);

    if (cities.length === 0) {
      const li = createElement('li', 'search-no-results');
      li.setAttribute('role', 'option');
      setText(li, 'No cities found');
      listEl.appendChild(li);
      return;
    }

    for (const city of cities) {
      listEl.appendChild(createCityOption(city, listEl, onSelect));
    }
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return;
    }
    clearChildren(listEl);
    const li = createElement('li', 'search-error');
    setText(li, 'Search failed. Please try again.');
    listEl.appendChild(li);
  }
}

/** Creates a selectable city option element. */
function createCityOption(
  city: GeocodingResult,
  listEl: HTMLElement,
  onSelect: LocationCallback,
): HTMLElement {
  const li = createElement('li', 'search-result-item');
  li.setAttribute('role', 'option');
  li.setAttribute('tabindex', '0');
  const displayText = [city.name, city.admin1, city.country].filter(Boolean).join(', ');
  setText(li, displayText);

  const select = (): void => {
    onSelect(city);
    clearChildren(listEl);
    const input = document.getElementById('city-search') as HTMLInputElement | null;
    if (input) {
      input.value = displayText;
    }
  };

  li.addEventListener('click', select);
  li.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      select();
    }
  });

  return li;
}
