/**
 * Unit tests for shared UI primitives and layout shell.
 *
 * @vitest-environment jsdom
 */

import { describe, expect, it, vi } from 'vitest';

import { createButton } from '../../src/web/components/button.js';
import { createCard } from '../../src/web/components/card.js';
import { renderFooter, updateTrustTimestamp } from '../../src/web/components/footer.js';
import { createAirIcon, createCheckIcon } from '../../src/web/components/icons.js';
import { renderNavbar } from '../../src/web/components/navbar.js';
import { createPill } from '../../src/web/components/pill.js';

describe('Shared Primitive: Button', () => {
  it('should create button with default primary variant and type button', () => {
    const btn = createButton({ text: 'Click me' });
    expect(btn.tagName).toBe('BUTTON');
    expect(btn.type).toBe('button');
    expect(btn.classList.contains('btn')).toBe(true);
    expect(btn.classList.contains('btn-primary')).toBe(true);
    expect(btn.textContent).toBe('Click me');
  });

  it('should support pill shape and custom variants', () => {
    const btn = createButton({ text: 'Pill Action', variant: 'secondary', pill: true });
    expect(btn.classList.contains('btn-secondary')).toBe(true);
    expect(btn.classList.contains('btn-pill')).toBe(true);
  });

  it('should render icon and set aria-label', () => {
    const icon = createAirIcon();
    const btn = createButton({
      text: 'With Icon',
      icon,
      ariaLabel: 'Accessible label',
    });
    expect(btn.getAttribute('aria-label')).toBe('Accessible label');
    expect(btn.querySelector('svg')).not.toBeNull();

    const check = createCheckIcon();
    expect(check.getAttribute('aria-hidden')).toBe('true');
    expect(check.classList.contains('icon-check')).toBe(true);
  });

  it('should invoke click handler', () => {
    const onClick = vi.fn();
    const btn = createButton({ text: 'Trigger', onClick });
    btn.click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe('Shared Primitive: Pill', () => {
  it('should create a non-interactive span pill', () => {
    const pill = createPill({ text: 'Domain Badge' });
    expect(pill.tagName).toBe('SPAN');
    expect(pill.classList.contains('pill')).toBe(true);
    expect(pill.classList.contains('pill-default')).toBe(true);
    expect(pill.textContent).toBe('Domain Badge');
  });

  it('should create an interactive button pill with aria-pressed', () => {
    const onClick = vi.fn();
    const pill = createPill({
      text: 'Filter',
      interactive: true,
      selected: true,
      onClick,
    });
    expect(pill.tagName).toBe('BUTTON');
    expect(pill.getAttribute('aria-pressed')).toBe('true');
    expect(pill.classList.contains('pill-selected')).toBe(true);
    pill.click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should apply status variant classes', () => {
    const pill = createPill({ text: 'Optimal', variant: 'status-good' });
    expect(pill.classList.contains('pill-status-good')).toBe(true);
  });
});

describe('Shared Primitive: Card', () => {
  it('should create surface card with standard padding', () => {
    const card = createCard({ padding: 'lg' });
    expect(card.tagName).toBe('DIV');
    expect(card.classList.contains('card')).toBe(true);
    expect(card.classList.contains('card-surface')).toBe(true);
    expect(card.classList.contains('card-pad-lg')).toBe(true);
  });

  it('should support gradient variant and accessibility roles', () => {
    const card = createCard({
      variant: 'gradient',
      role: 'region',
      ariaLabel: 'Hero card',
    });
    expect(card.classList.contains('card-gradient')).toBe(true);
    expect(card.getAttribute('role')).toBe('region');
    expect(card.getAttribute('aria-label')).toBe('Hero card');
  });
});

describe('Layout Shell: Navbar and Footer', () => {
  it('should render navbar with valid in-page anchor links', () => {
    const header = document.createElement('header');
    renderNavbar(header);

    const nav = header.querySelector('nav[aria-label="Main navigation"]');
    expect(nav).not.toBeNull();

    const subtitle = header.querySelector('.subtitle');
    expect(subtitle).toBeNull();

    const title = header.querySelector('.brand-title');
    expect(title?.textContent).toBe('BreatheWell');

    const links = header.querySelectorAll('a.nav-link');
    expect(links.length).toBe(3);
    const hrefs = Array.from(links).map((l) => l.getAttribute('href'));
    expect(hrefs).toEqual(['#how-it-works', '#planner', '#results']);

    const cta = header.querySelector('a.nav-cta');
    expect(cta?.getAttribute('href')).toBe('#planner');
  });

  it('should render footer with trust strip and update timestamp with real data', () => {
    const footer = document.createElement('footer');
    renderFooter(footer);

    const trustText = footer.querySelector('.trust-text');
    expect(trustText).not.toBeNull();
    expect(trustText?.textContent).toBe('Data from Open-Meteo');

    updateTrustTimestamp('2026-11-22T12:00:00Z');
    expect(trustText?.textContent).toContain('Data from Open-Meteo • Fetched at');
  });
});
