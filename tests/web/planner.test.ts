/**
 * Tests for Step 3: Hero, Unified Planner card, More Details toggle, and disabled submit button.
 *
 * @vitest-environment jsdom
 */

import { describe, expect, it, vi } from 'vitest';

import type { UserContext } from '../../src/shared/types.js';
import {
  initContextForm,
  setContextFormLocationSelected,
} from '../../src/web/components/context-form.js';
import { renderHero } from '../../src/web/components/hero.js';
import { renderNavbar } from '../../src/web/components/navbar.js';

describe('Step 3: Hero Component', () => {
  it('should render correct headline and supporting copy without mock stats', () => {
    const container = document.createElement('div');
    renderHero(container);

    const h1 = container.querySelector('h1.hero-headline');
    expect(h1).not.toBeNull();
    expect(h1?.textContent).toBe('Breathe easier through winter smog');
    expect(h1?.textContent).not.toContain('severe');

    const lead = container.querySelector('.hero-lead');
    expect(lead?.textContent).toContain('low-emission daily routines');

    // Ensure no mock stats or fake AQI numbers exist in hero
    expect(container.textContent).not.toContain('AQI');
    expect(container.textContent).not.toContain('Safe window');
  });

  it('should render primary and secondary pill action buttons', () => {
    const container = document.createElement('div');
    renderHero(container);

    const primaryBtn = container.querySelector('a.hero-btn.btn-primary');
    expect(primaryBtn?.getAttribute('href')).toBe('#planner');
    expect(primaryBtn?.textContent).toBe("Get today's plan");

    const secondaryBtn = container.querySelector('a.hero-btn.btn-outline');
    expect(secondaryBtn?.getAttribute('href')).toBe('#how-it-works');
    expect(secondaryBtn?.textContent).toBe('See how it works');
  });
});

