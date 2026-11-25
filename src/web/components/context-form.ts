/** Context form component for capturing household lifestyle data. */
import { userContextSchema } from '@shared/schemas.js';
import type { UserContext } from '@shared/types.js';

import { createElement, getElement, setText } from '../utils/dom.js';

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

let submitButtonEl: HTMLButtonElement | null = null;
let disabledHintEl: HTMLElement | null = null;
let isLocationSelected = false;
let selectedLocationName = '';

/** Initializes the context form component. */
export function initContextForm(onSubmit: ContextCallback): void {
  const container = getElement('context-form');
  container.replaceChildren();

  const form = buildForm();
  form.addEventListener('submit', (e: Event) => {
    e.preventDefault();
    if (submitButtonEl?.disabled) {
      return;
    }
    const context = extractAndValidateContext(form);
    if (context) {
      onSubmit(context);
    }
  });

  container.appendChild(form);
  updateSubmitButtonState(form);
}

/** Retained for backwards compatibility in test runners. */
export function showContextForm(): void {
  const el = document.getElementById('context-section');
  if (el) {
    el.hidden = false;
  }
}

const SUBMIT_LABEL = 'Generate Personalized Advice';
const SUBMIT_BUSY_LABEL = 'Generating your plan…';

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
    setText(button, SUBMIT_BUSY_LABEL);
    return;
  }
  button.removeAttribute('aria-busy');
  setText(button, SUBMIT_LABEL);
  const form = document.querySelector<HTMLFormElement>('form.context-form');
  if (form) {
    updateSubmitButtonState(form);
  }
}

/** Updates the submission button state based on location selection. */
export function setContextFormLocationSelected(selected: boolean, locationName?: string): void {
  isLocationSelected = selected;
  selectedLocationName = locationName ?? '';
  const form = document.querySelector<HTMLFormElement>('form.context-form');
  if (form) {
    updateSubmitButtonState(form);
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
  } else {
    submitButtonEl.setAttribute('aria-disabled', 'true');
    const msg = !isLocationSelected
      ? 'Select a city or use your location above to generate your plan.'
      : 'Select a child age group to generate your plan.';
    setText(disabledHintEl, msg);
  }
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

/** Configures exclusive selection behavior for the "None" health condition chip. */
function setupHealthConditionsExclusive(form: HTMLFormElement): void {
  const none = form.querySelector<HTMLInputElement>('#healthConditions-none');
  const others = Array.from(
    form.querySelectorAll<HTMLInputElement>('input[name="healthConditions"]:not([value="none"])'),
  );
  if (!none) {
    return;
  }
  none.addEventListener('change', () => {
    if (none.checked) {
      others.forEach((o) => {
        o.checked = false;
      });
    }
  });
  others.forEach((o) => {
    o.addEventListener('change', () => {
      if (o.checked) {
        none.checked = false;
      }
    });
  });
}

/** Creates the submit button and disabled hint explanation. */
function createSubmitSection(): HTMLElement {
  const wrapper = createElement('div', 'submit-section');
  submitButtonEl = createElement('button', 'btn', 'btn-primary', 'btn-pill', 'submit-btn');
  submitButtonEl.type = 'submit';
  submitButtonEl.id = 'submit-advice-btn';
  submitButtonEl.disabled = true;
  submitButtonEl.setAttribute('aria-disabled', 'true');
  setText(submitButtonEl, SUBMIT_LABEL);

  disabledHintEl = createElement('p', 'disabled-hint');
  disabledHintEl.id = 'advice-disabled-hint';
  disabledHintEl.setAttribute('role', 'status');
  setText(disabledHintEl, 'Select a city or use your location above to generate your plan.');

  wrapper.append(submitButtonEl, disabledHintEl);
  return wrapper;
}

/** Extracts and validates form data with userContextSchema. */
function extractAndValidateContext(form: HTMLFormElement): UserContext | null {
  const d = new FormData(form);
  const parsed = userContextSchema.safeParse({
    childAgeGroup: d.get('childAgeGroup'),
    healthConditions: d.getAll('healthConditions'),
    homeType: d.get('homeType'),
    commuteMode: d.get('commuteMode'),
    activityLevel: d.get('activityLevel') || 'moderate',
    heatingSource: d.get('heatingSource') || 'electric',
  });
  if (!parsed.success) {
    if (disabledHintEl) {
      setText(
        disabledHintEl,
        parsed.error.issues[0]?.message ?? 'Complete required household questions.',
      );
    }
    return null;
  }
  return parsed.data;
}
