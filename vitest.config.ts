import { resolve } from 'node:path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@shared': resolve(__dirname, 'src/shared'),
      '@server': resolve(__dirname, 'src/server'),
      '@web': resolve(__dirname, 'src/web'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/server/index.ts', 'src/shared/types.ts'],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
        'src/server/services/**': {
          statements: 90,
          branches: 90,
          functions: 90,
          lines: 90,
        },
        'src/shared/**': {
          statements: 90,
          branches: 90,
          functions: 90,
          lines: 90,
        },
      },
    },
    testTimeout: 10000,
  },
});
