/**
 * Medical guidance note component.
 *
 * Renders a clear, permanent guidance note alongside recommendations:
 * "General guidance, not medical advice. Consult your pediatrician or
 * qualified healthcare provider for clinical management of respiratory conditions."
 */

import { createElement, setText } from '../utils/dom.js';

import { createMedicalIcon } from './icons.js';

/**
 * Creates the medical guidance note element.
 * @returns Configured HTMLElement note with semantic note role.
 */
export function createMedicalGuidanceNote(): HTMLElement {
  const note = createElement('div', 'medical-guidance-note');
  note.setAttribute('role', 'note');
  note.setAttribute('aria-label', 'Medical guidance note');

  const iconWrapper = createElement('span', 'medical-note-icon');
  iconWrapper.setAttribute('aria-hidden', 'true');
  iconWrapper.appendChild(createMedicalIcon());

  const text = createElement('p', 'medical-note-text');
  const strong = createElement('strong');
  setText(strong, 'General guidance, not medical advice. ');

  text.appendChild(strong);
  text.appendChild(
    document.createTextNode(
      'Consult your pediatrician or qualified healthcare provider for clinical management of respiratory conditions.',
    ),
  );

  note.appendChild(iconWrapper);
  note.appendChild(text);
  return note;
}
