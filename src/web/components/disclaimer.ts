/**
 * Medical disclaimer component.
 */

import { createElement, getElement, setText } from '../utils/dom.js';

/** Renders the medical disclaimer in the footer. */
export function renderDisclaimer(): void {
  const container = getElement('disclaimer');

  const notice = createElement('div', 'disclaimer-notice');
  notice.setAttribute('role', 'note');
  notice.setAttribute('aria-label', 'Medical disclaimer');

  const icon = createElement('span', 'disclaimer-icon');
  icon.setAttribute('aria-hidden', 'true');
  setText(icon, '⚕️');

  const text = createElement('p', 'disclaimer-text');
  setText(
    text,
    'This tool provides general air quality guidance only and is NOT a substitute for professional medical advice. ' +
      'If you or your child experience breathing difficulties, chest pain, or other health concerns, ' +
      'contact a healthcare professional or emergency services immediately.',
  );

  notice.appendChild(icon);
  notice.appendChild(text);
  container.appendChild(notice);
}
