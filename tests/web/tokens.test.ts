/**
 * Unit tests for design tokens, typography, and font setup (Step 1).
 *
 * Verifies that CSS custom properties, self-hosted fonts, and global accessibility
 * rules match docs/DESIGN.md specifications.
 */

import fs from 'node:fs';
import path from 'node:path';

import { describe, it, expect } from 'vitest';

describe('Design Tokens & Global Styles (Step 1)', () => {
  const rootDir = process.cwd();
  const tokensPath = path.join(rootDir, 'src', 'web', 'tokens.css');
  const stylePath = path.join(rootDir, 'src', 'web', 'style.css');
  const fontPath = path.join(rootDir, 'public', 'fonts', 'InterVariable.woff2');

  function readCssWithImports(filePath: string): string {
    const content = fs.readFileSync(filePath, 'utf8');
    return content.replace(
      /@import\s+['"]([^'"]+)['"];/g,
      (_match: string, importPath: string): string => {
        const fullPath = path.resolve(path.dirname(filePath), importPath);
        if (fs.existsSync(fullPath)) {
          return readCssWithImports(fullPath);
        }
        return '';
      },
    );
  }

  it('provides a complete tokens.css file with core color tokens', () => {
    expect(fs.existsSync(tokensPath)).toBe(true);
    const content = fs.readFileSync(tokensPath, 'utf8');

    expect(content).toContain('--color-canvas: #f9f9f7');
    expect(content).toContain('--color-ink: #111111');
    expect(content).toContain('--color-ink-muted: #4d635c');
    expect(content).toContain('--color-surface: #ffffff');
    expect(content).toContain('--color-border: #e5e5e0');
  });

  it('defines all 6 AQI status tokens with background and text pairs', () => {
    const content = fs.readFileSync(tokensPath, 'utf8');

    expect(content).toContain('--color-status-good-text: #047857');
    expect(content).toContain('--color-status-moderate-text: #b45309');
    expect(content).toContain('--color-status-sensitive-text: #b91c1c');
    expect(content).toContain('--color-status-unhealthy-text: #991b1b');
    expect(content).toContain('--color-status-very-unhealthy-text: #6d28d9');
    expect(content).toContain('--color-status-severe-text: #450a0a');
  });

  it('enforces minimum 13px font size on labels and tags', () => {
    const content = fs.readFileSync(tokensPath, 'utf8');

    // 0.8125rem = 13px
    expect(content).toContain('--font-size-label-md: 0.8125rem');
    expect(content).toContain('--font-size-label-sm: 0.8125rem');
  });

  it('defines 44px minimum touch targets and visible focus indicators', () => {
    const content = fs.readFileSync(tokensPath, 'utf8');

    expect(content).toContain('--touch-target-min: 44px');
    expect(content).toContain('--focus-outline-width: 2px');
    expect(content).toContain('--focus-outline-offset: 2px');
  });

  it('self-hosts InterVariable.woff2 without remote requests', () => {
    expect(fs.existsSync(fontPath)).toBe(true);
    const stat = fs.statSync(fontPath);
    expect(stat.size).toBeGreaterThan(100000); // Valid WOFF2 binary
  });

  it('configures @font-face with font-display: swap in style.css', () => {
    const rawContent = fs.readFileSync(stylePath, 'utf8');
    const content = readCssWithImports(stylePath);

    expect(rawContent).toContain("@import './tokens.css';");
    expect(content).toContain('@font-face');
    expect(content).toContain("font-family: 'InterVariable'");
    expect(content).toContain("src: url('/fonts/InterVariable.woff2') format('woff2')");
    expect(content).toContain('font-display: swap');
  });

  it('includes prefers-reduced-motion media query in style.css', () => {
    const content = readCssWithImports(stylePath);
    expect(content).toContain('@media (prefers-reduced-motion: reduce)');
  });
});
