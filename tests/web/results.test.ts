/**
 * Tests for Step 4: AQI display, 6-pollutant grid, recommendation cards,
 * tab panels filtering, and medical guidance note.
 *
 * @vitest-environment jsdom
 */

import { beforeEach, describe, expect, it } from 'vitest';

import type { AqiData, PersonalizedAdvice } from '../../src/shared/types.js';
import { renderAdvicePlan } from '../../src/web/components/advice-plan.js';
import { renderAqiDisplay } from '../../src/web/components/aqi-display.js';
import { createMedicalGuidanceNote } from '../../src/web/components/medical-guidance.js';
import {
  initPlannerTabs,
  selectTab,
  setPlannerTabsEnabled,
} from '../../src/web/components/planner-tabs.js';
import { createRecommendationCard } from '../../src/web/components/recommendation-card.js';

const MOCK_AQI_DATA: AqiData = {
  aqi: 72,
  category: 'Moderate',
  dominantPollutant: 'pm2_5',
  timestamp: '2026-11-22T10:00:00Z',
  pollutants: [
    { name: 'pm2_5', displayName: 'PM2.5', value: 22.4, unit: 'µg/m³' },
    { name: 'pm10', displayName: 'PM10', value: 45.1, unit: 'µg/m³' },
    { name: 'nitrogen_dioxide', displayName: 'NO₂', value: 18.0, unit: 'µg/m³' },
    { name: 'ozone', displayName: 'O₃', value: 55.2, unit: 'µg/m³' },
    { name: 'sulphur_dioxide', displayName: 'SO₂', value: 8.5, unit: 'µg/m³' },
    { name: 'carbon_monoxide', displayName: 'CO', value: 0.6, unit: 'mg/m³' },
  ],
};

const MOCK_ADVICE: PersonalizedAdvice = {
  riskLevel: 'moderate',
  riskSummary: 'Moderate winter inversion detected. Sensitive individuals should be mindful.',
  actions: [
    {
      category: 'morning-routine',
      title: 'Ventilate midday',
      description: 'Brief windows open.',
      impact: 'Disperses pollutants.',
      benefit: 'Moderate',
      icon: 'sun',
    },
    {
      category: 'indoor-air-hack',
      title: 'Run HEPA filter',
      description: 'Filter sleeping areas.',
      impact: 'Lowers exposure.',
      benefit: 'High',
      icon: 'shield',
    },
    {
      category: 'sustainable-alternative',
      title: 'Electric transit',
      description: 'Take subway/bus.',
      impact: 'Cuts zone emissions.',
      benefit: 'Sustainable Choice',
      icon: 'leaf',
    },
  ],
  isBasicMode: false,
  personalization: 'ai',
};

function setupDOM(): void {
  document.body.innerHTML = `
    <div id="planner-tabs-container"></div>
    <section id="aqi-section" hidden><div id="aqi-display"></div></section>
    <section id="advice-section" hidden><div id="advice-plan"></div></section>
  `;
}

describe('Step 4: Real-Time AQI Display and Pollutants Grid', () => {
  beforeEach(() => {
    setupDOM();
  });

  it('should render AQI metric, category, description, and Open-Meteo timestamp', () => {
    renderAqiDisplay(MOCK_AQI_DATA);
    expect(document.getElementById('aqi-section')?.hidden).toBe(false);
    expect(document.querySelector('.aqi-value')?.textContent).toBe('72');
    expect(document.querySelector('.aqi-category')?.textContent).toBe('Moderate');
    expect(document.querySelector('.aqi-description')?.textContent).toContain(
      'Air quality is acceptable',
    );
    expect(document.querySelector('.aqi-time')?.textContent).toContain(
      'Data from Open-Meteo • Updated at',
    );
  });

  it('should render 6 pollutants with values, units, and status badges', () => {
    renderAqiDisplay(MOCK_AQI_DATA);
    const names = Array.from(document.querySelectorAll('.pollutant-name')).map(
      (el) => el.textContent,
    );
    expect(names).toEqual(['PM2.5', 'PM10', 'NO₂', 'O₃', 'SO₂', 'CO']);
    const badges = document.querySelectorAll('.pollutant-badge');
    expect(badges.length).toBe(6);
    expect(badges[0]?.textContent).toBe('Moderate');
    expect(badges[1]?.textContent).toBe('Optimal');
  });
});

