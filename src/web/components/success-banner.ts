/**
 * Success banner component confirming that an action completed.
 *
 * Renders a check icon, a confirmation message announced politely to assistive
 * technology, and an optional link that jumps to the generated content.
 */

import {
  clearChildren,
  clearElementById,
  createElement,
  getElement,
  setText,
} from '../utils/dom.js';

import { createCheckIcon } from './icons.js';

/** Optional link shown beside the success message. */
export interface SuccessLink {
  /** Visible link text. */
  readonly label: string;
  /** In-page anchor target, for example "#advice-section". */
  readonly href: string;
}

/**
 * Shows a success banner with a check icon, message and optional link.
 * @param message - Confirmation text shown to the user.
 * @param link - Optional in-page link to the generated content.
 */
export function showSuccess(message: string, link?: SuccessLink): void {
  const container = getElement('success-banner');
  clearChildren(container);

  const wrapper = createElement('div', 'success-wrapper');
  wrapper.setAttribute('role', 'status');

  const icon = createElement('span', 'success-icon');
  icon.setAttribute('aria-hidden', 'true');
  icon.appendChild(createCheckIcon());

  const text = createElement('p', 'success-text');
  setText(text, message);

  wrapper.append(icon, text);

  if (link) {
    const anchor = createElement('a', 'success-link');
    anchor.setAttribute('href', link.href);
    setText(anchor, link.label);
    wrapper.appendChild(anchor);
  }

  container.appendChild(wrapper);
}

/** Clears any displayed success banner. */
export function clearSuccess(): void {
  clearElementById('success-banner');
}
