/**
 * Location search component with city autocomplete and geolocation.
 */

import { MIN_SEARCH_LENGTH, SEARCH_DEBOUNCE_MS } from '@shared/constants.js';
import type { GeocodingResult } from '@shared/types.js';

import { searchCities } from '../api/client.js';
import { debounce } from '../utils/debounce.js';
import { clearChildren, createElement, getElement, setText } from '../utils/dom.js';
import { formatLocationLabel } from '../utils/formatters.js';

import { handleGeolocation } from './geolocation.js';
import { createLocationPinIcon } from './icons.js';

type LocationCallback = (result: GeocodingResult) => void;

/** Initializes the location search component. */
export function initLocationSearch(onSelect: LocationCallback): void {
  const container = getElement('location-search');
  const { label, inputRow, field, hint, results, geoBtn } = createSearchControls();

  container.append(label, inputRow, hint, results);

  const debouncedSearch = debounce((query: string) => {
    void handleSearch(query, field, results, onSelect);
  }, SEARCH_DEBOUNCE_MS);

  field.addEventListener('input', () => {
    const query = field.value.trim();
    if (query.length < MIN_SEARCH_LENGTH) {
      debouncedSearch.cancel();
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
  geoBtn.append(createLocationPinIcon(), document.createTextNode(' Use my location'));

  inputRow.append(field, geoBtn);

  const hint = createElement('p', 'search-hint');
  hint.id = 'search-hint';
  setText(hint, `Type at least ${MIN_SEARCH_LENGTH} characters to search`);

  const results = createElement('ul', 'search-results');
  results.id = 'search-results';
  results.setAttribute('role', 'listbox');
  results.setAttribute('aria-label', 'City search results');

  return { label, inputRow, field, hint, results, geoBtn };
}

/** Handles city search and renders result options. */
async function handleSearch(
  query: string,
  field: HTMLInputElement,
  listEl: HTMLElement,
  onSelect: LocationCallback,
): Promise<void> {
  try {
    const cities = await searchCities(query);
    clearChildren(listEl);
    if (cities.length === 0) {
      renderStatusItem(listEl, 'search-no-results', 'No cities found', true);
      return;
    }
    for (const city of cities) {
      listEl.appendChild(createCityOption(city, field, listEl, onSelect));
    }
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return;
    }
    clearChildren(listEl);
    renderStatusItem(listEl, 'search-error', 'Search failed. Please try again.', false);
  }
}

/** Appends a status list item (empty results or error message) into the results listbox. */
function renderStatusItem(
  listEl: HTMLElement,
  className: string,
  message: string,
  asOption: boolean,
): void {
  const li = createElement('li', className);
  if (asOption) {
    li.setAttribute('role', 'option');
  }
  setText(li, message);
  listEl.appendChild(li);
}

/** Creates a selectable city option element. */
function createCityOption(
  city: GeocodingResult,
  field: HTMLInputElement,
  listEl: HTMLElement,
  onSelect: LocationCallback,
): HTMLElement {
  const li = createElement('li', 'search-result-item');
  li.setAttribute('role', 'option');
  li.setAttribute('tabindex', '0');
  const displayText = formatLocationLabel(city);
  setText(li, displayText);

  const select = (): void => {
    onSelect(city);
    clearChildren(listEl);
    field.value = displayText;
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
