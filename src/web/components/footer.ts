/**
 * Footer layout shell component.
 *
 * Houses the medical guidance note, data trust strip, and copyright notice.
 */

import { createElement, setText } from '../utils/dom.js';

import { renderDisclaimer } from './disclaimer.js';

let trustTextElement: HTMLElement | null = null;

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
  setText(copyright, '© 2026 Urban Air Quality Assistant');
  footerWrapper.appendChild(copyright);

  container.appendChild(footerWrapper);
}

/**
 * Updates the trust strip with the real API fetch timestamp.
 * @param isoTimestamp - ISO timestamp string from the real Open-Meteo response.
 */
export function updateTrustTimestamp(isoTimestamp?: string): void {
  const el = trustTextElement ?? document.getElementById('trust-text');
  if (!el) {
    return;
  }
  if (!isoTimestamp) {
    setText(el, 'Data from Open-Meteo');
    return;
  }
  try {
    const date = new Date(isoTimestamp);
    const timeStr = isNaN(date.getTime())
      ? isoTimestamp
      : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setText(el, `Data from Open-Meteo • Fetched at ${timeStr}`);
  } catch {
    setText(el, `Data from Open-Meteo • ${isoTimestamp}`);
  }
}

/** Creates the trust strip element. */
function createTrustStrip(): HTMLElement {
  const strip = createElement('div', 'trust-strip');
  strip.setAttribute('role', 'note');
  strip.setAttribute('aria-label', 'Data provenance');

  const text = createElement('span', 'trust-text');
  setText(text, 'Data from Open-Meteo');
  trustTextElement = text;

  strip.appendChild(text);
  return strip;
}
