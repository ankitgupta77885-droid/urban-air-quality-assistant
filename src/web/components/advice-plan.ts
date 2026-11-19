/**
 * Advice plan component.
 *
 * Renders personalized advice grouped by category with accessible markup.
 */

import type { PersonalizedAction, PersonalizedAdvice } from '@shared/types.js';

import { clearChildren, createElement, getElement, setText, showElement } from '../utils/dom.js';
import { getCategoryLabel } from '../utils/formatters.js';

/**
 * Renders the personalized advice plan.
 * @param advice - Personalized advice data.
 */
export function renderAdvicePlan(advice: PersonalizedAdvice): void {
  const container = getElement('advice-plan');
  const section = getElement('advice-section');
  clearChildren(container);

  if (advice.isBasicMode) {
    container.appendChild(renderBasicNotice());
  }

  container.appendChild(renderRiskCard(advice.riskLevel, advice.riskSummary));

  const grouped = groupByCategory(advice.actions);
  for (const [category, actions] of grouped) {
    container.appendChild(renderCategorySection(category, actions));
  }

  showElement(section);
}

/** Renders the basic fallback mode notice element. */
function renderBasicNotice(): HTMLElement {
  const notice = createElement('div', 'basic-mode-notice');
  notice.setAttribute('role', 'status');
  setText(
    notice,
    '⚡ Showing standard recommendations. AI personalization is temporarily unavailable.',
  );
  return notice;
}

/** Renders the risk assessment card. */
function renderRiskCard(riskLevel: string, summary: string): HTMLElement {
  const card = createElement('div', 'risk-summary', `risk-${riskLevel}`);
  const title = createElement('h2');
  setText(title, 'Risk Assessment');
  const text = createElement('p');
  setText(text, summary);
  card.appendChild(title);
  card.appendChild(text);
  return card;
}

/** Renders an advice category section with its actions. */
function renderCategorySection(category: string, actions: PersonalizedAction[]): HTMLElement {
  const section = createElement('div', 'advice-category');
  const catTitle = createElement('h3', 'category-title');
  const firstAction = actions[0];
  const icon = firstAction ? firstAction.icon : '';
  setText(catTitle, `${icon} ${getCategoryLabel(category)}`);
  section.appendChild(catTitle);

  for (const action of actions) {
    section.appendChild(renderAction(action));
  }
  return section;
}

/**
 * Renders a single action card.
 * @param action - Personalized action to render.
 * @returns Action card element.
 */
function renderAction(action: PersonalizedAction): HTMLElement {
  const card = createElement('div', 'action-card');

  const title = createElement('h4', 'action-title');
  setText(title, action.title);

  const desc = createElement('p', 'action-desc');
  setText(desc, action.description);

  const impact = createElement('div', 'action-impact');
  const impactLabel = createElement('strong');
  setText(impactLabel, 'Why this helps: ');
  const impactText = document.createTextNode(action.impact);
  impact.appendChild(impactLabel);
  impact.appendChild(impactText);

  const badge = createElement('span', 'benefit-badge', `benefit-${action.benefit.toLowerCase()}`);
  setText(badge, `${action.benefit} benefit`);

  card.appendChild(title);
  card.appendChild(desc);
  card.appendChild(impact);
  card.appendChild(badge);

  return card;
}

/**
 * Groups actions by their category, preserving order.
 * @param actions - Array of personalized actions.
 * @returns Map of category to actions.
 */
function groupByCategory(
  actions: readonly PersonalizedAction[],
): Map<string, PersonalizedAction[]> {
  const map = new Map<string, PersonalizedAction[]>();

  for (const action of actions) {
    const existing = map.get(action.category);
    if (existing) {
      existing.push(action);
    } else {
      map.set(action.category, [action]);
    }
  }

  return map;
}
