/**
 * Loading indicator component.
 */

import { createElement, getElement, clearChildren, setText } from '../utils/dom.js';

/**
 * Shows the loading indicator with a message.
 * @param message - Loading message to display.
 */
export function showLoading(message: string): void {
  const container = getElement('loading');
  clearChildren(container);

  const wrapper = createElement('div', 'loading-wrapper');
  wrapper.setAttribute('role', 'status');

  const spinner = createElement('div', 'loading-spinner');
  spinner.setAttribute('aria-hidden', 'true');

  const text = createElement('p', 'loading-text');
  setText(text, message);

  wrapper.appendChild(spinner);
  wrapper.appendChild(text);
  container.appendChild(wrapper);
}

/** Hides the loading indicator. */
export function hideLoading(): void {
  clearChildren(getElement('loading'));
}
