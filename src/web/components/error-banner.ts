/**
 * Error banner component for displaying accessible errors.
 *
 * Renders an inline SVG alert icon (no emojis), high-contrast message,
 * and an optional "Retry" action button.
 */

import { clearChildren, createElement, getElement, setText } from '../utils/dom.js';

import { createButton } from './button.js';
import { createAqiStatusIcon, createCloseIcon } from './icons.js';

/**
 * Shows an accessible error banner with alert icon, message, and optional Retry button.
 * @param message - User-facing error message.
 * @param onRetry - Optional callback when user clicks "Retry".
 */
export function showError(message: string, onRetry?: () => void): void {
  const container = getElement('error-banner');
  clearChildren(container);

  const wrapper = createElement('div', 'error-wrapper');
  wrapper.setAttribute('role', 'alert');

  const icon = createElement('span', 'error-icon');
  icon.setAttribute('aria-hidden', 'true');
  icon.appendChild(createAqiStatusIcon('alert'));

  const text = createElement('p', 'error-text');
  setText(text, message);

  wrapper.append(icon, text);

  if (onRetry) {
    const retryBtn = createButton({
      text: 'Retry',
      variant: 'outline',
      className: 'btn-sm error-retry-btn',
      onClick: () => {
        clearError();
        onRetry();
      },
    });
    wrapper.appendChild(retryBtn);
  }

  const closeBtn = createElement('button', 'error-close');
  closeBtn.type = 'button';
  closeBtn.setAttribute('aria-label', 'Dismiss error');
  closeBtn.appendChild(createCloseIcon());
  closeBtn.addEventListener('click', clearError);

  wrapper.appendChild(closeBtn);
  container.appendChild(wrapper);
}

/** Clears any displayed error. */
export function clearError(): void {
  const container = document.getElementById('error-banner');
  if (container) {
    clearChildren(container);
  }
}
