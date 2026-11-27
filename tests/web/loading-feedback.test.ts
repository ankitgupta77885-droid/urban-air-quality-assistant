/**
 * Tests that progress feedback is visible while advice is generated:
 * the busy submit button and the placement of the loading and error regions.
 *
 * @vitest-environment jsdom
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  initContextForm,
  setContextFormBusy,
  setContextFormLocationSelected,
} from '../../src/web/components/context-form.js';

const HTML_PATH = resolve(import.meta.dirname, '../../index.html');

/** Returns the character offset of an element id attribute in the page markup. */
function offsetOfId(html: string, id: string): number {
  const offset = html.indexOf(`id="${id}"`);
  expect(offset, `#${id} should exist in index.html`).toBeGreaterThan(-1);
  return offset;
}

describe('Busy submit button', () => {
  beforeEach(() => {
    const formContainer = document.createElement('div');
    formContainer.id = 'context-form';
    document.body.replaceChildren(formContainer);
    initContextForm(vi.fn());
    setContextFormLocationSelected(true, 'London, United Kingdom');
  });

  it('shows a disabled, aria-busy button with progress text while busy', () => {
    setContextFormBusy(true);
    const button = document.querySelector<HTMLButtonElement>('#submit-advice-btn');

    expect(button?.disabled).toBe(true);
    expect(button?.getAttribute('aria-busy')).toBe('true');
    expect(button?.classList.contains('is-busy')).toBe(true);
    expect(button?.textContent).toBe('Generating your plan…');
  });

  it('restores the idle label and clears aria-busy when finished', () => {
    setContextFormBusy(true);
    setContextFormBusy(false);
    const button = document.querySelector<HTMLButtonElement>('#submit-advice-btn');

    expect(button?.getAttribute('aria-busy')).toBeNull();
    expect(button?.classList.contains('is-busy')).toBe(false);
    expect(button?.textContent).toBe('Generate Personalized Advice');
  });

  it('does nothing when the form has not been rendered', () => {
    document.body.replaceChildren();
    expect(() => {
      setContextFormBusy(true);
    }).not.toThrow();
  });
});

describe('Loading and error region placement', () => {
  const html = readFileSync(HTML_PATH, 'utf8');

  it('places the loading region right after the planner, above the results', () => {
    expect(offsetOfId(html, 'loading')).toBeGreaterThan(offsetOfId(html, 'planner'));
    expect(offsetOfId(html, 'loading')).toBeLessThan(offsetOfId(html, 'results'));
  });

  it('places the error banner right after the planner, above the results', () => {
    expect(offsetOfId(html, 'error-banner')).toBeGreaterThan(offsetOfId(html, 'planner'));
    expect(offsetOfId(html, 'error-banner')).toBeLessThan(offsetOfId(html, 'results'));
  });
});