describe('Step 3: Unified Planner and Context Form', () => {
  it('should initialize with submit button disabled and clear text explanation', () => {
    document.body.innerHTML = '<div id="context-form"></div>';
    initContextForm(vi.fn());

    const submitBtn = document.getElementById('submit-advice-btn') as HTMLButtonElement | null;
    const disabledHint = document.getElementById('advice-disabled-hint');

    expect(submitBtn).not.toBeNull();
    expect(submitBtn?.disabled).toBe(true);
    expect(submitBtn?.getAttribute('aria-disabled')).toBe('true');
    expect(disabledHint?.textContent).toContain('Select a city or use your location');
  });

  it('should toggle "More details" with aria-expanded and aria-controls', () => {
    document.body.innerHTML = '<div id="context-form"></div>';
    initContextForm(vi.fn());

    const toggleBtn = document.getElementById('more-details-toggle') as HTMLButtonElement;
    const detailsSection = document.getElementById('more-details-section') as HTMLElement;

    expect(toggleBtn).not.toBeNull();
    expect(detailsSection).not.toBeNull();
    expect(toggleBtn.getAttribute('aria-expanded')).toBe('false');
    expect(toggleBtn.getAttribute('aria-controls')).toBe('more-details-section');
    expect(detailsSection.hidden).toBe(true);
    expect(toggleBtn.textContent).toBe('More details');

    // Click to expand
    toggleBtn.click();
    expect(toggleBtn.getAttribute('aria-expanded')).toBe('true');
    expect(detailsSection.hidden).toBe(false);
    expect(toggleBtn.textContent).toBe('Fewer details');

    // Click to collapse
    toggleBtn.click();
    expect(toggleBtn.getAttribute('aria-expanded')).toBe('false');
    expect(detailsSection.hidden).toBe(true);
    expect(toggleBtn.textContent).toBe('More details');
  });

  it('should not preselect household answers and start child age group on placeholder', () => {
    document.body.innerHTML = '<div id="context-form"></div>';
    initContextForm(vi.fn());

    const ageSelect = document.getElementById('childAgeGroup') as HTMLSelectElement;
    expect(ageSelect.value).toBe('');

    const placeholder = ageSelect.querySelector('option[value=""]') as HTMLOptionElement;
    expect(placeholder).not.toBeNull();
    expect(placeholder.disabled).toBe(true);
    expect(placeholder.textContent).toBe('Select age group');

    const checkedInputs = document.querySelectorAll<HTMLInputElement>(
      '.context-form-grid input:checked',
    );
    expect(checkedInputs.length).toBe(0);
  });

  it('should enable submit button only when BOTH location and child age group are chosen', () => {
    document.body.innerHTML = '<div id="context-form"></div>';
    initContextForm(vi.fn());

    const submitBtn = document.getElementById('submit-advice-btn') as HTMLButtonElement;
    const disabledHint = document.getElementById('advice-disabled-hint') as HTMLElement;
    const ageSelect = document.getElementById('childAgeGroup') as HTMLSelectElement;

    // 1. Initial state: neither chosen
    expect(submitBtn.disabled).toBe(true);
    expect(submitBtn.getAttribute('aria-disabled')).toBe('true');
    expect(disabledHint.textContent).toContain('Select a city or use your location');

    // 2. Location selected, but no age group chosen
    setContextFormLocationSelected(true, 'London, United Kingdom');
    expect(submitBtn.disabled).toBe(true);
    expect(submitBtn.getAttribute('aria-disabled')).toBe('true');
    expect(disabledHint.textContent).toBe('Select a child age group to generate your plan.');

    // 3. Child age group chosen as well -> enabled!
    ageSelect.value = 'infant';
    ageSelect.dispatchEvent(new Event('change'));
    expect(submitBtn.disabled).toBe(false);
    expect(submitBtn.hasAttribute('aria-disabled')).toBe(false);
    expect(disabledHint.textContent).toBe('Location: London, United Kingdom');

    // 4. Age group reset to empty -> disabled again
    ageSelect.value = '';
    ageSelect.dispatchEvent(new Event('change'));
    expect(submitBtn.disabled).toBe(true);
    expect(submitBtn.getAttribute('aria-disabled')).toBe('true');
    expect(disabledHint.textContent).toBe('Select a child age group to generate your plan.');

    // 5. Age group restored, location deselected -> disabled again
    ageSelect.value = 'infant';
    ageSelect.dispatchEvent(new Event('change'));
    setContextFormLocationSelected(false);
    expect(submitBtn.disabled).toBe(true);
    expect(submitBtn.getAttribute('aria-disabled')).toBe('true');
    expect(disabledHint.textContent).toContain('Select a city or use your location');
  });

  it('should not submit form when button is disabled', () => {
    document.body.innerHTML = '<div id="context-form"></div>';
    const onSubmit = vi.fn<(context: UserContext) => void>();
    initContextForm(onSubmit);

    const form = document.querySelector('form.context-form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit', { cancelable: true }));

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('should submit valid context data when button is enabled and valid inputs provided', () => {
    document.body.innerHTML = '<div id="context-form"></div>';
    const onSubmit = vi.fn<(context: UserContext) => void>();
    initContextForm(onSubmit);

    setContextFormLocationSelected(true, 'Delhi');

    const ageSelect = document.getElementById('childAgeGroup') as HTMLSelectElement;
    ageSelect.value = 'infant';
    ageSelect.dispatchEvent(new Event('change'));

    const noneChip = document.getElementById('healthConditions-none') as HTMLInputElement;
    noneChip.checked = true;

    const aptRadio = document.getElementById('homeType-apartment') as HTMLInputElement;
    aptRadio.checked = true;

    const carRadio = document.getElementById('commuteMode-car') as HTMLInputElement;
    carRadio.checked = true;

    const form = document.querySelector('form.context-form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit', { cancelable: true }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const submittedContext = onSubmit.mock.calls[0]?.[0];
    expect(submittedContext?.childAgeGroup).toBe('infant');
    expect(submittedContext?.healthConditions).toEqual(['none']);
    expect(submittedContext?.homeType).toBe('apartment');
    expect(submittedContext?.commuteMode).toBe('car');
  });

  it('should focus the city search input when navbar Check Your Area is clicked', () => {
    document.body.innerHTML = `
      <header id="header"></header>
      <input type="text" id="city-search" />
    `;
    const header = document.getElementById('header') as HTMLElement;
    renderNavbar(header);

    const searchInput = document.getElementById('city-search') as HTMLInputElement;
    const focusSpy = vi.spyOn(searchInput, 'focus');

    const cta = header.querySelector('a.nav-cta') as HTMLAnchorElement;
    cta.click();

    expect(focusSpy).toHaveBeenCalledTimes(1);
  });

  it('should enforce exclusive "None" behavior on health condition chips', () => {
    document.body.innerHTML = '<div id="context-form"></div>';
    initContextForm(vi.fn());

    const noneChip = document.getElementById('healthConditions-none') as HTMLInputElement;
    const asthmaChip = document.getElementById('healthConditions-asthma') as HTMLInputElement;
    const allergiesChip = document.getElementById('healthConditions-allergies') as HTMLInputElement;

    expect(noneChip.checked).toBe(false);
    expect(asthmaChip.checked).toBe(false);

    // Checking asthma should keep none unchecked
    asthmaChip.click();
    expect(asthmaChip.checked).toBe(true);
    expect(noneChip.checked).toBe(false);

    // Checking allergies keeps asthma checked and none unchecked
    allergiesChip.click();
    expect(allergiesChip.checked).toBe(true);
    expect(asthmaChip.checked).toBe(true);
    expect(noneChip.checked).toBe(false);

    // Checking none should uncheck all other ailments
    noneChip.click();
    expect(noneChip.checked).toBe(true);
    expect(asthmaChip.checked).toBe(false);
    expect(allergiesChip.checked).toBe(false);
  });
});

describe('Layout Fidelity: Planner Tabs & Location Pill', () => {
  it('should initialize planner tabs with accessible WAI-ARIA roles, roving tabindex, and hint', async () => {
    const { initPlannerTabs, setPlannerTabsEnabled } =
      await import('../../src/web/components/planner-tabs.js');
    const container = document.createElement('div');
    initPlannerTabs(container);

    const tablist = container.querySelector('[role="tablist"]');
    expect(tablist).not.toBeNull();

    const tabs = container.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    expect(tabs.length).toBe(3);
    expect(tabs[0]?.getAttribute('aria-selected')).toBe('true');
    expect(tabs[0]?.tabIndex).toBe(0);
    expect(tabs[0]?.getAttribute('aria-disabled')).toBe('true');
    expect(tabs[1]?.getAttribute('aria-selected')).toBe('false');
    expect(tabs[1]?.tabIndex).toBe(-1);

    const hint = container.querySelector('#tabs-disabled-hint');
    expect(hint?.textContent).toBe('Generate a plan to see these');

    // Enable tabs
    setPlannerTabsEnabled(true);
    expect(tabs[0]?.hasAttribute('aria-disabled')).toBe(false);
    expect(hint?.hasAttribute('hidden')).toBe(true);
  });

  it('should render location and real AQI pill only when requested', async () => {
    const { renderLocationPill, clearLocationPill } =
      await import('../../src/web/components/location-pill.js');
    const container = document.createElement('div');

    renderLocationPill(container, {
      locationName: 'Delhi, India',
      aqi: 182,
      category: 'Unhealthy',
    });

    const pill = container.querySelector('.location-aqi-pill');
    expect(pill).not.toBeNull();
    expect(pill?.getAttribute('role')).toBe('status');
    expect(pill?.textContent).toContain('Delhi, India');
    expect(pill?.textContent).toContain('AQI 182');
    expect(pill?.textContent).toContain('Unhealthy');
    expect(pill?.querySelector('svg.icon-pin')).not.toBeNull();

    clearLocationPill(container);
    expect(container.children.length).toBe(0);
  });
});
