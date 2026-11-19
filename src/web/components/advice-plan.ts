/**
 * Advice plan component.
 *
 * Renders personalized advice grouped by category with accessible markup.
 */

import type { PersonalizedAdvice, PersonalizedAction } from '@shared/types.js';

import {
  clearChildren,
  createElement,
  getElement,
  setText,
  showElement,
} from '../utils/dom.js';
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
    const notice = createElement('div', 'basic-mode-notice');
    notice.setAttribute('role', 'status');
    setText(
      notice,
      '⚡ Showing standard recommendations. AI personalization is temporarily unavailable.',
    );
    container.appendChild(notice);
  }

  const riskCard = createElement('div', 'risk-summary', `risk-${advice.riskLevel}`);
  const riskTitle = createElement('h2');
  setText(riskTitle, 'Risk Assessment');
  const riskText = createElement('p');
  setText(riskText, advice.riskSummary);
  riskCard.appendChild(riskTitle);
  riskCard.appendChild(riskText);
  container.appendChild(riskCard);

  const grouped = groupByCategory(advice.actions);

  for (const [category, actions] of grouped) {
    const section = createElement('div', 'advice-category');

    const catTitle = createElement('h3', 'category-title');
    const firstAction = actions[0];
    const icon = firstAction ? firstAction.icon : '';
    setText(catTitle, `${icon} ${getCategoryLabel(category)}`);
    section.appendChild(catTitle);

    for (const action of actions) {
      section.appendChild(renderAction(action));
    }

    container.appendChild(section);
  }

  showElement(section);
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
