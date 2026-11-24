/**
 * Location and AQI summary pill component.
 *
 * Appears only after a location is selected and real AQI data is fetched.
 */

import { createElement, setText } from '../utils/dom.js';

import { createAqiStatusIcon, createLocationPinIcon } from './icons.js';

/** Properties for rendering the location and AQI summary pill. */
export interface LocationPillProps {
  /** Formatted locality name displayed in the pill. */
  readonly locationName: string;
  /** Numerical Air Quality Index value. */
  readonly aqi: number;
  /** Human-readable category label (e.g., 'Good', 'Moderate'). */
  readonly category: string;
}

/**
 * Renders the location and AQI pill into the target container.
 * @param container - Target container element.
 * @param props - Real location name, AQI value, and category.
 */
export function renderLocationPill(container: HTMLElement, props: LocationPillProps): void {
  container.replaceChildren();

  const pill = createElement('div', 'location-aqi-pill');
  pill.setAttribute('role', 'status');
  pill.setAttribute(
    'aria-label',
    `Selected location: ${props.locationName}, Air Quality Index: ${props.aqi}, ${props.category}`,
  );

  const pinWrapper = createElement('span', 'pill-pin-icon');
  pinWrapper.appendChild(createLocationPinIcon());

  const nameEl = createElement('span', 'pill-location-name');
  setText(nameEl, props.locationName);

  const divider = createElement('span', 'pill-divider');
  divider.setAttribute('aria-hidden', 'true');
  setText(divider, '•');

  const aqiIconWrapper = createElement('span', 'pill-aqi-icon');
  aqiIconWrapper.appendChild(createAqiStatusIcon(props.category));

  const aqiText = createElement('span', 'pill-aqi-text');
  setText(aqiText, `AQI ${props.aqi} — ${props.category}`);

  pill.appendChild(pinWrapper);
  pill.appendChild(nameEl);
  pill.appendChild(divider);
  pill.appendChild(aqiIconWrapper);
  pill.appendChild(aqiText);

  container.appendChild(pill);
}

/**
 * Clears the location pill container.
 * @param container - Target container element.
 */
export function clearLocationPill(container: HTMLElement): void {
  container.replaceChildren();
}
