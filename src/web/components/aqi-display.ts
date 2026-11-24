/**
 * AQI summary display component.
 *
 * Shows current AQI value, status category, plain-English health impact for children,
 * live timestamp, and 6-pollutant grid with explicit status badges.
 */

import type { AqiData, PollutantReading } from '@shared/types.js';

import { clearChildren, createElement, getElement, setText, showElement } from '../utils/dom.js';
import { getAqiDisplay } from '../utils/formatters.js';

import { createAqiStatusIcon } from './icons.js';

/** Renders the AQI summary card into the display section. */
export function renderAqiDisplay(data: AqiData): void {
  const container = getElement('aqi-display');
  const section = getElement('aqi-section');
  clearChildren(container);

  const { category, colorClass } = getAqiDisplay(data.aqi);
  const card = createElement('div', 'aqi-card', colorClass, 'card', 'card-surface');
  card.setAttribute('aria-label', `Air Quality Index: ${data.aqi}, ${category}`);

  card.appendChild(buildAqiHeader(data.aqi, category));

  const desc = createElement('p', 'aqi-description');
  setText(desc, getAqiDescription(category));
  card.appendChild(desc);

  const time = createElement('p', 'aqi-time');
  setText(time, `Data from Open-Meteo • Updated at ${formatTimestamp(data.timestamp)}`);
  card.appendChild(time);

  card.appendChild(buildPollutantsSection(data.pollutants));
  container.appendChild(card);

  showElement(section);
}

/** Builds the AQI card header with icon, value, and category. */
function buildAqiHeader(aqi: number, category: string): HTMLElement {
  const header = createElement('div', 'aqi-header');

  const iconEl = createElement('span', 'aqi-icon');
  iconEl.setAttribute('aria-hidden', 'true');
  iconEl.appendChild(createAqiStatusIcon(category));

  const valueEl = createElement('span', 'aqi-value');
  setText(valueEl, String(aqi));

  const catEl = createElement('span', 'aqi-category');
  setText(catEl, category);

  header.appendChild(iconEl);
  header.appendChild(valueEl);
  header.appendChild(catEl);
  return header;
}

/** Builds the 6-pollutant readings grid section with status badges. */
function buildPollutantsSection(pollutants: readonly PollutantReading[]): HTMLElement {
  const wrapper = createElement('div', 'aqi-pollutants');
  const pollTitle = createElement('h3', 'pollutants-title');
  setText(pollTitle, 'Pollutant Levels');
  wrapper.appendChild(pollTitle);

  const grid = createElement('div', 'pollutants-grid');
  for (const p of pollutants) {
    const item = createElement('div', 'pollutant-item');

    const topRow = createElement('div', 'pollutant-top');
    const name = createElement('span', 'pollutant-name');
    setText(name, p.displayName);

    const badgeInfo = getPollutantStatusBadge(p.name, p.value);
    const badge = createElement('span', 'pollutant-badge', badgeInfo.className);
    setText(badge, badgeInfo.label);

    topRow.appendChild(name);
    topRow.appendChild(badge);

    const val = createElement('span', 'pollutant-value');
    setText(val, `${p.value} ${p.unit}`);

    item.appendChild(topRow);
    item.appendChild(val);
    grid.appendChild(item);
  }
  wrapper.appendChild(grid);
  return wrapper;
}

/** Evaluates pollutant concentration into Optimal, Moderate, or Elevated status. */
function getPollutantStatusBadge(name: string, val: number): { label: string; className: string } {
  const k = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  const isElev =
    k.includes('pm25') || k.includes('25')
      ? val > 35
      : k.includes('pm10') || k.includes('10')
        ? val > 150
        : k.includes('no2') || k.includes('nitrogen')
          ? val > 100
          : k.includes('o3') || k.includes('ozone')
            ? val > 70
            : k.includes('so2') || k.includes('sulphur')
              ? val > 75
              : k.includes('co') || k.includes('carbon')
                ? val > 9
                : val > 50;

  const isMod =
    k.includes('pm25') || k.includes('25')
      ? val > 12
      : k.includes('pm10') || k.includes('10')
        ? val > 54
        : k.includes('no2') || k.includes('nitrogen')
          ? val > 53
          : k.includes('o3') || k.includes('ozone')
            ? val > 54
            : k.includes('so2') || k.includes('sulphur')
              ? val > 35
              : k.includes('co') || k.includes('carbon')
                ? val > 4.4
                : val > 25;

  if (isElev) {
    return { label: 'Elevated', className: 'badge-elevated' };
  }
  if (isMod) {
    return { label: 'Moderate', className: 'badge-moderate' };
  }
  return { label: 'Optimal', className: 'badge-optimal' };
}

/** Returns plain-language impact description for children based on AQI category. */
function getAqiDescription(category: string): string {
  const n = category.toLowerCase();
  if (n.includes('good')) {
    return 'Air quality is satisfactory with little or no risk for children.';
  }
  if (n.includes('moderate')) {
    return 'Air quality is acceptable; unusually sensitive children may experience minor symptoms.';
  }
  if (n.includes('sensitive') || n.includes('usg')) {
    return 'Children with asthma or allergies should limit prolonged outdoor exertion.';
  }
  if (n.includes('very unhealthy')) {
    return 'Avoid outdoor activities for children. Keep indoor air filtered and windows sealed.';
  }
  if (n.includes('hazardous')) {
    return 'Emergency conditions. Everyone should remain indoors with air filtration.';
  }
  return 'All children should limit prolonged outdoor exertion; sensitive groups should stay indoors.';
}

/** Formats an ISO timestamp into a readable local time string. */
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
