/**
 * Empty state component.
 *
 * Renders the initial empty state before the user performs their first location search:
 * "Search for your city to see today's air quality."
 */

import { clearChildren, createElement, setText } from '../utils/dom.js';

import { createCard } from './card.js';
import { createLocationPinIcon } from './icons.js';

/**
 * Renders the empty state into the target container.
 * @param container - Target container element (e.g. #results).
 */
export function renderEmptyState(container: HTMLElement): void {
  clearChildren(container);

  const wrapper = createCard({ padding: 'xl', className: 'empty-state', role: 'status' });

  const iconWrapper = createElement('span', 'empty-state-icon');
  iconWrapper.setAttribute('aria-hidden', 'true');
  iconWrapper.appendChild(createLocationPinIcon());

  const heading = createElement('h3', 'empty-state-title');
  setText(heading, "Search for your city to see today's air quality.");

  const hint = createElement('p', 'empty-state-hint');
  setText(
    hint,
    'Enter a location above to see live pollutant levels and get personalized household advice.',
  );

  wrapper.append(iconWrapper, heading, hint);
  container.appendChild(wrapper);
}

/**
 * Clears the empty state from the container.
 * @param container - Target container element.
 */
export function clearEmptyState(container: HTMLElement): void {
  clearChildren(container);
}
