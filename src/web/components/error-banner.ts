/**
 * Error banner component for displaying errors to the user.
 */

import { clearChildren, createElement, getElement, setText } from '../utils/dom.js';

/**
 * Shows an error message in the error banner.
 * @param message - Error message to display.
 */
export function showError(message: string): void {
  const container = getElement('error-banner');
  clearChildren(container);

  const wrapper = createElement('div', 'error-wrapper');

  const icon = createElement('span', 'error-icon');
  icon.setAttribute('aria-hidden', 'true');
  setText(icon, '⚠️');

  const text = createElement('p', 'error-text');
  setText(text, message);

  const closeBtn = createElement('button', 'error-close');
  closeBtn.type = 'button';
  closeBtn.setAttribute('aria-label', 'Dismiss error');
  setText(closeBtn, '✕');
  closeBtn.addEventListener('click', () => {
    clearChildren(container);
  });

  wrapper.appendChild(icon);
  wrapper.appendChild(text);
  wrapper.appendChild(closeBtn);
  container.appendChild(wrapper);
}

/** Clears any displayed error. */
export function clearError(): void {
  clearChildren(getElement('error-banner'));
}
