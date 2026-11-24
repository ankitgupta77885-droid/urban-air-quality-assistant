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

interface PollutantThreshold {
  readonly elevated: number;
  readonly moderate: number;
}

const DEFAULT_THRESHOLD: PollutantThreshold = { elevated: 50, moderate: 25 };

interface ThresholdRule {
  readonly patterns: readonly string[];
  readonly threshold: PollutantThreshold;
}

const POLLUTANT_THRESHOLDS: readonly ThresholdRule[] = [
  { patterns: ['pm25', '25'], threshold: { elevated: 35, moderate: 12 } },
  { patterns: ['pm10', '10'], threshold: { elevated: 150, moderate: 54 } },
  { patterns: ['no2', 'nitrogen'], threshold: { elevated: 100, moderate: 53 } },
  { patterns: ['o3', 'ozone'], threshold: { elevated: 70, moderate: 54 } },
  { patterns: ['so2', 'sulphur'], threshold: { elevated: 75, moderate: 35 } },
  { patterns: ['co', 'carbon'], threshold: { elevated: 9, moderate: 4.4 } },
] as const;

/** Looks up the relevant concentration threshold for a pollutant. */
function lookupThreshold(normalizedName: string): PollutantThreshold {
  for (const rule of POLLUTANT_THRESHOLDS) {
    if (rule.patterns.some((pattern) => normalizedName.includes(pattern))) {
      return rule.threshold;
    }
  }
  return DEFAULT_THRESHOLD;
}

/** Evaluates pollutant concentration into Optimal, Moderate, or Elevated status. */
function getPollutantStatusBadge(name: string, val: number): { label: string; className: string } {
  const normalized = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  const { elevated, moderate } = lookupThreshold(normalized);

  if (val > elevated) {
    return { label: 'Elevated', className: 'badge-elevated' };
  }
  if (val > moderate) {
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
