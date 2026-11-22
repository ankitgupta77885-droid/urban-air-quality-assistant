/**
 * Tests for Step 6: Responsive layout (360px, 768px, 1280px) and reduced-motion pass.
 *
 * Verifies breakpoint rules, touch target enforcements, and accessibility preferences.
 */

import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

describe('Step 6: Responsive Rules & Breakpoints', () => {
  const rootDir = process.cwd();
  const stylePath = path.join(rootDir, 'src', 'web', 'style.css');
  const tokensPath = path.join(rootDir, 'src', 'web', 'tokens.css');
  const styleContent = fs.readFileSync(stylePath, 'utf8');
  const tokensContent = fs.readFileSync(tokensPath, 'utf8');

  it('defines desktop and mobile hero headline scale tokens', () => {
    expect(tokensContent).toContain('--font-size-display-hero: 3.5rem');
    expect(tokensContent).toContain('--font-size-display-hero-mobile: 2.375rem');
    expect(tokensContent).toContain('--touch-target-min: 44px');
  });

  it('implements responsive container scaling up to 1280px max-width', () => {
    expect(styleContent).toContain('max-width: 1280px');
    expect(styleContent).toContain('@media (min-width: 768px)');
    expect(styleContent).toContain('@media (min-width: 1024px)');
  });

  it('provides compact card paddings for mobile viewports (<= 768px and <= 480px)', () => {
    expect(styleContent).toContain('@media (max-width: 768px)');
    expect(styleContent).toContain('@media (max-width: 480px)');
    expect(styleContent).toContain('padding: var(--space-md)');
  });

  it('stacks hero buttons and expands tap targets on small mobile viewports', () => {
    expect(styleContent).toContain('.hero-actions .hero-btn');
    expect(styleContent).toContain('flex-direction: column');
  });

  it('configures 2-column mobile pollutants grid scaling to 3 columns on tablet/desktop', () => {
    expect(styleContent).toContain('grid-template-columns: repeat(2, 1fr)');
    expect(styleContent).toContain('grid-template-columns: repeat(3, 1fr)');
  });

  it('allows horizontal touch-scrolling on planner tabs without viewport overflow', () => {
    expect(styleContent).toContain('overflow-x: auto');
    expect(styleContent).toContain('-webkit-overflow-scrolling: touch');
    expect(styleContent).toContain('min-height: var(--touch-target-min)');
  });
});

describe('Step 6: Reduced-Motion Preference', () => {
  const rootDir = process.cwd();
  const stylePath = path.join(rootDir, 'src', 'web', 'style.css');
  const styleContent = fs.readFileSync(stylePath, 'utf8');

  it('disables or zeroes all animations and transitions under prefers-reduced-motion', () => {
    expect(styleContent).toContain('@media (prefers-reduced-motion: reduce)');
    expect(styleContent).toContain('animation-duration: 0.01ms !important');
    expect(styleContent).toContain('transition-duration: 0.01ms !important');
    expect(styleContent).toContain('scroll-behavior: auto !important');
  });

  it('neutralizes loading spinner continuous rotation under prefers-reduced-motion', () => {
    expect(styleContent).toContain('.loading-spinner');
    expect(styleContent).toContain('animation: none !important');
  });
});
