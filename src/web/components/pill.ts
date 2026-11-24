/**
 * Shared Pill / Chip primitive component.
 *
 * Used for status badges, filter chips, and category tags.
 */

import { createElement, setText } from '../utils/dom.js';

/** Configuration options for the Pill / Chip component. */
export interface PillOptions {
  /** Visible label text inside the pill. */
  readonly text: string;
  /** Visual status or layout variant. */
  readonly variant?:
    | 'default'
    | 'active'
    | 'outline'
    | 'status-good'
    | 'status-moderate'
    | 'status-warning'
    | 'status-alert';
  /** Optional inline SVG icon prepended to the text. */
  readonly icon?: SVGSVGElement;
  /** Whether the pill is an interactive button or a static span. */
  readonly interactive?: boolean;
  /** Selection state when rendered as an interactive button. */
  readonly selected?: boolean;
  /** Accessible label attribute for screen readers. */
  readonly ariaLabel?: string;
  /** Optional extra CSS classes to append. */
  readonly className?: string;
  /** Click event listener callback. */
  readonly onClick?: (event: MouseEvent) => void;
}

/**
 * Creates a typed pill / chip element.
 * @param options - Pill configuration options.
 * @returns Configured HTMLElement (button if interactive, span otherwise).
 */
export function createPill(options: PillOptions): HTMLElement {
  const el = options.interactive
    ? createElement('button', 'pill', 'pill-interactive')
    : createElement('span', 'pill');

  if (options.interactive) {
    if (el instanceof HTMLButtonElement) {
      el.type = 'button';
    }
    el.setAttribute('aria-pressed', options.selected ? 'true' : 'false');
  }

  applyPillVariant(el, options.variant, options.selected);
  applyPillClasses(el, options.className);
  renderPillContent(el, options);

  if (options.ariaLabel) {
    el.setAttribute('aria-label', options.ariaLabel);
  }

  if (options.onClick) {
    el.addEventListener('click', options.onClick);
  }

  return el;
}

/** Applies variant styling classes to the pill. */
function applyPillVariant(
  el: HTMLElement,
  variant: PillOptions['variant'] = 'default',
  selected = false,
): void {
  el.classList.add(`pill-${variant}`);
  if (selected) {
    el.classList.add('pill-selected');
  }
}

/** Applies additional custom class names safely. */
function applyPillClasses(el: HTMLElement, className?: string): void {
  if (className) {
    for (const cls of className.split(/\s+/)) {
      if (cls) {
        el.classList.add(cls);
      }
    }
  }
}

/** Renders the pill's optional icon and text. */
function renderPillContent(el: HTMLElement, options: PillOptions): void {
  if (options.icon) {
    el.appendChild(options.icon);
  }
  const textSpan = createElement('span', 'pill-text');
  setText(textSpan, options.text);
  el.appendChild(textSpan);
}
