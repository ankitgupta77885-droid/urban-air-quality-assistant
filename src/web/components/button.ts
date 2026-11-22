/**
 * Shared Button primitive component.
 *
 * Enforces minimum 44px touch targets and token-driven styling.
 */

import { createElement, setText } from '../utils/dom.js';

export interface ButtonOptions {
  readonly text: string;
  readonly variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  readonly pill?: boolean;
  readonly type?: 'button' | 'submit' | 'reset';
  readonly icon?: SVGSVGElement;
  readonly iconPosition?: 'left' | 'right';
  readonly ariaLabel?: string;
  readonly className?: string;
  readonly disabled?: boolean;
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
