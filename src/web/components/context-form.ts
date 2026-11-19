/**
 * Context form component for capturing household lifestyle data.
 *
 * All form controls have visible labels and proper ARIA attributes.
 */

import type { UserContext } from '@shared/types.js';

import { createElement, getElement, setText, showElement } from '../utils/dom.js';

import {
  ACTIVITY_LEVEL_OPTIONS,
  CHILD_AGE_OPTIONS,
  COMMUTE_MODE_OPTIONS,
  HEALTH_CONDITION_OPTIONS,
  HEATING_SOURCE_OPTIONS,
  HOME_TYPE_OPTIONS,
} from './context-form-options.js';

/** Callback when the form is submitted with valid context. */
type ContextCallback = (context: UserContext) => void;

/**
 * Initializes the context form component.
 * @param onSubmit - Callback fired with validated user context.
 */
export function initContextForm(onSubmit: ContextCallback): void {
  const container = getElement('context-form');
  const form = buildForm();

  form.addEventListener('submit', (e: Event) => {
    e.preventDefault();
    const context = extractFormData(form);
    if (context) {
      onSubmit(context);
    }
  });

  container.appendChild(form);
}

/**
 * Builds the form element with all fields and submit button.
 * @returns Fully constructed HTMLFormElement.
 */
function buildForm(): HTMLFormElement {
  const form = createElement('form', 'context-form');
  form.setAttribute('novalidate', '');

  const heading = createElement('h2');
  setText(heading, 'Tell us about your household');
  form.appendChild(heading);

  form.appendChild(buildSelect('childAgeGroup', "Youngest child's age group", CHILD_AGE_OPTIONS));
  form.appendChild(
    buildCheckboxGroup(
      'healthConditions',
      'Health conditions in household',
      HEALTH_CONDITION_OPTIONS,
    ),
  );
  form.appendChild(buildSelect('homeType', 'Type of home', HOME_TYPE_OPTIONS));
  form.appendChild(buildSelect('commuteMode', 'Primary commute mode', COMMUTE_MODE_OPTIONS));
  form.appendChild(
    buildSelect('activityLevel', 'Family outdoor activity level', ACTIVITY_LEVEL_OPTIONS),
  );
  form.appendChild(buildSelect('heatingSource', 'Primary heating source', HEATING_SOURCE_OPTIONS));

  const submitBtn = createElement('button', 'submit-btn');
  submitBtn.type = 'submit';
  setText(submitBtn, 'Get Personalized Advice');
  form.appendChild(submitBtn);

  return form;
}

/** Shows the context form section. */
export function showContextForm(): void {
  showElement(getElement('context-section'));
}

/**
 * Builds a labeled select dropdown.
 * @param name - Form field name.
 * @param labelText - Visible label text.
 * @param options - Array of [value, display] pairs.
 * @returns Element containing label + select.
 */
function buildSelect(
  name: string,
  labelText: string,
  options: readonly [string, string][],
): HTMLElement {
  const group = createElement('div', 'form-group');

  const label = createElement('label');
  label.setAttribute('for', name);
  setText(label, labelText);

  const select = createElement('select');
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
 * Builds a single checkbox item with its label.
 * @param name - Group name.
 * @param value - Checkbox value.
 * @param display - Visible label text.
 */
function createCheckboxItem(name: string, value: string, display: string): HTMLElement {
  const wrapper = createElement('div', 'checkbox-wrapper');

  const input = createElement('input');
  input.type = 'checkbox';
  input.id = `${name}-${value}`;
  input.name = name;
  input.value = value;
  if (value === 'none') {
    input.checked = true;
  }

  const label = createElement('label');
  label.setAttribute('for', `${name}-${value}`);
  setText(label, display);

  wrapper.appendChild(input);
  wrapper.appendChild(label);
  return wrapper;
}

/**
 * Builds a labeled checkbox group.
 * @param name - Form field name.
 * @param legendText - Legend text for the fieldset.
 * @param options - Array of [value, display] pairs.
 * @returns Fieldset element with checkboxes.
 */
function buildCheckboxGroup(
  name: string,
  legendText: string,
  options: readonly [string, string][],
): HTMLElement {
  const fieldset = createElement('fieldset', 'form-group');
  const legend = createElement('legend');
  setText(legend, legendText);
  fieldset.appendChild(legend);

  for (const [value, display] of options) {
    fieldset.appendChild(createCheckboxItem(name, value, display));
  }

  return fieldset;
}

/**
 * Extracts and validates form data into a UserContext object.
 * @param form - The form element.
 * @returns UserContext or null if invalid.
 */
function extractFormData(form: HTMLFormElement): UserContext | null {
  const data = new FormData(form);
  const childAgeGroup = data.get('childAgeGroup') as string;
  const healthConditions = data.getAll('healthConditions') as string[];
  const homeType = data.get('homeType') as string;
  const commuteMode = data.get('commuteMode') as string;
  const activityLevel = data.get('activityLevel') as string;
  const heatingSource = data.get('heatingSource') as string;

  if (healthConditions.length === 0) {
    healthConditions.push('none');
  }

  return {
    childAgeGroup: childAgeGroup as UserContext['childAgeGroup'],
    healthConditions: healthConditions as unknown as UserContext['healthConditions'],
    homeType: homeType as UserContext['homeType'],
    commuteMode: commuteMode as UserContext['commuteMode'],
    activityLevel: activityLevel as UserContext['activityLevel'],
    heatingSource: heatingSource as UserContext['heatingSource'],
  };
}
