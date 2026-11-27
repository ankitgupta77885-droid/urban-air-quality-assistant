/**
 * Shared Button primitive component.
 *
 * Enforces minimum 44px touch targets and token-driven styling.
 */

import { addClasses, createElement, setText } from '../utils/dom.js';

/** Configuration options for the Button primitive component. */
export interface ButtonOptions {
  /** Visible button text. */
  readonly text: string;
  /** Visual button style variant. */
  readonly variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  /** Whether to render with full-rounded pill border radius. */
  readonly pill?: boolean;
  /** HTML button element type attribute. */
  readonly type?: 'button' | 'submit' | 'reset';
  /** Optional inline SVG icon element. */
  readonly icon?: SVGSVGElement;
  /** Position of the icon relative to button text. */
  readonly iconPosition?: 'left' | 'right';
  /** Accessible label attribute for screen readers. */
  readonly ariaLabel?: string;
  /** Optional HTML element ID attribute. */
  readonly id?: string;
  /** Additional CSS class names to append. */
  readonly className?: string;
  /** Whether the button is disabled. */
  readonly disabled?: boolean;
  /** Click event listener callback. */
  readonly onClick?: (event: MouseEvent) => void;
}

/**
 * Creates a typed button element conforming to WCAG touch targets.
 * @param options - Button configuration options.
 * @returns Configured HTMLButtonElement.
 */
export function createButton(options: ButtonOptions): HTMLButtonElement {
  const btn = createElement('button', 'btn');
  btn.type = options.type ?? 'button';
  if (options.id) {
    btn.id = options.id;
  }

  applyButtonVariant(btn, options.variant, options.pill);
  addClasses(btn, options.className);
  applyButtonAccessibility(btn, options.ariaLabel, options.disabled);
  renderButtonContent(btn, options);

  if (options.onClick) {
    btn.addEventListener('click', options.onClick);
  }

  return btn;
}

/**
 * Safely updates the visible label inside a button created by {@link createButton}.
 * @param btn - Target button element.
 * @param text - Replacement label text.
 */
export function setButtonText(btn: HTMLButtonElement, text: string): void {
  const textSpan = btn.querySelector<HTMLElement>('.btn-text');
  setText(textSpan ?? btn, text);
}

/** Applies variant and pill classes to the button. */
function applyButtonVariant(
  btn: HTMLButtonElement,
  variant: ButtonOptions['variant'] = 'primary',
  pill = false,
): void {
  btn.classList.add(`btn-${variant}`);
  if (pill) {
    btn.classList.add('btn-pill');
  }
}

/** Sets accessibility attributes on the button. */
function applyButtonAccessibility(
  btn: HTMLButtonElement,
  ariaLabel?: string,
  disabled?: boolean,
): void {
  if (ariaLabel) {
    btn.setAttribute('aria-label', ariaLabel);
  }
  if (disabled !== undefined) {
    btn.disabled = disabled;
  }
}

/** Renders button text and optional SVG icon. */
function renderButtonContent(btn: HTMLButtonElement, options: ButtonOptions): void {
  if (options.icon && options.iconPosition !== 'right') {
    btn.appendChild(options.icon);
  }

  const textSpan = createElement('span', 'btn-text');
  setText(textSpan, options.text);
  btn.appendChild(textSpan);

  if (options.icon && options.iconPosition === 'right') {
    btn.appendChild(options.icon);
  }
}
