/**
 * Slim Top Navigation component.
 *
 * Provides brand identity, in-page navigation anchors, and a primary CTA.
 */

import { APP_NAME } from '@shared/constants.js';

import { createElement, focusInput, setText } from '../utils/dom.js';
import { scrollToElementById } from '../utils/scroll.js';

import { createLogo } from './logo.js';

interface NavLinkItem {
  readonly label: string;
  readonly href: string;
  readonly activeSectionId?: string;
}

const NAV_LINKS: readonly NavLinkItem[] = [
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Air Quality', href: '#planner', activeSectionId: 'aqi-section' },
  { label: 'Recommendations', href: '#results', activeSectionId: 'advice-section' },
] as const;

/**
 * Renders the top navigation shell into the header container.
 * @param container - Target container element.
 */
export function renderNavbar(container: HTMLElement): void {
  container.replaceChildren();

  const navWrapper = createElement('div', 'container', 'nav-container');
  navWrapper.append(createBrandElement(), createNavLinksElement(), createCtaElement());

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
    list.appendChild(createNavLink(item));
  }

  nav.appendChild(list);
  return nav;
}

/** Creates a single nav item, redirecting to dynamic result sections once populated. */
function createNavLink(item: NavLinkItem): HTMLElement {
  const li = createElement('li', 'nav-item');
  const link = createElement('a', 'nav-link');
  link.href = item.href;
  setText(link, item.label);

  if (item.activeSectionId) {
    const targetId = item.activeSectionId;
    link.addEventListener('click', (e) => {
      const target = document.getElementById(targetId);
      if (target && !target.hidden) {
        e.preventDefault();
        scrollToElementById(targetId);
        history.pushState(null, '', `#${targetId}`);
      }
    });
  }

  li.appendChild(link);
  return li;
}

/** Creates the primary CTA button linking to the planner and focusing search. */
function createCtaElement(): HTMLElement {
  const link = createElement('a', 'btn', 'btn-primary', 'btn-pill', 'nav-cta');
  link.href = '#planner';
  setText(link, 'Check Your Area');
  link.addEventListener('click', () => {
    focusInput('city-search');
  });
  return link;
}
