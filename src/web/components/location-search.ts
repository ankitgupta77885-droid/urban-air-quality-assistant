/**
 * Location search component with city autocomplete and geolocation.
 */

import { MIN_SEARCH_LENGTH, SEARCH_DEBOUNCE_MS } from '@shared/constants.js';
import type { GeocodingResult } from '@shared/types.js';

import { searchCities } from '../api/client.js';
import { debounce } from '../utils/debounce.js';
import { clearChildren, createElement, getElement, setText } from '../utils/dom.js';

import { handleGeolocation } from './geolocation.js';
import { createLocationPinIcon } from './icons.js';

type LocationCallback = (result: GeocodingResult) => void;

/** Initializes the location search component. */
export function initLocationSearch(onSelect: LocationCallback): void {
  const container = getElement('location-search');
  const { label, inputRow, field, hint, results, geoBtn } = createSearchControls();

  container.append(label, inputRow, hint, results);

  const debouncedSearch = debounce((query: string) => {
    void handleSearch(query, results, onSelect);
  }, SEARCH_DEBOUNCE_MS);

  field.addEventListener('input', () => {
    const query = field.value.trim();
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

/** Creates the search DOM controls including responsive input row. */
function createSearchControls(): {
  label: HTMLElement;
  inputRow: HTMLElement;
  field: HTMLInputElement;
  hint: HTMLElement;
  results: HTMLElement;
  geoBtn: HTMLButtonElement;
} {
  const label = createElement('label', 'search-label');
  label.setAttribute('for', 'city-search');
  setText(label, 'Search for your city');

  const inputRow = createElement('div', 'search-input-row');

  const field = createElement('input', 'search-input');
  field.type = 'text';
  field.id = 'city-search';
  field.placeholder = 'e.g., Delhi, London, Beijing…';
  field.setAttribute('autocomplete', 'off');
  field.setAttribute('aria-describedby', 'search-hint');

  const geoBtn = createElement('button', 'geo-btn');
  geoBtn.type = 'button';
  geoBtn.appendChild(createLocationPinIcon());
  geoBtn.appendChild(document.createTextNode(' Use my location'));

  inputRow.append(field, geoBtn);

  const hint = createElement('p', 'search-hint');
  hint.id = 'search-hint';
  setText(hint, 'Type at least 2 characters to search');

  const results = createElement('ul', 'search-results');
  results.id = 'search-results';
  results.setAttribute('role', 'listbox');
  results.setAttribute('aria-label', 'City search results');

  return { label, inputRow, field, hint, results, geoBtn };
}

/** Handles city search and renders result options. */
async function handleSearch(query: string, listEl: HTMLElement, onSelect: LocationCallback): Promise<void> {
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
    if (error instanceof DOMException && error.name === 'AbortError') { return; }
    clearChildren(listEl);
    const li = createElement('li', 'search-error');
    setText(li, 'Search failed. Please try again.');
    listEl.appendChild(li);
  }
}

/** Creates a selectable city option element. */
function createCityOption(city: GeocodingResult, listEl: HTMLElement, onSelect: LocationCallback): HTMLElement {
  const li = createElement('li', 'search-result-item');
  li.setAttribute('role', 'option');
  li.setAttribute('tabindex', '0');
  const displayText = [city.name, city.admin1, city.country].filter(Boolean).join(', ');
  setText(li, displayText);

  const select = (): void => {
    onSelect(city);
    clearChildren(listEl);
    const input = document.getElementById('city-search') as HTMLInputElement | null;
    if (input) { input.value = displayText; }
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
