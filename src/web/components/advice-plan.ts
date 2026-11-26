/**
 * Advice plan component.
 *
 * Renders personalized advice grouped into accessible tabpanels,
 * with risk summary, medical guidance note, and recommendation cards.
 */

import type { PersonalizedAction, PersonalizedAdvice } from '@shared/types.js';

import { clearChildren, createElement, getElement, setText, showElement } from '../utils/dom.js';

import { createAqiStatusIcon } from './icons.js';
import { createMedicalGuidanceNote } from './medical-guidance.js';
import { selectTab } from './planner-tabs.js';
import { createRecommendationCard } from './recommendation-card.js';

const DAILY_CATEGORIES = new Set([
  'morning-routine',
  'commute',
  'outdoor-activity',
  'evening-routine',
]);

/** Renders the personalized advice plan into accessible tabpanels. */
export function renderAdvicePlan(advice: PersonalizedAdvice): void {
  const container = getElement('advice-plan');
  const section = getElement('advice-section');
  clearChildren(container);

  if (advice.isBasicMode || advice.personalization === 'basic') {
    container.appendChild(renderBasicNotice());
  }

  container.appendChild(renderRiskCard(advice.riskLevel, advice.riskSummary));
  container.appendChild(createMedicalGuidanceNote());

  const panels = createTabPanels();
  populatePanels(panels, advice.actions);

  container.append(panels.daily, panels.indoor, panels.clean);
  showElement(section);
  selectTab('daily-routines');
}

/** Renders the basic fallback mode notice element without emojis. */
function renderBasicNotice(): HTMLElement {
  const notice = createElement('div', 'basic-mode-notice');
  notice.setAttribute('role', 'status');

  const alertIcon = createAqiStatusIcon('alert');
  alertIcon.classList.add('notice-icon');

  const text = createElement('span', 'notice-text');
  setText(text, 'Showing standard advice (AI personalization unavailable)');

  notice.append(alertIcon, text);
  return notice;
}

/** Renders the risk assessment summary card. */
function renderRiskCard(riskLevel: string, summary: string): HTMLElement {
  const card = createElement('div', 'risk-summary', `risk-${riskLevel}`, 'card', 'card-surface');
  const header = createElement('div', 'risk-header');

  const title = createElement('h3', 'risk-title');
  setText(title, 'Risk Assessment');

  const riskBadge = createElement('span', 'risk-badge', `badge-risk-${riskLevel}`);
  setText(riskBadge, `${riskLevel.toUpperCase().replace('-', ' ')} RISK`);

  header.append(title, riskBadge);

  const text = createElement('p', 'risk-text');
  setText(text, summary);

  card.append(header, text);
  return card;
}

interface TabPanelElements {
  daily: HTMLElement;
  indoor: HTMLElement;
  clean: HTMLElement;
}

/** Creates a single accessible tabpanel element. */
function createTabPanel(id: string, labelledBy: string, hidden: boolean): HTMLElement {
  const panel = createElement('div', 'advice-panel');
  panel.id = id;
  panel.setAttribute('role', 'tabpanel');
  panel.setAttribute('aria-labelledby', labelledBy);
  panel.tabIndex = 0;
  if (hidden) {
    panel.hidden = true;
  }
  return panel;
}

/** Creates the three accessible tabpanel DOM elements. */
function createTabPanels(): TabPanelElements {
  return {
    daily: createTabPanel('panel-daily-routines', 'tab-daily-routines', false),
    indoor: createTabPanel('panel-indoor-air', 'tab-indoor-air', true),
    clean: createTabPanel('panel-clean-alternatives', 'tab-clean-alternatives', true),
  };
}

/** Populates tabpanels with action cards based on category. */
function populatePanels(panels: TabPanelElements, actions: readonly PersonalizedAction[]): void {
  const dailyActions = actions.filter((a) => DAILY_CATEGORIES.has(a.category));
  const indoorActions = actions.filter((a) => a.category === 'indoor-air-hack');
  const cleanActions = actions.filter((a) => a.category === 'sustainable-alternative');

  renderPanelActions(panels.daily, dailyActions, 'No daily routine recommendations today.');
  renderPanelActions(panels.indoor, indoorActions, 'No indoor air actions required today.');
  renderPanelActions(panels.clean, cleanActions, 'No clean alternative actions required today.');
}

/** Renders actions into a specific panel or an empty message if none. */
function renderPanelActions(
  panel: HTMLElement,
  actions: PersonalizedAction[],
  emptyMsg: string,
): void {
  if (actions.length === 0) {
    const p = createElement('p', 'panel-empty-hint');
    setText(p, emptyMsg);
    panel.appendChild(p);
    return;
  }
  for (const action of actions) {
    panel.appendChild(createRecommendationCard(action));
  }
}
