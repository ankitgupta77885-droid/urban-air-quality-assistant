/**
 * Helper utilities for household context form state and validation.
 */

import { userContextSchema } from '@shared/schemas.js';
import type { UserContext } from '@shared/types.js';

/** Result of parsing and validating the context form. */
export type ContextFormParseResult =
  | { readonly success: true; readonly data: UserContext }
  | { readonly success: false; readonly error: string };

/**
 * Configures mutually exclusive selection between "None" and other health condition checkboxes.
 * @param form - Context form element containing health condition checkboxes.
 */
export function setupHealthConditionsExclusive(form: HTMLFormElement): void {
  const none = form.querySelector<HTMLInputElement>('#healthConditions-none');
  const others = Array.from(
    form.querySelectorAll<HTMLInputElement>('input[name="healthConditions"]:not([value="none"])'),
  );
  if (!none) {
    return;
  }
  none.addEventListener('change', () => {
    if (none.checked) {
      others.forEach((other) => {
        other.checked = false;
      });
    }
  });
  others.forEach((other) => {
    other.addEventListener('change', () => {
      if (other.checked) {
        none.checked = false;
      }
    });
  });
}

/**
 * Extracts and validates household context fields using {@link userContextSchema}.
 * @param form - Submitted context form element.
 * @returns Validated context payload or a human-readable validation error message.
 */
export function parseContextFormData(form: HTMLFormElement): ContextFormParseResult {
  const formData = new FormData(form);
  const parsed = userContextSchema.safeParse({
    childAgeGroup: formData.get('childAgeGroup'),
    healthConditions: formData.getAll('healthConditions'),
    homeType: formData.get('homeType'),
    commuteMode: formData.get('commuteMode'),
    activityLevel: formData.get('activityLevel') || 'moderate',
    heatingSource: formData.get('heatingSource') || 'electric',
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Complete required household questions.',
    };
  }

  return { success: true, data: parsed.data };
}
