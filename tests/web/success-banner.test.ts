/**
 * Tests for the success banner shown after the personalized plan is generated.
 *
 * @vitest-environment jsdom
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { beforeEach, describe, expect, it } from 'vitest';

import { clearSuccess, showSuccess } from '../../src/web/components/success-banner.js';

const HTML_PATH = resolve(import.meta.dirname, '../../index.html');

describe('Success banner', () => {
  beforeEach(() => {
    const banner = document.createElement('div');
    banner.id = 'success-banner';
    document.body.replaceChildren(banner);
  });

  it('renders the message as a polite status with a decorative check icon', () => {
    showSuccess('Your personalized plan is generated.');

    const wrapper = document.querySelector('.success-wrapper');
    expect(wrapper?.getAttribute('role')).toBe('status');
    expect(document.querySelector('.success-text')?.textContent).toBe(
      'Your personalized plan is generated.',
    );
    expect(document.querySelector('.success-icon')?.getAttribute('aria-hidden')).toBe('true');
    expect(document.querySelector('.success-icon svg')).not.toBeNull();
    expect(document.querySelector('.success-link')).toBeNull();
  });

  it('renders an in-page link when one is provided', () => {
    showSuccess('Done.', { label: 'View your plan', href: '#advice-section' });

    const link = document.querySelector('.success-link');
    expect(link?.getAttribute('href')).toBe('#advice-section');
    expect(link?.textContent).toBe('View your plan');
  });

  it('replaces the previous banner instead of stacking messages', () => {
    showSuccess('First.');
    showSuccess('Second.');

    expect(document.querySelectorAll('.success-wrapper')).toHaveLength(1);
    expect(document.querySelector('.success-text')?.textContent).toBe('Second.');
  });

  it('clears the banner and tolerates a missing container', () => {
    showSuccess('Done.');
    clearSuccess();
    expect(document.querySelector('.success-wrapper')).toBeNull();

    document.body.replaceChildren();
    expect(() => {
      clearSuccess();
    }).not.toThrow();
  });

  it('sits between the planner and the results in the page markup', () => {
    const html = readFileSync(HTML_PATH, 'utf8');
    const banner = html.indexOf('id="success-banner"');

    expect(banner).toBeGreaterThan(html.indexOf('id="planner"'));
    expect(banner).toBeLessThan(html.indexOf('id="results"'));
  });
});
