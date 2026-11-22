/**
 * Accessible tablist component for planner advice categories.
 *
 * Implements WAI-ARIA tablist pattern with arrow-key roving tabindex.
 */

import { createElement, setText } from '../utils/dom.js';

export interface TabItem {
  readonly id: string;
  readonly label: string;
}

export const PLANNER_TABS: readonly TabItem[] = [
  { id: 'daily-routines', label: 'Daily routines' },
  { id: 'indoor-air', label: 'Indoor air' },
  { id: 'clean-alternatives', label: 'Clean alternatives' },
] as const;

type TabChangeCallback = (tabId: string) => void;

let tabsList: HTMLButtonElement[] = [];
let hintEl: HTMLElement | null = null;
let isEnabled = false;
let currentTabId = 'daily-routines';
let onTabChangeCb: TabChangeCallback | null = null;

/**
 * Initializes the planner tabs inside the header.
 * @param container - Target container element.
 * @param onTabChange - Optional callback when active tab changes.
 */
export function initPlannerTabs(container: HTMLElement, onTabChange?: TabChangeCallback): void {
  container.replaceChildren();
  onTabChangeCb = onTabChange ?? null;
  tabsList = [];
  isEnabled = false;
  currentTabId = 'daily-routines';

  const wrapper = createElement('div', 'planner-tabs-wrapper');
  const tablist = createElement('div', 'planner-tablist');
  tablist.setAttribute('role', 'tablist');
  tablist.setAttribute('aria-label', 'Advice categories');

  PLANNER_TABS.forEach((tabData, i) => {
    const tab = createTabButton(tabData, i === 0);
    tabsList.push(tab);
    tablist.appendChild(tab);
  });

  tablist.addEventListener('keydown', handleTabKeydown);

  hintEl = createElement('span', 'tabs-disabled-hint');
  hintEl.id = 'tabs-disabled-hint';
  hintEl.setAttribute('role', 'status');
  setText(hintEl, 'Generate a plan to see these');

  wrapper.append(tablist, hintEl);
  container.appendChild(wrapper);
}

/** Toggles whether the tabs are enabled (after plan generation) or disabled. */
export function setPlannerTabsEnabled(enabled: boolean): void {
  isEnabled = enabled;
  for (const tab of tabsList) {
    if (enabled) {
      tab.removeAttribute('aria-disabled');
    } else {
      tab.setAttribute('aria-disabled', 'true');
    }
  }
  if (hintEl) {
    hintEl.hidden = enabled;
  }
}

/** Creates a single accessible tab button. */
function createTabButton(tabData: TabItem, isSelected: boolean): HTMLButtonElement {
  const tab = createElement('button', 'planner-tab');
  tab.type = 'button';
  tab.id = `tab-${tabData.id}`;
  tab.setAttribute('role', 'tab');
  tab.setAttribute('aria-controls', `panel-${tabData.id}`);
  tab.setAttribute('aria-selected', isSelected ? 'true' : 'false');
  tab.setAttribute('aria-disabled', 'true');
  tab.tabIndex = isSelected ? 0 : -1;
  setText(tab, tabData.label);

  tab.addEventListener('click', () => {
    if (isEnabled) { selectTab(tabData.id); }
  });

  return tab;
}

/** Selects a specific tab by ID and updates ARIA states and panel visibility. */
export function selectTab(tabId: string): void {
  currentTabId = tabId;
  for (const tab of tabsList) {
    const isTarget = tab.id === `tab-${tabId}`;
    tab.setAttribute('aria-selected', isTarget ? 'true' : 'false');
    tab.tabIndex = isTarget ? 0 : -1;
    if (isTarget) { tab.focus(); }
  }
  for (const item of PLANNER_TABS) {
    const panel = document.getElementById(`panel-${item.id}`);
    if (panel) { panel.hidden = item.id !== tabId; }
  }
  if (onTabChangeCb && isEnabled) {
    onTabChangeCb(tabId);
  }
}

/** Handles arrow key roaming between tabs. */
function handleTabKeydown(e: KeyboardEvent): void {
  if (tabsList.length === 0) { return; }
  const curIdx = tabsList.findIndex((t) => t.id === `tab-${currentTabId}`);
  let newIdx = -1;

  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
    newIdx = (curIdx + 1) % tabsList.length;
  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    newIdx = (curIdx - 1 + tabsList.length) % tabsList.length;
  } else if (e.key === 'Home') {
    newIdx = 0;
  } else if (e.key === 'End') {
    newIdx = tabsList.length - 1;
  }

  if (newIdx !== -1 && tabsList[newIdx]) {
    e.preventDefault();
    const nextTab = PLANNER_TABS[newIdx];
    if (nextTab) { selectTab(nextTab.id); }
  }
}
