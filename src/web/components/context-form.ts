/** Context form component for capturing household lifestyle data. */
import type { UserContext } from '@shared/types.js';

import { createElement, getElement, setText } from '../utils/dom.js';

import { createButton, setButtonText } from './button.js';
import { parseContextFormData, setupHealthConditionsExclusive } from './context-form-helpers.js';
import {
  CHILD_AGE_OPTIONS,
  COMMUTE_MODE_OPTIONS,
  HEALTH_CONDITION_OPTIONS,
  HOME_TYPE_OPTIONS,
} from './context-form-options.js';
import {
  buildCheckboxChipGroup,
  buildRadioChipGroup,
  buildSelect,
  createMoreDetailsSection,
} from './form-fields.js';

type ContextCallback = (context: UserContext) => void;

const SUBMIT_LABEL = 'Generate Personalized Advice';
const SUBMIT_BUSY_LABEL = 'Generating your plan…';

let formEl: HTMLFormElement | null = null;
let submitButtonEl: HTMLButtonElement | null = null;
let disabledHintEl: HTMLElement | null = null;
let isLocationSelected = false;
let selectedLocationName = '';

/** Initializes the context form component. */
export function initContextForm(onSubmit: ContextCallback): void {
  const container = getElement('context-form');
  container.replaceChildren();

  const form = buildForm();
  formEl = form;
  form.addEventListener('submit', (e: Event) => {
    e.preventDefault();
    if (submitButtonEl?.disabled) {
      return;
    }
    const result = parseContextFormData(form);
    if (!result.success) {
      if (disabledHintEl) {
        setText(disabledHintEl, result.error);
      }
      return;
    }
    onSubmit(result.data);
  });

  container.appendChild(form);
  updateSubmitButtonState(form);
}

/**
 * Switches the submit button between its idle and busy (request in flight) states.
 * @param busy - True while advice is being generated.
 */
export function setContextFormBusy(busy: boolean): void {
  const button = submitButtonEl;
  if (!button) {
    return;
  }
  button.classList.toggle('is-busy', busy);
  if (busy) {
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
    setButtonText(button, SUBMIT_BUSY_LABEL);
    return;
  }
  button.removeAttribute('aria-busy');
  setButtonText(button, SUBMIT_LABEL);
  if (formEl) {
    updateSubmitButtonState(formEl);
  }
}

/** Updates the submission button state based on location selection. */
export function setContextFormLocationSelected(selected: boolean, locationName?: string): void {
  isLocationSelected = selected;
  selectedLocationName = locationName ?? '';
  if (formEl) {
    updateSubmitButtonState(formEl);
  }
}

/** Evaluates form state and updates submit button disabled state and reason. */
function updateSubmitButtonState(form: HTMLFormElement): void {
  if (!submitButtonEl || !disabledHintEl) {
    return;
  }
  const hasAge = Boolean(form.querySelector<HTMLSelectElement>('#childAgeGroup')?.value);
  const canSubmit = isLocationSelected && hasAge;
  submitButtonEl.disabled = !canSubmit;

  if (canSubmit) {
    submitButtonEl.removeAttribute('aria-disabled');
    setText(
      disabledHintEl,
      selectedLocationName ? `Location: ${selectedLocationName}` : 'Ready to generate your plan.',
    );
    return;
  }

  submitButtonEl.setAttribute('aria-disabled', 'true');
  const msg = !isLocationSelected
    ? 'Select a city or use your location above to generate your plan.'
    : 'Select a child age group to generate your plan.';
  setText(disabledHintEl, msg);
}

/** Builds the full form element with 4-column compact grid and collapsible fields. */
function buildForm(): HTMLFormElement {
  const form = createElement('form', 'context-form');
  form.setAttribute('novalidate', '');
  const heading = createElement('h3', 'form-section-title');
  setText(heading, 'Household Context');
  const grid = createElement('div', 'context-form-grid');
  grid.append(
    buildSelect(
      'childAgeGroup',
      "Youngest child's age group",
      CHILD_AGE_OPTIONS,
      'Select age group',
    ),
    buildCheckboxChipGroup(
      'healthConditions',
      'Health conditions in household',
      HEALTH_CONDITION_OPTIONS,
    ),
    buildRadioChipGroup('homeType', 'Type of home', HOME_TYPE_OPTIONS),
    buildRadioChipGroup('commuteMode', 'Primary commute mode', COMMUTE_MODE_OPTIONS),
  );
  const { toggleBtn, content } = createMoreDetailsSection();
  form.append(heading, grid, toggleBtn, content, createSubmitSection());
  setupHealthConditionsExclusive(form);

  const ageSelect = form.querySelector<HTMLSelectElement>('#childAgeGroup');
  ageSelect?.addEventListener('change', () => {
    updateSubmitButtonState(form);
  });
  return form;
}

/** Creates the submit button and disabled hint explanation. */
function createSubmitSection(): HTMLElement {
  const wrapper = createElement('div', 'submit-section');
  submitButtonEl = createButton({
    id: 'submit-advice-btn',
    type: 'submit',
    text: SUBMIT_LABEL,
    variant: 'primary',
    pill: true,
    className: 'submit-btn',
    disabled: true,
  });
  submitButtonEl.setAttribute('aria-disabled', 'true');

  disabledHintEl = createElement('p', 'disabled-hint');
  disabledHintEl.id = 'advice-disabled-hint';
  disabledHintEl.setAttribute('role', 'status');
  setText(disabledHintEl, 'Select a city or use your location above to generate your plan.');

  wrapper.append(submitButtonEl, disabledHintEl);
  return wrapper;
}
