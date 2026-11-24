/**
 * Form field helper components with accessible labels, fieldsets, and chips.
 */

import { createElement, setText } from '../utils/dom.js';

import { ACTIVITY_LEVEL_OPTIONS, HEATING_SOURCE_OPTIONS } from './context-form-options.js';
import { createCheckIcon } from './icons.js';

/**
 * Builds a labeled select dropdown element with an optional placeholder.
 */
export function buildSelect(
  name: string,
  labelText: string,
  options: readonly [string, string][],
  placeholder?: string,
): HTMLElement {
  const group = createElement('div', 'form-group');

  const label = createElement('label', 'form-label');
  label.setAttribute('for', name);
  setText(label, labelText);

  const select = createElement('select', 'form-select');
  select.id = name;
  select.name = name;
  select.required = true;

  if (placeholder) {
    const defaultOpt = createElement('option');
    defaultOpt.value = '';
    defaultOpt.disabled = true;
    defaultOpt.selected = true;
    setText(defaultOpt, placeholder);
    select.appendChild(defaultOpt);
  }

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

/** Options for creating a single pill-style chip input item. */
export interface ChipItemOptions {
  /** Form input control type. */
  readonly type: 'checkbox' | 'radio';
  /** Shared form field name. */
  readonly name: string;
  /** Value submitted for this option. */
  readonly value: string;
  /** Visual text displayed inside the chip label. */
  readonly display: string;
  /** Whether this chip is initially selected. */
  readonly checked?: boolean;
}

/**
 * Builds a single pill-style chip input item with 44px hit area.
 * @param options - Configuration options for the chip input.
 * @returns Configured wrapper element containing the input and label.
 */
export function createChipItem(options: ChipItemOptions): HTMLElement {
  const { type, name, value, display, checked = false } = options;
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
  defaultSelected?: string,
): HTMLElement {
  const fieldset = createElement('fieldset', 'form-group', 'fieldset-group');
  const legend = createElement('legend', 'form-legend');
  setText(legend, legendText);
  fieldset.appendChild(legend);

  const container = createElement('div', 'chip-grid');
  for (const [value, display] of options) {
    const isChecked = Boolean(defaultSelected && value === defaultSelected);
    container.appendChild(
      createChipItem({ type: 'checkbox', name, value, display, checked: isChecked }),
    );
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
  defaultSelected?: string,
): HTMLElement {
  const fieldset = createElement('fieldset', 'form-group', 'fieldset-group');
  const legend = createElement('legend', 'form-legend');
  setText(legend, legendText);
  fieldset.appendChild(legend);

  const container = createElement('div', 'chip-grid');
  for (const [value, display] of options) {
    const isChecked = Boolean(defaultSelected && value === defaultSelected);
    container.appendChild(
      createChipItem({ type: 'radio', name, value, display, checked: isChecked }),
    );
  }
  fieldset.appendChild(container);
  return fieldset;
}

/** Creates the collapsible optional fields section with toggle button. */
export function createMoreDetailsSection(): { toggleBtn: HTMLButtonElement; content: HTMLElement } {
  const content = createElement('div', 'more-details-section');
  content.id = 'more-details-section';
  content.hidden = true;
  content.appendChild(
    buildSelect('activityLevel', 'Family outdoor activity level', ACTIVITY_LEVEL_OPTIONS),
  );
  content.appendChild(
    buildSelect('heatingSource', 'Primary heating source', HEATING_SOURCE_OPTIONS),
  );

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
