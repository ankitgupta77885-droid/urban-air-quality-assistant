/**
 * Location search component with city autocomplete and geolocation.
 */

import { MIN_SEARCH_LENGTH, SEARCH_DEBOUNCE_MS } from '@shared/constants.js';
import type { GeocodingResult } from '@shared/types.js';

import { searchCities } from '../api/client.js';
import { debounce } from '../utils/debounce.js';
import { clearChildren, createElement, getElement, setText } from '../utils/dom.js';

/** Callback when a location is selected. */
type LocationCallback = (result: GeocodingResult) => void;

/**
 * Initializes the location search component.
 * @param onSelect - Callback fired when the user selects a location.
 */
export function initLocationSearch(onSelect: LocationCallback): void {
  const container = getElement('location-search');

  const label = createElement('label', 'search-label');
  label.setAttribute('for', 'city-search');
  setText(label, 'Search for your city');

  const input = createElement('input', 'search-input');
  input.type = 'text';
  input.id = 'city-search';
  input.placeholder = 'e.g., Delhi, London, Beijing…';
  input.setAttribute('autocomplete', 'off');
  input.setAttribute('aria-describedby', 'search-hint');

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

  container.appendChild(label);
  container.appendChild(input);
  container.appendChild(hint);
  container.appendChild(results);
  container.appendChild(geoBtn);

  const debouncedSearch = debounce((query: string) => {
    void handleSearch(query, results, onSelect);
  }, SEARCH_DEBOUNCE_MS);

  input.addEventListener('input', () => {
    const query = input.value.trim();
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
      const li = createElement('li', 'search-result-item');
      li.setAttribute('role', 'option');
      li.setAttribute('tabindex', '0');
      const displayText = [city.name, city.admin1, city.country]
        .filter(Boolean)
        .join(', ');
      setText(li, displayText);

      const selectHandler = (): void => {
        onSelect(city);
        clearChildren(listEl);
        const input = document.getElementById('city-search') as HTMLInputElement | null;
        if (input) {
          input.value = displayText;
        }
      };

      li.addEventListener('click', selectHandler);
      li.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectHandler();
        }
      });

      listEl.appendChild(li);
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

/**
 * Handles browser geolocation request.
 * @param onSelect - Callback with a synthetic GeocodingResult.
 * @param btn - Geolocation button for feedback.
 */
async function handleGeolocation(
  onSelect: LocationCallback,
  btn: HTMLButtonElement,
): Promise<void> {
  if (!('geolocation' in navigator)) {
    setText(btn, '❌ Geolocation not supported');
    return;
  }

  setText(btn, '⏳ Getting location…');
  btn.disabled = true;

  try {
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        timeout: 10000,
        maximumAge: 300000,
      });
    });

    onSelect({
      id: 0,
      name: 'Your Location',
      country: '',
      countryCode: '',
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    });

    const input = document.getElementById('city-search') as HTMLInputElement | null;
    if (input) {
      input.value = `📍 ${position.coords.latitude.toFixed(2)}, ${position.coords.longitude.toFixed(2)}`;
    }
  } catch {
    setText(btn, '❌ Location access denied');
  } finally {
    btn.disabled = false;
    setTimeout(() => {
      setText(btn, '📍 Use my location');
    }, 3000);
  }
}
