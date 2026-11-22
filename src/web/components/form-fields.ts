/**
 * Form field helper components with accessible labels and fieldsets.
 */

import { createElement, setText } from '../utils/dom.js';

import { ACTIVITY_LEVEL_OPTIONS, HEATING_SOURCE_OPTIONS } from './context-form-options.js';

/**
 * Builds a labeled select dropdown element.
 * @param name - Form field name and ID.
 * @param labelText - Accessible label text.
 * @param options - Array of [value, display] pairs.
 * @returns Form group element containing label and select.
 */
export function buildSelect(
  name: string,
  labelText: string,
  options: readonly [string, string][],
): HTMLElement {
  const group = createElement('div', 'form-group');

  const label = createElement('label');
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
 * Builds a single checkbox item with 44px minimum hit area.
 * @param name - Checkbox group name.
 * @param value - Checkbox value.
 * @param display - Visible label text.
 */
export function createCheckboxItem(name: string, value: string, display: string): HTMLElement {
  const wrapper = createElement('div', 'checkbox-wrapper');

  const input = createElement('input', 'checkbox-input');
  input.type = 'checkbox';
  input.id = `${name}-${value}`;
  input.name = name;
  input.value = value;
  if (value === 'none') {
    input.checked = true;
  }

  const label = createElement('label', 'checkbox-label');
  label.setAttribute('for', `${name}-${value}`);
  setText(label, display);

  wrapper.appendChild(input);
  wrapper.appendChild(label);
  return wrapper;
}

/**
 * Builds an accessible checkbox group wrapped in a fieldset and legend.
 * @param name - Form field name.
 * @param legendText - Accessible legend text.
 * @param options - Array of [value, display] pairs.
 * @returns Fieldset element containing labeled checkboxes.
 */
export function buildCheckboxGroup(
  name: string,
  legendText: string,
  options: readonly [string, string][],
): HTMLElement {
  const fieldset = createElement('fieldset', 'form-group', 'fieldset-group');
  const legend = createElement('legend', 'form-legend');
  setText(legend, legendText);
  fieldset.appendChild(legend);

  const optionsContainer = createElement('div', 'checkbox-options');
  for (const [value, display] of options) {
    optionsContainer.appendChild(createCheckboxItem(name, value, display));
  }
  fieldset.appendChild(optionsContainer);

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
