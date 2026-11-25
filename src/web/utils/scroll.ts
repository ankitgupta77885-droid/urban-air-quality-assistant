/**
 * Scrolling helpers that respect the visitor's motion preferences.
 */

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Scrolls the element with the given id to the top of the viewport.
 * Uses instant scrolling when the visitor prefers reduced motion.
 * @param id - Element id to scroll to; does nothing if it does not exist.
 */
export function scrollToElementById(id: string): void {
  const element = document.getElementById(id);
  if (!element) {
    return;
  }
  const prefersReducedMotion = window.matchMedia(REDUCED_MOTION_QUERY).matches;
  element.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
}
