/**
 * Shared Card primitive component.
 *
 * Provides standard radius, hairline border, and ambient shadow.
 */

import { createElement } from '../utils/dom.js';

export interface CardOptions {
  readonly variant?: 'surface' | 'gradient' | 'subtle';
  readonly padding?: 'sm' | 'md' | 'lg' | 'xl';
  readonly className?: string;
  readonly role?: string;
  readonly ariaLabel?: string;
  readonly id?: string;
}

/**
 * Creates a typed Card container element conforming to design tokens.
 * @param options - Card configuration options.
 * @returns Configured card HTMLElement.
 */
export function createCard(options: CardOptions = {}): HTMLElement {
  const card = createElement('div', 'card');

  applyCardVariant(card, options.variant);
  applyCardPadding(card, options.padding);
  applyCardClasses(card, options.className);
  applyCardAccessibility(card, options);

  if (options.id) {
    card.id = options.id;
  }

  return card;
}

/** Applies card background variant. */
function applyCardVariant(
  card: HTMLElement,
  variant: CardOptions['variant'] = 'surface',
): void {
  card.classList.add(`card-${variant}`);
}

/** Applies card padding scale. */
function applyCardPadding(
  card: HTMLElement,
  padding: CardOptions['padding'] = 'lg',
): void {
  card.classList.add(`card-pad-${padding}`);
}

/** Applies custom classes safely. */
function applyCardClasses(card: HTMLElement, className?: string): void {
  if (className) {
    for (const cls of className.split(/\s+/)) {
      if (cls) {
        card.classList.add(cls);
      }
    }
  }
}

/** Sets optional accessibility attributes. */
function applyCardAccessibility(card: HTMLElement, options: CardOptions): void {
  if (options.role) {
    card.setAttribute('role', options.role);
  }
  if (options.ariaLabel) {
    card.setAttribute('aria-label', options.ariaLabel);
  }
}
