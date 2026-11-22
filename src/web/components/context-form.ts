/**
 * Context form component for capturing household lifestyle data.
 *
 * All form controls have visible labels, fieldsets/legends, and proper ARIA attributes.
 */

import type { UserContext } from '@shared/types.js';

import { createElement, getElement, setText } from '../utils/dom.js';

import {
  CHILD_AGE_OPTIONS, COMMUTE_MODE_OPTIONS,
  HEALTH_CONDITION_OPTIONS, HOME_TYPE_OPTIONS,
} from './context-form-options.js';
import {
  buildCheckboxGroup, buildSelect, createMoreDetailsSection,
} from './form-fields.js';

type ContextCallback = (context: UserContext) => void;

let submitButtonEl: HTMLButtonElement | null = null;
let disabledHintEl: HTMLElement | null = null;

/**
 * Initializes the context form component.
 * @param onSubmit - Callback fired with validated user context.
 */
export function initContextForm(onSubmit: ContextCallback): void {
  const container = getElement('context-form');
  container.replaceChildren();

  const form = buildForm();
  form.addEventListener('submit', (e: Event) => {
    e.preventDefault();
    if (submitButtonEl?.disabled) {
      return;
    }
    const context = extractFormData(form);
    if (context) {
      onSubmit(context);
    }
  });

  container.appendChild(form);
}

/** Retained for backwards compatibility in test runners. */
export function showContextForm(): void {
  const el = document.getElementById('context-section');
  if (el) {
    el.hidden = false;
  }
}

/** Updates the submission button state based on location selection. */
export function setContextFormLocationSelected(selected: boolean, locationName?: string): void {
  if (!submitButtonEl || !disabledHintEl) {
    return;
  }
  submitButtonEl.disabled = !selected;
  if (selected) {
    submitButtonEl.removeAttribute('aria-disabled');
  } else {
    submitButtonEl.setAttribute('aria-disabled', 'true');
  }
  const hint = selected
    ? (locationName ? `Location: ${locationName}` : 'Location selected')
    : 'Select a city or use your location above to generate your plan.';
  setText(disabledHintEl, hint);
}

/** Builds the full form element with visible and collapsible fields. */
function buildForm(): HTMLFormElement {
  const form = createElement('form', 'context-form');
  form.setAttribute('novalidate', '');

  const heading = createElement('h3', 'form-section-title');
  setText(heading, 'Household Context');
  form.appendChild(heading);

  form.appendChild(buildSelect('childAgeGroup', "Youngest child's age group", CHILD_AGE_OPTIONS));
  form.appendChild(buildCheckboxGroup('healthConditions', 'Health conditions in household', HEALTH_CONDITION_OPTIONS));
  form.appendChild(buildSelect('homeType', 'Type of home', HOME_TYPE_OPTIONS));
  form.appendChild(buildSelect('commuteMode', 'Primary commute mode', COMMUTE_MODE_OPTIONS));

  const { toggleBtn, content } = createMoreDetailsSection();
  form.appendChild(toggleBtn);
  form.appendChild(content);
  form.appendChild(createSubmitSection());

  return form;
}

/** Creates the submit button and disabled hint explanation. */
function createSubmitSection(): HTMLElement {
  const wrapper = createElement('div', 'submit-section');

  submitButtonEl = createElement('button', 'btn', 'btn-primary', 'btn-pill', 'submit-btn');
  submitButtonEl.type = 'submit';
  submitButtonEl.id = 'submit-advice-btn';
  submitButtonEl.disabled = true;
  submitButtonEl.setAttribute('aria-disabled', 'true');
  setText(submitButtonEl, 'Generate Personalized Advice');

  disabledHintEl = createElement('p', 'disabled-hint');
  disabledHintEl.id = 'advice-disabled-hint';
  disabledHintEl.setAttribute('role', 'status');
  setText(disabledHintEl, 'Select a city or use your location above to generate your plan.');

  wrapper.appendChild(submitButtonEl);
  wrapper.appendChild(disabledHintEl);
  return wrapper;
}

/** Extracts and validates form data into a UserContext object. */
function extractFormData(form: HTMLFormElement): UserContext | null {
  const data = new FormData(form);
  const child = data.get('childAgeGroup');
  const home = data.get('homeType');
  const commute = data.get('commuteMode');
  if (typeof child !== 'string' || typeof home !== 'string' || typeof commute !== 'string') {
    return null;
  }

  const conditions = data.getAll('healthConditions') as string[];
  if (conditions.length === 0) {
    conditions.push('none');
  }

  const act = data.get('activityLevel');
  const heat = data.get('heatingSource');

  return {
    childAgeGroup: child as UserContext['childAgeGroup'],
    healthConditions: conditions as unknown as UserContext['healthConditions'],
    homeType: home as UserContext['homeType'],
    commuteMode: commute as UserContext['commuteMode'],
    activityLevel: (typeof act === 'string' && act ? act : 'moderate') as UserContext['activityLevel'],
    heatingSource: (typeof heat === 'string' && heat ? heat : 'electric') as UserContext['heatingSource'],
  };
}
