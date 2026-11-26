/**
 * Repository code-quality invariants.
 *
 * Ensures modular file sizing across all application source and stylesheet files.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const ROOT = resolve(import.meta.dirname, '../..');
const MAX_SOURCE_LINES = 200;

/** Recursively collects all .ts and .css files under a directory. */
function collectSourceFiles(dir: string): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    if (statSync(fullPath).isDirectory()) {
      results.push(...collectSourceFiles(fullPath));
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.css')) {
      results.push(fullPath);
    }
  }
  return results;
}

describe('Code Quality Invariants', () => {
  it('keeps every TypeScript and CSS file in src/ and api/ at most 200 lines', () => {
    const files = [
      ...collectSourceFiles(join(ROOT, 'src')),
      ...collectSourceFiles(join(ROOT, 'api')),
    ];
    const oversized = files
      .map((filePath) => ({
        filePath: filePath.slice(ROOT.length + 1),
        lineCount: readFileSync(filePath, 'utf8').split(/\r?\n/).length,
      }))
      .filter((entry) => entry.lineCount > MAX_SOURCE_LINES);

    expect(oversized).toEqual([]);
  });
});
