/**
 * Form field helper components with accessible labels, fieldsets, and chips.
 */

import { createElement, setText } from '../utils/dom.js';

import { createButton, setButtonText } from './button.js';
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

interface ChipGroupOptions {
  readonly type: 'checkbox' | 'radio';
  readonly name: string;
  readonly legendText: string;
  readonly options: readonly [string, string][];
  readonly defaultSelected?: string;
}

/** Builds an accessible pill-style checkbox or radio chip group with fieldset/legend. */
function buildChipGroup({
  type,
  name,
  legendText,
  options,
  defaultSelected,
}: ChipGroupOptions): HTMLElement {
  const fieldset = createElement('fieldset', 'form-group', 'fieldset-group');
  const legend = createElement('legend', 'form-legend');
  setText(legend, legendText);
  fieldset.appendChild(legend);

  const container = createElement('div', 'chip-grid');
  for (const [value, display] of options) {
    const isChecked = Boolean(defaultSelected && value === defaultSelected);
    container.appendChild(createChipItem({ type, name, value, display, checked: isChecked }));
  }
  fieldset.appendChild(container);
  return fieldset;
}

/** Builds an accessible pill-style checkbox group with fieldset/legend. */
export function buildCheckboxChipGroup(
  name: string,
  legendText: string,
  options: readonly [string, string][],
  defaultSelected?: string,
): HTMLElement {
  return buildChipGroup({ type: 'checkbox', name, legendText, options, defaultSelected });
}

/** Builds an accessible pill-style radio group with fieldset/legend. */
export function buildRadioChipGroup(
  name: string,
  legendText: string,
  options: readonly [string, string][],
  defaultSelected?: string,
): HTMLElement {
  return buildChipGroup({ type: 'radio', name, legendText, options, defaultSelected });
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

  const toggleBtn = createButton({
    id: 'more-details-toggle',
    text: 'More details',
    variant: 'secondary',
    pill: true,
    className: 'more-details-btn',
  });
  toggleBtn.setAttribute('aria-expanded', 'false');
  toggleBtn.setAttribute('aria-controls', 'more-details-section');

  toggleBtn.addEventListener('click', () => {
    const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
    toggleBtn.setAttribute('aria-expanded', String(!isExpanded));
    content.hidden = isExpanded;
    setButtonText(toggleBtn, isExpanded ? 'More details' : 'Fewer details');
  });

  return { toggleBtn, content };
}
