/**
 * Safe DOM helper utilities.
 *
 * All dynamic content is set via textContent — never innerHTML.
 */

/**
 * Safely gets an element by ID, throwing if not found.
 * @param id - Element ID to find.
 * @returns The found HTMLElement.
 */
export function getElement(id: string): HTMLElement {
  const el = document.getElementById(id);
  if (!el) {
    throw new Error(`Element #${id} not found`);
  }
  return el;
}

/**
 * Creates an element with the given tag and optional class names.
 * @param tag - HTML tag name.
 * @param classNames - CSS class names to add.
 * @returns Created HTMLElement.
 */
export function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  ...classNames: string[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  if (classNames.length > 0) {
    el.classList.add(...classNames);
  }
  return el;
}

/**
 * Safely sets text content on an element. Never uses innerHTML.
 * @param el - Target element.
 * @param text - Text content to set.
 */
export function setText(el: HTMLElement, text: string): void {
  el.textContent = text;
}

/**
 * Shows an element by removing the hidden attribute.
 * @param el - Element to show.
 */
export function showElement(el: HTMLElement): void {
  el.removeAttribute('hidden');
}

/**
 * Hides an element by setting the hidden attribute.
 * @param el - Element to hide.
 */
export function hideElement(el: HTMLElement): void {
  el.setAttribute('hidden', '');
}

/**
 * Clears all child nodes from an element.
 * @param el - Element to clear.
 */
export function clearChildren(el: HTMLElement): void {
  while (el.firstChild) {
    el.removeChild(el.firstChild);
  }
}
