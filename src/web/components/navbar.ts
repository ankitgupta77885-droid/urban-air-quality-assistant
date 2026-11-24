/**
 * Slim Top Navigation component.
 *
 * Provides brand identity, in-page navigation anchors, and a primary CTA.
 */

import { APP_NAME } from '@shared/constants.js';

import { createElement, setText } from '../utils/dom.js';

import { createLogo } from './logo.js';

interface NavLinkItem {
  readonly label: string;
  readonly href: string;
}

const NAV_LINKS: readonly NavLinkItem[] = [
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Air Quality', href: '#planner' },
  { label: 'Recommendations', href: '#results' },
] as const;

/**
 * Renders the top navigation shell into the header container.
 * @param container - Target container element.
 */
export function renderNavbar(container: HTMLElement): void {
  container.replaceChildren();

  const navWrapper = createElement('div', 'container', 'nav-container');
  navWrapper.appendChild(createBrandElement());
  navWrapper.appendChild(createNavLinksElement());
  navWrapper.appendChild(createCtaElement());

  container.appendChild(navWrapper);
}

/** Creates the brand link with logo and product title. */
function createBrandElement(): HTMLElement {
  const brand = createElement('a', 'brand');
  brand.setAttribute('href', '#top');
  brand.setAttribute('aria-label', APP_NAME);
  brand.appendChild(createLogo());

  const title = createElement('span', 'brand-title');
  setText(title, APP_NAME);
  brand.appendChild(title);

  return brand;
}

/** Creates the in-page navigation link list. */
function createNavLinksElement(): HTMLElement {
  const nav = createElement('nav', 'nav-links');
  nav.setAttribute('aria-label', 'Main navigation');

  const list = createElement('ul', 'nav-list');
  for (const item of NAV_LINKS) {
    const li = createElement('li', 'nav-item');
    const a = createElement('a', 'nav-link');
    a.href = item.href;
    setText(a, item.label);

    a.addEventListener('click', (e) => {
      if (item.href === '#planner') {
        const aqiSection = document.getElementById('aqi-section');
        if (aqiSection && !aqiSection.hidden) {
          e.preventDefault();
          aqiSection.scrollIntoView({ behavior: 'smooth' });
          history.pushState(null, '', '#aqi-section');
        }
      } else if (item.href === '#results') {
        const adviceSection = document.getElementById('advice-section');
        if (adviceSection && !adviceSection.hidden) {
          e.preventDefault();
          adviceSection.scrollIntoView({ behavior: 'smooth' });
          history.pushState(null, '', '#advice-section');
        }
      }
    });

    li.appendChild(a);
    list.appendChild(li);
  }

  nav.appendChild(list);
  return nav;
}

/** Creates the primary CTA button linking to the planner and focusing search. */
function createCtaElement(): HTMLElement {
  const a = createElement('a', 'btn', 'btn-primary', 'btn-pill', 'nav-cta');
  a.href = '#planner';
  setText(a, 'Check Your Area');
  a.addEventListener('click', () => {
    const searchInput = document.getElementById('city-search') as HTMLInputElement | null;
    if (searchInput) {
      searchInput.focus();
    }
  });
  return a;
}
