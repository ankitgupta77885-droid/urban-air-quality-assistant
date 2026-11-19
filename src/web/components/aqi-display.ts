/**
 * AQI display component.
 *
 * Shows the current AQI value, category, icon, and pollutant readings.
 * Uses text and icons — never color alone — for accessibility.
 */

import type { AqiData, PollutantReading } from '@shared/types.js';

import { clearChildren, createElement, getElement, setText, showElement } from '../utils/dom.js';
import { getAqiDisplay } from '../utils/formatters.js';

/**
 * Renders the AQI data into the display section.
 * @param data - Current AQI data to display.
 */
export function renderAqiDisplay(data: AqiData): void {
  const container = getElement('aqi-display');
  const section = getElement('aqi-section');
  clearChildren(container);

  const { category, colorClass, icon } = getAqiDisplay(data.aqi);
  const card = createElement('div', 'aqi-card', colorClass);
  card.setAttribute('aria-label', `Air Quality Index: ${data.aqi}, ${category}`);

  const header = buildAqiHeader(data.aqi, category, icon);
  const categoryEl = createElement('span', 'aqi-category');
  setText(categoryEl, category);

  const time = createElement('p', 'aqi-time');
  setText(time, `Updated: ${formatTimestamp(data.timestamp)}`);

  card.appendChild(header);
  card.appendChild(categoryEl);
  card.appendChild(time);
  card.appendChild(buildPollutantsSection(data.pollutants));
  container.appendChild(card);

  showElement(section);
}

/** Builds the AQI card header with icon, value, and category. */
function buildAqiHeader(aqi: number, category: string, icon: string): HTMLElement {
  const header = createElement('div', 'aqi-header');

  const iconEl = createElement('span', 'aqi-icon');
  iconEl.setAttribute('aria-hidden', 'true');
  setText(iconEl, icon);

  const valueEl = createElement('span', 'aqi-value');
  setText(valueEl, String(aqi));

  const catEl = createElement('span', 'aqi-category');
  setText(catEl, category);

  header.appendChild(iconEl);
  header.appendChild(valueEl);
  header.appendChild(catEl);
  return header;
}

/** Builds the pollutant readings grid section. */
function buildPollutantsSection(pollutants: readonly PollutantReading[]): HTMLElement {
  const wrapper = createElement('div', 'aqi-pollutants');
  const pollTitle = createElement('h3', 'pollutants-title');
  setText(pollTitle, 'Pollutant Levels');
  wrapper.appendChild(pollTitle);

  const grid = createElement('div', 'pollutants-grid');
  for (const p of pollutants) {
    const item = createElement('div', 'pollutant-item');
    const name = createElement('span', 'pollutant-name');
    setText(name, p.displayName);
    const val = createElement('span', 'pollutant-value');
    setText(val, `${p.value} ${p.unit}`);
    item.appendChild(name);
    item.appendChild(val);
    grid.appendChild(item);
  }
  wrapper.appendChild(grid);
  return wrapper;
}

/**
 * Formats an ISO timestamp into a readable local time string.
 * @param timestamp - ISO 8601 timestamp string.
 * @returns Formatted local time string.
 */
function formatTimestamp(timestamp: string): string {
  try {
    return new Date(timestamp).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return timestamp;
  }
}
