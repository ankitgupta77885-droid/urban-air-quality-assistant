/**
 * Tests that vercel.json stays consistent with the application code.
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { GEMINI_TIMEOUT_MS, REQUEST_TIMEOUT_MS } from '../../src/shared/constants.js';

interface VercelHeader {
  readonly key: string;
  readonly value: string;
}

interface VercelConfig {
  readonly outputDirectory: string;
  readonly buildCommand: string;
  readonly functions: Record<string, { readonly maxDuration: number }>;
  readonly rewrites: readonly { readonly source: string; readonly destination: string }[];
  readonly headers: readonly {
    readonly source: string;
    readonly headers: readonly VercelHeader[];
  }[];
}

const ROOT = resolve(import.meta.dirname, '../..');

/** Reads and parses vercel.json from the project root. */
function readVercelConfig(): VercelConfig {
  return JSON.parse(readFileSync(resolve(ROOT, 'vercel.json'), 'utf8')) as VercelConfig;
}

const config = readVercelConfig();

/** Returns the value of a header applied to all routes, or undefined. */
function globalHeader(key: string): string | undefined {
  const rule = config.headers.find((entry) => entry.source === '/(.*)');
  return rule?.headers.find((header) => header.key === key)?.value;
}

describe('vercel.json', () => {
  it('publishes the Vite output directory', () => {
    const viteConfig = readFileSync(resolve(ROOT, 'vite.config.ts'), 'utf8');

    expect(viteConfig).toContain(`outDir: '${config.outputDirectory}'`);
    expect(config.buildCommand).toBe('npm run build');
  });

  it('routes every API path to the serverless function', () => {
    expect(config.rewrites).toContainEqual({ source: '/api/(.*)', destination: '/api' });
  });

  it('allows the function to outlive the app and Gemini timeouts', () => {
    const maxDurationMs = (config.functions['api/index.ts']?.maxDuration ?? 0) * 1000;

    expect(maxDurationMs).toBeGreaterThanOrEqual(REQUEST_TIMEOUT_MS);
    expect(maxDurationMs).toBeGreaterThan(GEMINI_TIMEOUT_MS);
  });

  it('sets a strict content security policy on static files', () => {
    const csp = globalHeader('Content-Security-Policy') ?? '';

    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("img-src 'self' data:");
    expect(csp).toContain("script-src 'self'");
    expect(csp).not.toContain('unsafe-inline');
    expect(csp).not.toContain('unsafe-eval');
  });

  it('sets the remaining hardening headers', () => {
    expect(globalHeader('X-Content-Type-Options')).toBe('nosniff');
    expect(globalHeader('X-Frame-Options')).toBe('DENY');
    expect(globalHeader('Referrer-Policy')).toBe('no-referrer');
    expect(globalHeader('Strict-Transport-Security')).toContain('preload');
    expect(globalHeader('Permissions-Policy')).toBe('camera=(), microphone=(), geolocation=(self)');
  });

  it('sets immutable CDN cache headers for bundled assets and fonts', () => {
    const assetsRule = config.headers.find((entry) => entry.source === '/assets/(.*)');
    const fontsRule = config.headers.find((entry) => entry.source === '/fonts/(.*)');

    expect(assetsRule?.headers).toContainEqual({
      key: 'Cache-Control',
      value: 'public, max-age=31536000, immutable',
    });
    expect(fontsRule?.headers).toContainEqual({
      key: 'Cache-Control',
      value: 'public, max-age=31536000, immutable',
    });
  });
});
