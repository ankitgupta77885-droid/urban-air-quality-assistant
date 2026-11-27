/**
 * Shared Card primitive component.
 *
 * Provides standard radius, hairline border, and ambient shadow.
 */

import { addClasses, createElement } from '../utils/dom.js';

/** Configuration options for the Card primitive container. */
export interface CardOptions {
  /** Visual surface style variant. */
  readonly variant?: 'surface' | 'gradient' | 'subtle';
  /** Padding scale applied to the card inner area. */
  readonly padding?: 'sm' | 'md' | 'lg' | 'xl';
  /** Optional additional CSS classes to append. */
  readonly className?: string;
  /** ARIA role for accessibility semantics. */
  readonly role?: string;
  /** Accessible label describing card contents when role is set. */
  readonly ariaLabel?: string;
  /** HTML element ID attribute. */
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
  addClasses(card, options.className);
  applyCardAccessibility(card, options);

  if (options.id) {
    card.id = options.id;
  }

  return card;
}

/** Applies card background variant. */
function applyCardVariant(card: HTMLElement, variant: CardOptions['variant'] = 'surface'): void {
  card.classList.add(`card-${variant}`);
}

/** Applies card padding scale. */
function applyCardPadding(card: HTMLElement, padding: CardOptions['padding'] = 'lg'): void {
  card.classList.add(`card-pad-${padding}`);
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
