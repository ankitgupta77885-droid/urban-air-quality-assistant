/**
 * Accessible loading indicator component.
 *
 * Renders an animated loading spinner paired with polite aria-live status text.
 */

import { clearChildren, clearElementById, createElement, setText } from '../utils/dom.js';

/**
 * Shows the loading indicator with an accessible message.
 * @param message - User-facing loading status message.
 */
export function showLoading(message: string): void {
  const container = document.getElementById('loading');
  if (!container) {
    return;
  }
  clearChildren(container);

  const wrapper = createElement('div', 'loading-wrapper');
  wrapper.setAttribute('role', 'status');

  const spinner = createElement('div', 'loading-spinner');
  spinner.setAttribute('aria-hidden', 'true');

  const text = createElement('p', 'loading-text');
  setText(text, message);

  wrapper.append(spinner, text);
  container.appendChild(wrapper);
}

/** Hides the loading indicator. */
export function hideLoading(): void {
  clearElementById('loading');
}
