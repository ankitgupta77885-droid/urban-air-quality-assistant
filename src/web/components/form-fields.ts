/**
 * Form field helper components with accessible labels, fieldsets, and chips.
 */

import { createElement, setText } from '../utils/dom.js';

import { ACTIVITY_LEVEL_OPTIONS, HEATING_SOURCE_OPTIONS } from './context-form-options.js';
import { createCheckIcon } from './icons.js';

/**
 * Builds a labeled select dropdown element.
 * @param name - Form field name and ID.
 * @param labelText - Accessible label text.
 * @param options - Array of [value, display] pairs.
 */
export function buildSelect(
  name: string,
  labelText: string,
  options: readonly [string, string][],
): HTMLElement {
  const group = createElement('div', 'form-group');

  const label = createElement('label', 'form-label');
  label.setAttribute('for', name);
  setText(label, labelText);

  const select = createElement('select', 'form-select');
  select.id = name;
  select.name = name;
  select.required = true;

  for (const [value, display] of options) {
    const opt = createElement('option');
    opt.value = value;
    setText(opt, display);
    select.appendChild(opt);
  }

  group.appendChild(label);
  group.appendChild(select);
  return group;
}

/**
 * Builds a single pill-style chip input item with 44px hit area.
 */
export function createChipItem(
  type: 'checkbox' | 'radio',
  name: string,
  value: string,
  display: string,
  checked: boolean,
): HTMLElement {
  const wrapper = createElement('div', 'chip-wrapper');

  const input = createElement('input', 'chip-input');
  input.type = type;
  input.id = `${name}-${value}`;
  input.name = name;
  input.value = value;
  input.checked = checked;

  const label = createElement('label', 'chip-label');
  label.setAttribute('for', `${name}-${value}`);

  const checkIcon = createCheckIcon();
  checkIcon.classList.add('chip-check');

  const textSpan = createElement('span', 'chip-text');
  setText(textSpan, display);

  label.appendChild(checkIcon);
  label.appendChild(textSpan);

  wrapper.appendChild(input);
  wrapper.appendChild(label);
  return wrapper;
}

/**
 * Builds an accessible pill-style checkbox group with fieldset/legend.
 */
export function buildCheckboxChipGroup(
  name: string,
  legendText: string,
  options: readonly [string, string][],
  defaultSelected = 'none',
): HTMLElement {
  const fieldset = createElement('fieldset', 'form-group', 'fieldset-group');
  const legend = createElement('legend', 'form-legend');
  setText(legend, legendText);
  fieldset.appendChild(legend);

  const container = createElement('div', 'chip-grid');
  for (const [value, display] of options) {
    const isChecked = value === defaultSelected;
    container.appendChild(createChipItem('checkbox', name, value, display, isChecked));
  }
  fieldset.appendChild(container);
  return fieldset;
}

/**
 * Builds an accessible pill-style radio group with fieldset/legend.
 */
export function buildRadioChipGroup(
  name: string,
  legendText: string,
  options: readonly [string, string][],
  defaultSelected: string,
): HTMLElement {
  const fieldset = createElement('fieldset', 'form-group', 'fieldset-group');
  const legend = createElement('legend', 'form-legend');
  setText(legend, legendText);
  fieldset.appendChild(legend);

  const container = createElement('div', 'chip-grid');
  for (const [value, display] of options) {
    const isChecked = value === defaultSelected;
    container.appendChild(createChipItem('radio', name, value, display, isChecked));
  }
  fieldset.appendChild(container);
  return fieldset;
}

/** Creates the collapsible optional fields section with toggle button. */
export function createMoreDetailsSection(): { toggleBtn: HTMLButtonElement; content: HTMLElement } {
  const content = createElement('div', 'more-details-section');
  content.id = 'more-details-section';
  content.hidden = true;
  content.appendChild(buildSelect('activityLevel', 'Family outdoor activity level', ACTIVITY_LEVEL_OPTIONS));
  content.appendChild(buildSelect('heatingSource', 'Primary heating source', HEATING_SOURCE_OPTIONS));

  const toggleBtn = createElement('button', 'btn', 'btn-secondary', 'btn-pill', 'more-details-btn');
  toggleBtn.type = 'button';
  toggleBtn.id = 'more-details-toggle';
  toggleBtn.setAttribute('aria-expanded', 'false');
  toggleBtn.setAttribute('aria-controls', 'more-details-section');
  setText(toggleBtn, 'More details');

  toggleBtn.addEventListener('click', () => {
    const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
    toggleBtn.setAttribute('aria-expanded', String(!isExpanded));
    content.hidden = isExpanded;
    setText(toggleBtn, isExpanded ? 'More details' : 'Fewer details');
  });

  return { toggleBtn, content };
}
