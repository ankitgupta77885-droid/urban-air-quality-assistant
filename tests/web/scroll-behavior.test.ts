/**
 * Tests that generating a plan does not pull the page up to the planner tabs,
 * and that the page scrolls to the success banner instead.
 *
 * @vitest-environment jsdom
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { initPlannerTabs, selectTab } from '../../src/web/components/planner-tabs.js';
import { scrollToElementById } from '../../src/web/utils/scroll.js';

const PANEL_IDS = ['daily-routines', 'indoor-air', 'clean-alternatives'] as const;

/** Replaces document.body cleanly with an initialized tabs container and hidden panels. */
function mountPanelsFixture(): void {
  const tabs = document.createElement('div');
  tabs.id = 'tabs';
  const panels = PANEL_IDS.map((id, index) => {
    const panel = document.createElement('div');
    panel.id = `panel-${id}`;
    if (index > 0) {
      panel.hidden = true;
    }
    return panel;
  });
  document.body.replaceChildren(tabs, ...panels);
}

/** Replaces window.matchMedia with a stub for the reduced-motion query. */
function stubReducedMotion(matches: boolean): void {
  vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches }));
}

describe('Planner tab focus', () => {
  beforeEach(() => {
    mountPanelsFixture();
    const container = document.getElementById('tabs');
    if (container) {
      initPlannerTabs(container);
    }
  });

  it('does not move focus when a tab is selected programmatically', () => {
    selectTab('indoor-air');

    expect(document.activeElement).toBe(document.body);
    expect(document.getElementById('tab-indoor-air')?.getAttribute('aria-selected')).toBe('true');
  });

  it('moves focus when the focus option is set', () => {
    selectTab('indoor-air', { focus: true });

    expect(document.activeElement).toBe(document.getElementById('tab-indoor-air'));
  });

  it('moves focus with the arrow keys for keyboard users', () => {
    const first = document.getElementById('tab-daily-routines');
    first?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));

    expect(document.activeElement).toBe(document.getElementById('tab-indoor-air'));
  });
});

describe('scrollToElementById', () => {
  const scrollIntoView = vi.fn();

  beforeEach(() => {
    const banner = document.createElement('div');
    banner.id = 'success-banner';
    document.body.replaceChildren(banner);
    Element.prototype.scrollIntoView = scrollIntoView;
  });

  afterEach(() => {
    scrollIntoView.mockReset();
    vi.unstubAllGlobals();
  });

  it('scrolls smoothly to the top of the element by default', () => {
    stubReducedMotion(false);
    scrollToElementById('success-banner');

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
  });

  it('scrolls instantly when the visitor prefers reduced motion', () => {
    stubReducedMotion(true);
    scrollToElementById('success-banner');

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'auto', block: 'start' });
  });

  it('does nothing when the element does not exist', () => {
    stubReducedMotion(false);
    scrollToElementById('missing');

    expect(scrollIntoView).not.toHaveBeenCalled();
  });
});