describe('Step 4: Recommendation Cards and Medical Note', () => {
  it('should render recommendation card with domain badge, icon, and Why this helps', () => {
    const firstAction = MOCK_ADVICE.actions[0];
    expect(firstAction).toBeDefined();
    if (!firstAction) {
      return;
    }
    const card = createRecommendationCard(firstAction);
    expect(card.classList.contains('action-card')).toBe(true);
    expect(card.querySelector('.action-title')?.textContent).toBe('Ventilate midday');
    expect(card.querySelector('.action-domain-badge')?.textContent).toContain('Morning Routine');
    expect(card.querySelector('.action-impact')?.textContent).toContain('Why this helps:');
    expect(card.querySelector('.benefit-badge')?.textContent).toBe('Moderate Impact');
  });

  it('should render permanent medical guidance note with semantic role', () => {
    const note = createMedicalGuidanceNote();
    expect(note.getAttribute('role')).toBe('note');
    expect(note.getAttribute('aria-label')).toBe('Medical guidance note');
    expect(note.textContent).toContain('General guidance, not medical advice.');
    expect(note.textContent).toContain('Consult your pediatrician');
  });
});

describe('Step 4: Advice Plan and Tab Filtering', () => {
  beforeEach(() => {
    setupDOM();
    const tabsContainer = document.getElementById('planner-tabs-container');
    if (tabsContainer) {
      initPlannerTabs(tabsContainer);
    }
  });

  it('should populate 3 tab panels and activate daily routines by default', () => {
    renderAdvicePlan(MOCK_ADVICE);
    const dailyPanel = document.getElementById('panel-daily-routines');
    const indoorPanel = document.getElementById('panel-indoor-air');
    const cleanPanel = document.getElementById('panel-clean-alternatives');
    expect(dailyPanel?.hidden).toBe(false);
    expect(indoorPanel?.hidden).toBe(true);
    expect(cleanPanel?.hidden).toBe(true);
    expect(dailyPanel?.querySelectorAll('.action-card').length).toBe(1);
    expect(indoorPanel?.querySelectorAll('.action-card').length).toBe(1);
    expect(cleanPanel?.querySelectorAll('.action-card').length).toBe(1);
  });

  it('should filter advice panels when switching tabs', () => {
    renderAdvicePlan(MOCK_ADVICE);
    setPlannerTabsEnabled(true);
    selectTab('indoor-air');
    expect(document.getElementById('panel-daily-routines')?.hidden).toBe(true);
    expect(document.getElementById('panel-indoor-air')?.hidden).toBe(false);
    selectTab('clean-alternatives');
    expect(document.getElementById('panel-indoor-air')?.hidden).toBe(true);
    expect(document.getElementById('panel-clean-alternatives')?.hidden).toBe(false);
  });

  it('should render basic mode notice without emoji when in fallback mode', () => {
    renderAdvicePlan({ ...MOCK_ADVICE, isBasicMode: true, personalization: 'basic' });
    const notice = document.querySelector('.basic-mode-notice');
    expect(notice?.textContent).toContain(
      'Showing standard advice (AI personalization unavailable)',
    );
    expect(notice?.textContent).not.toContain('⚡');
  });

  it('should render visible note when personalization is basic', () => {
    renderAdvicePlan({ ...MOCK_ADVICE, isBasicMode: false, personalization: 'basic' });
    const notice = document.querySelector('.basic-mode-notice');
    expect(notice).not.toBeNull();
    expect(notice?.textContent).toBe('Showing standard advice (AI personalization unavailable)');
  });
});
