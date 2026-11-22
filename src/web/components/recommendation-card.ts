/**
 * Recommendation card component.
 *
 * Renders an accessible personalized action card with domain badge, title,
 * description, "Why this helps" rationale, and impact badge.
 */

import type { PersonalizedAction } from '@shared/types.js';

import { createElement, setText } from '../utils/dom.js';
import { getCategoryLabel } from '../utils/formatters.js';

import { createActionIcon, createCategoryIcon } from './icons.js';
import { createPill } from './pill.js';

/**
 * Creates a single recommendation card element.
 * @param action - Action data to render.
 */
export function createRecommendationCard(action: PersonalizedAction): HTMLElement {
  const card = createElement('div', 'action-card', 'card', 'card-surface');

  const header = buildCardHeader(action);
  const titleRow = buildTitleRow(action);

  const desc = createElement('p', 'action-desc');
  setText(desc, action.description);

  const impact = buildImpactSection(action.impact);

  card.appendChild(header);
  card.appendChild(titleRow);
  card.appendChild(desc);
  card.appendChild(impact);

  return card;
}

/** Builds the top header row with domain badge and impact pill. */
function buildCardHeader(action: PersonalizedAction): HTMLElement {
  const header = createElement('div', 'action-card-header');

  const domainBadge = createPill({
    text: getCategoryLabel(action.category),
    variant: 'outline',
    icon: createCategoryIcon(action.category),
    className: 'action-domain-badge',
  });

  const benefitBadge = createElement(
    'span',
    'benefit-badge',
    `benefit-${action.benefit.toLowerCase().replace(/\s+/g, '-')}`,
  );
  setText(benefitBadge, `${action.benefit} Impact`);

  header.appendChild(domainBadge);
  header.appendChild(benefitBadge);
  return header;
}

/** Builds the title row with category/action icon and action title. */
function buildTitleRow(action: PersonalizedAction): HTMLElement {
  const titleRow = createElement('div', 'action-title-row');

  const actionIcon = createActionIcon(action.icon);
  actionIcon.classList.add('action-header-icon');

  const title = createElement('h4', 'action-title');
  setText(title, action.title);

  titleRow.appendChild(actionIcon);
  titleRow.appendChild(title);
  return titleRow;
}

/** Builds the "Why this helps" impact explanation section. */
function buildImpactSection(impactText: string): HTMLElement {
  const impact = createElement('div', 'action-impact');

  const impactLabel = createElement('strong', 'impact-label');
  setText(impactLabel, 'Why this helps: ');

  const impactSpan = createElement('span', 'impact-text');
  setText(impactSpan, impactText);

  impact.appendChild(impactLabel);
  impact.appendChild(impactSpan);
  return impact;
}
