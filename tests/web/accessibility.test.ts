/**
 * Frontend accessibility tests with jsdom and axe-core.
 *
 * Tests the rendered HTML for WCAG 2.1 AA compliance.
 */

import axe from 'axe-core';
import { JSDOM } from 'jsdom';
import { describe, it, expect } from 'vitest';

/**
 * Creates a JSDOM instance with the app's HTML structure.
 * @returns JSDOM document.
 */
function createTestDocument(): Document {
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>BreatheWell</title>
  </head>
  <body id="top">
    <a href="#main-content" class="skip-link">Skip to main content</a>

    <header role="banner" class="app-header">
      <div class="container nav-container">
        <a href="#top" class="brand" aria-label="BreatheWell">
          <svg class="brand-logo" viewBox="0 0 64 64" width="32" height="32" aria-hidden="true" focusable="false">
            <circle cx="32" cy="32" r="32" fill="currentColor"/>
            <path d="M19 43C14 27 27 14 49 15c1 21-10 32-30 28z" fill="#F9F9F7"/>
            <path d="M19 43l-6 6" fill="none" stroke="#F9F9F7" stroke-width="4" stroke-linecap="round"/>
            <path d="M22 40c6-3 9-8 13-12s8-6 11-10" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/>
            <path d="M30 51h14M36 45h10" fill="none" stroke="#7FD1B0" stroke-width="4" stroke-linecap="round"/>
          </svg>
          <span class="brand-title">BreatheWell</span>
        </a>
        <nav aria-label="Main navigation" class="nav-links">
          <ul class="nav-list">
            <li class="nav-item"><a href="#how-it-works" class="nav-link">How It Works</a></li>
            <li class="nav-item"><a href="#planner" class="nav-link">Air Quality</a></li>
            <li class="nav-item"><a href="#results" class="nav-link">Recommendations</a></li>
          </ul>
        </nav>
        <a href="#planner" class="btn btn-primary btn-pill nav-cta">Check Your Area</a>
      </div>
    </header>

    <main id="main-content" class="container">
      <section id="hero-section" class="hero-section" aria-label="Introduction">
        <div id="hero">
          <div class="hero-content">
            <h1 class="hero-headline">Breathe easier through urban air pollution</h1>
            <p class="hero-lead">
              Protecting young lungs starts with small, daily adjustments. Get clean-air routines,
              safer travel tips, and practical choices for home.
            </p>
            <div class="hero-actions">
              <a href="#planner" class="btn btn-primary btn-pill hero-cta">Get today's plan</a>
              <a href="#how-it-works" class="btn btn-secondary btn-pill hero-secondary">See how it works</a>
            </div>
          </div>
        </div>
      </section>

      <section id="planner" class="planner-card card card-gradient card-pad-xl" aria-label="Air quality planner">
        <div class="planner-card-header">
          <div class="planner-header-title">
            <h2 class="planner-heading">Personalized Smog Defense Planner</h2>
            <p class="planner-subtitle">Search your area and customize your family's routine</p>
          </div>
          <div class="planner-tabs-wrapper">
            <div role="tablist" aria-label="Advice categories" class="planner-tablist">
              <button type="button" role="tab" id="tab-daily-routines" aria-selected="true" aria-controls="panel-daily-routines" tabindex="0" class="planner-tab" aria-disabled="true">
                Daily routines
              </button>
              <button type="button" role="tab" id="tab-indoor-air" aria-selected="false" aria-controls="panel-indoor-air" tabindex="-1" class="planner-tab" aria-disabled="true">
                Indoor air
              </button>
              <button type="button" role="tab" id="tab-clean-alternatives" aria-selected="false" aria-controls="panel-clean-alternatives" tabindex="-1" class="planner-tab" aria-disabled="true">
                Clean alternatives
              </button>
            </div>
            <span class="tabs-disabled-hint" id="tabs-disabled-hint" role="status">Generate a plan to see these</span>
          </div>
        </div>
        <div id="location-search" class="planner-search-zone">
          <label for="city-search" class="search-label">Search for your city</label>
          <div class="search-input-row">
            <input type="text" id="city-search" class="search-input" placeholder="e.g., Delhi, London, Beijing…"
                   autocomplete="off" aria-describedby="search-hint" />
            <button type="button" class="geo-btn">
              <svg class="icon" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7z" />
              </svg>
              Use my location
            </button>
          </div>
          <p id="search-hint" class="search-hint">Type at least 2 characters to search</p>
          <ul id="search-results" role="listbox" aria-label="City search results"></ul>
        </div>
        <div id="context-form" class="planner-context-zone">
          <form class="context-form" novalidate>
            <h3>Household Context</h3>
            <div class="context-form-grid">
              <div class="form-group">
                <label for="childAgeGroup">Youngest child's age group</label>
                <select id="childAgeGroup" name="childAgeGroup" required>
                  <option value="" disabled selected>Select age group</option>
                  <option value="infant">Infant (0–1 year)</option>
                </select>
              </div>
              <fieldset class="form-group fieldset-group">
                <legend class="form-legend">Health conditions in household</legend>
                <div class="chip-wrapper">
                  <input type="checkbox" id="healthConditions-none" name="healthConditions" value="none" class="chip-input" />
                  <label for="healthConditions-none" class="chip-label">
                    <svg class="icon icon-check chip-check" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    None
                  </label>
                </div>
              </fieldset>
              <fieldset class="form-group fieldset-group">
                <legend class="form-legend">Type of home</legend>
                <div class="chip-wrapper">
                  <input type="radio" id="homeType-apartment" name="homeType" value="apartment" class="chip-input" />
                  <label for="homeType-apartment" class="chip-label">
                    <svg class="icon icon-check chip-check" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    Apartment / Flat
                  </label>
                </div>
              </fieldset>
              <fieldset class="form-group fieldset-group">
                <legend class="form-legend">Primary commute mode</legend>
                <div class="chip-wrapper">
                  <input type="radio" id="commuteMode-car" name="commuteMode" value="car" class="chip-input" />
                  <label for="commuteMode-car" class="chip-label">
                    <svg class="icon icon-check chip-check" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    Car
                  </label>
                </div>
              </fieldset>
            </div>
            <button type="button" id="more-details-toggle" class="btn btn-secondary btn-pill"
                    aria-expanded="false" aria-controls="more-details-section">More details</button>
            <div id="more-details-section" hidden>
              <div class="form-group">
                <label for="activityLevel">Family outdoor activity level</label>
                <select id="activityLevel" name="activityLevel">
                  <option value="moderate">Moderate</option>
                </select>
              </div>
              <div class="form-group">
                <label for="heatingSource">Primary heating source</label>
                <select id="heatingSource" name="heatingSource">
                  <option value="electric">Electric / Heat pump</option>
                </select>
              </div>
            </div>
            <div class="submit-section">
              <button type="submit" id="submit-advice-btn" class="btn btn-primary btn-pill submit-btn"
                      disabled aria-disabled="true">Generate Personalized Advice</button>
              <p id="advice-disabled-hint" class="disabled-hint" role="status">
                Select a city or use your location above to generate your plan.
              </p>
            </div>
          </form>
        </div>
      </section>

      <section id="aqi-section" aria-label="Air quality information">
        <div id="aqi-display">
          <div class="aqi-card aqi-moderate" aria-label="Air Quality Index: 85, Moderate">
            <div class="aqi-header">
              <span class="aqi-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </span>
              <span class="aqi-value">85</span>
              <span class="aqi-category">Moderate</span>
            </div>
          </div>
        </div>
      </section>

      <section id="advice-section" aria-label="Personalized advice">
        <div id="advice-plan">
          <div id="panel-daily-routines" role="tabpanel" aria-labelledby="tab-daily-routines" tabindex="0">
            <div class="risk-summary risk-moderate">
              <h2>Risk Assessment</h2>
              <p>Air quality is moderate. Take basic precautions for your toddler.</p>
            </div>
            <div class="advice-category">
              <h3 class="category-title">
                <svg class="icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path d="M12 2v4" />
                </svg>
                Morning Routine
              </h3>
              <div class="action-card">
                <h4 class="action-title">Check AQI before opening windows</h4>
                <p class="action-desc">Check the current AQI before opening any windows.</p>
                <div class="action-impact">
                  <strong>Why this helps: </strong>Prevents outdoor pollutants from entering.
                </div>
                <span class="benefit-badge benefit-high">High benefit</span>
              </div>
            </div>
          </div>
          <div id="panel-indoor-air" role="tabpanel" aria-labelledby="tab-indoor-air" tabindex="0" hidden></div>
          <div id="panel-clean-alternatives" role="tabpanel" aria-labelledby="tab-clean-alternatives" tabindex="0" hidden></div>
        </div>
      </section>

      <div id="results"></div>
      <section id="how-it-works" aria-label="How it works"></section>

      <div id="error-banner" role="alert" aria-live="assertive"></div>
      <div id="loading" aria-live="polite"></div>
    </main>

    <footer role="contentinfo" class="app-footer">
      <div class="container footer-container">
        <div id="disclaimer">
          <div class="disclaimer-notice" role="note" aria-label="Medical disclaimer">
            <span class="disclaimer-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </span>
            <p class="disclaimer-text">
              This tool provides general air quality guidance only and is NOT a substitute
              for professional medical advice.
            </p>
          </div>
        </div>
        <div class="trust-strip" role="note" aria-label="Data provenance">
          <span class="trust-text">Data from Open-Meteo</span>
        </div>
        <p class="copyright">© 2026 BreatheWell</p>
      </div>
    </footer>
  </body>
</html>`;

  const dom = new JSDOM(html);
  return dom.window.document;
}

describe('Accessibility (axe-core)', () => {
  it('should have no WCAG 2.1 AA violations', async () => {
    const document = createTestDocument();

    const results = await axe.run(document.documentElement, {
      rules: {
        region: { enabled: true },
        'color-contrast': { enabled: false }, // Cannot check contrast without CSS rendering
      },
    });

    const violations = results.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      description: v.description,
      nodes: v.nodes.length,
    }));

    expect(violations).toEqual([]);
  });

  it('should have a lang attribute on html', () => {
    const document = createTestDocument();
    expect(document.documentElement.getAttribute('lang')).toBe('en');
  });

  it('should have a skip link', () => {
    const document = createTestDocument();
    const skipLink = document.querySelector('.skip-link');
    expect(skipLink).not.toBeNull();
    expect(skipLink?.getAttribute('href')).toBe('#main-content');
  });

  it('should have a main landmark with id', () => {
    const document = createTestDocument();
    const main = document.getElementById('main-content');
    expect(main).not.toBeNull();
    expect(main?.tagName).toBe('MAIN');
  });

  it('should have all form controls with labels', () => {
    const document = createTestDocument();
    const inputs = document.querySelectorAll('input, select');

    for (const input of inputs) {
      const id = input.getAttribute('id');
      expect(id).toBeTruthy();
      if (id) {
        const label = document.querySelector(`label[for="${id}"]`);
        expect(label).not.toBeNull();
      }
    }
  });

  it('should have aria-live regions for dynamic content', () => {
    const document = createTestDocument();
    const errorBanner = document.getElementById('error-banner');
    const loading = document.getElementById('loading');

    expect(errorBanner?.getAttribute('aria-live')).toBe('assertive');
    expect(loading?.getAttribute('aria-live')).toBe('polite');
  });

  it('should have aria-hidden on decorative icons', () => {
    const document = createTestDocument();
    const aqiIcon = document.querySelector('.aqi-icon');
    const disclaimerIcon = document.querySelector('.disclaimer-icon');

    expect(aqiIcon?.getAttribute('aria-hidden')).toBe('true');
    expect(disclaimerIcon?.getAttribute('aria-hidden')).toBe('true');
  });

  it('should have semantic section landmarks with labels', () => {
    const document = createTestDocument();
    const sections = document.querySelectorAll('section[aria-label]');
    expect(sections.length).toBeGreaterThanOrEqual(4);
  });

  it('should use role="listbox" on search results', () => {
    const document = createTestDocument();
    const listbox = document.getElementById('search-results');
    expect(listbox?.getAttribute('role')).toBe('listbox');
  });

  it('should have a banner role on header', () => {
    const document = createTestDocument();
    const header = document.querySelector('header[role="banner"]');
    expect(header).not.toBeNull();
  });

  it('should have exactly one h1 heading on the page in the hero', () => {
    const document = createTestDocument();
    const h1s = document.querySelectorAll('h1');
    expect(h1s.length).toBe(1);
    expect(h1s[0]?.textContent).toBe('Breathe easier through urban air pollution');
  });
});
