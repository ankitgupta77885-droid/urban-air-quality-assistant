/**
 * How it works section component.
 *
 * Renders the 3-step feature cards explaining the data-to-action flow:
 * 1. Check Air (hyperlocal Open-Meteo telemetry)
 * 2. Personalize (rules engine for child age, health, housing)
 * 3. Act & Protect (practical exposure reduction actions)
 */

import { createElement, setText } from '../utils/dom.js';

import { createActionIcon } from './icons.js';

interface StepItem {
  readonly stepNumber: string;
  readonly iconKey: string;
  readonly title: string;
  readonly description: string;
}

const STEPS: readonly StepItem[] = [
  {
    stepNumber: '01',
    iconKey: 'wind',
    title: 'Check Air',
    description:
      'Hyperlocal telemetry for 6 pollutants and weather inversion trends from Open-Meteo.',
  },
  {
    stepNumber: '02',
    iconKey: 'home',
    title: 'Personalize',
    description: 'Rules engine adapting advice to child age, respiratory health, and housing.',
  },
  {
    stepNumber: '03',
    iconKey: 'shield',
    title: 'Act & Protect',
    description: 'Practical daily actions with clear exposure reduction rationales.',
  },
];

/**
 * Renders the How It Works section into the target container.
 * @param container - Target container HTMLElement.
 */
export function renderHowItWorks(container: HTMLElement): void {
  container.replaceChildren();

  const header = buildSectionHeader();
  const grid = buildStepsGrid();

  container.append(header, grid);
}

/** Builds the centered section header with title and subtitle. */
function buildSectionHeader(): HTMLElement {
  const header = createElement('div', 'how-it-works-header');

  const title = createElement('h2', 'how-it-works-title');
  setText(title, 'Simple steps to cut smog exposure at home');

  const subtitle = createElement('p', 'how-it-works-subtitle');
  setText(
    subtitle,
    'Personalized air defense for your family, grounded in hyperlocal atmospheric data.',
  );

  header.append(title, subtitle);
  return header;
}

/** Builds the 3-column steps grid container. */
function buildStepsGrid(): HTMLElement {
  const grid = createElement('div', 'how-it-works-grid');
  for (const step of STEPS) {
    grid.appendChild(buildStepCard(step));
  }
  return grid;
}

/** Builds an individual step card element. */
function buildStepCard(step: StepItem): HTMLElement {
  const card = createElement('div', 'how-it-works-card', 'card', 'card-surface');

  const topRow = createElement('div', 'how-it-works-card-top');
  const stepBadge = createElement('span', 'how-it-works-step');
  setText(stepBadge, step.stepNumber);

  const iconWrapper = createElement('span', 'how-it-works-icon');
  iconWrapper.setAttribute('aria-hidden', 'true');
  iconWrapper.appendChild(createActionIcon(step.iconKey));

  topRow.append(stepBadge, iconWrapper);

  const heading = createElement('h3', 'how-it-works-card-title');
  setText(heading, step.title);

  const desc = createElement('p', 'how-it-works-card-desc');
  setText(desc, step.description);

  card.append(topRow, heading, desc);
  return card;
}
