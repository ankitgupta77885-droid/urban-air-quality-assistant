/**
 * Footer layout shell component.
 *
 * Houses the medical guidance note, data trust strip, and copyright notice.
 */

import { APP_NAME } from '@shared/constants.js';

import { createElement, setText } from '../utils/dom.js';
import { formatLocalTime } from '../utils/formatters.js';

import { renderDisclaimer } from './disclaimer.js';

const state: { trustTextElement: HTMLElement | null } = {
  trustTextElement: null,
};

/**
 * Renders the application footer shell.
 * @param container - Target footer container element.
 */
export function renderFooter(container: HTMLElement): void {
  container.replaceChildren();

  const footerWrapper = createElement('div', 'container', 'footer-container');

  const disclaimerDiv = createElement('div');
  disclaimerDiv.id = 'disclaimer';
  renderDisclaimer(disclaimerDiv);
  footerWrapper.appendChild(disclaimerDiv);

  const trustStrip = createTrustStrip();
  footerWrapper.appendChild(trustStrip);

  const copyright = createElement('p', 'copyright');
  setText(copyright, `© 2026 ${APP_NAME}`);
  footerWrapper.appendChild(copyright);

  container.appendChild(footerWrapper);
}

/**
 * Updates the trust strip with the real API fetch timestamp.
 * @param isoTimestamp - ISO timestamp string from the real Open-Meteo response.
 */
export function updateTrustTimestamp(isoTimestamp?: string): void {
  const el = state.trustTextElement ?? document.getElementById('trust-text');
  if (!el) {
    return;
  }
  if (!isoTimestamp) {
    setText(el, 'Data from Open-Meteo');
    return;
  }
  setText(el, `Data from Open-Meteo • Fetched at ${formatLocalTime(isoTimestamp)}`);
}

/** Creates the trust strip element. */
function createTrustStrip(): HTMLElement {
  const strip = createElement('div', 'trust-strip');
  strip.setAttribute('role', 'note');
  strip.setAttribute('aria-label', 'Data provenance');

  const text = createElement('span', 'trust-text');
  text.id = 'trust-text';
  setText(text, 'Data from Open-Meteo');
  state.trustTextElement = text;

  strip.appendChild(text);
  return strip;
}
