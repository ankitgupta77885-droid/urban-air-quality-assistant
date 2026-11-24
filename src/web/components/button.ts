/**
 * Shared Button primitive component.
 *
 * Enforces minimum 44px touch targets and token-driven styling.
 */

import { createElement, setText } from '../utils/dom.js';

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

  applyButtonVariant(btn, options.variant, options.pill);
  applyButtonClasses(btn, options.className);
  applyButtonAccessibility(btn, options.ariaLabel, options.disabled);
  renderButtonContent(btn, options);

  if (options.onClick) {
    btn.addEventListener('click', options.onClick);
  }

  return btn;
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

/** Applies custom class names safely. */
function applyButtonClasses(btn: HTMLButtonElement, className?: string): void {
  if (className) {
    for (const cls of className.split(/\s+/)) {
      if (cls) {
        btn.classList.add(cls);
      }
    }
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
