/**
 * Hero section component.
 *
 * Displays the main headline, plain-language value proposition,
 * and navigation actions. Shows zero mock stats or unverified numbers.
 */

import { createElement, setText } from '../utils/dom.js';

/**
 * Renders the hero section into the target container.
 * @param container - Target container element.
 */
export function renderHero(container: HTMLElement): void {
  container.replaceChildren();

  const heroWrapper = createElement('div', 'hero-content');
  const textCol = createElement('div', 'hero-text-col');

  const h1 = createElement('h1', 'hero-headline');
  setText(h1, 'Breathe easier through winter smog');

  const lead = createElement('p', 'hero-lead');
  setText(
    lead,
    'Personalized low-emission daily routines, indoor air tips, and sustainable alternatives ' +
      'tailored to your family. Understand the real impact of every household choice ' +
      'without the panic.',
  );

  const actions = createHeroActions();

  textCol.appendChild(h1);
  textCol.appendChild(lead);
  textCol.appendChild(actions);
  heroWrapper.appendChild(textCol);

  container.appendChild(heroWrapper);
}

/** Creates the two hero action pill buttons. */
function createHeroActions(): HTMLElement {
  const actions = createElement('div', 'hero-actions');

  const primaryBtn = createElement('a', 'btn', 'btn-primary', 'btn-pill', 'hero-btn');
  primaryBtn.href = '#planner';
  setText(primaryBtn, "Get today's plan");
  primaryBtn.addEventListener('click', () => {
    focusPlannerInput();
  });

  const secondaryBtn = createElement('a', 'btn', 'btn-outline', 'btn-pill', 'hero-btn');
  secondaryBtn.href = '#how-it-works';
  setText(secondaryBtn, 'See how it works');

  actions.appendChild(primaryBtn);
  actions.appendChild(secondaryBtn);
  return actions;
}

/** Scrolls to the planner card and focuses the search input. */
function focusPlannerInput(): void {
  const searchInput = document.getElementById('city-search') as HTMLInputElement | null;
  if (searchInput) {
    searchInput.focus();
  }
}
