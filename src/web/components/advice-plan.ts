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

const DAILY_CATEGORIES = new Set(['morning-routine', 'commute', 'outdoor-activity', 'evening-routine']);

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

/** Creates the three accessible tabpanel DOM elements. */
function createTabPanels(): TabPanelElements {
  const daily = createElement('div', 'advice-panel');
  daily.id = 'panel-daily-routines';
  daily.setAttribute('role', 'tabpanel');
  daily.setAttribute('aria-labelledby', 'tab-daily-routines');
  daily.tabIndex = 0;

  const indoor = createElement('div', 'advice-panel');
  indoor.id = 'panel-indoor-air';
  indoor.setAttribute('role', 'tabpanel');
  indoor.setAttribute('aria-labelledby', 'tab-indoor-air');
  indoor.tabIndex = 0;
  indoor.hidden = true;

  const clean = createElement('div', 'advice-panel');
  clean.id = 'panel-clean-alternatives';
  clean.setAttribute('role', 'tabpanel');
  clean.setAttribute('aria-labelledby', 'tab-clean-alternatives');
  clean.tabIndex = 0;
  clean.hidden = true;

  return { daily, indoor, clean };
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
function renderPanelActions(panel: HTMLElement, actions: PersonalizedAction[], emptyMsg: string): void {
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
