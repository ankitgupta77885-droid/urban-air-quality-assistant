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
      exclude: ['src/server/index.ts', 'src/web/main.ts'],
    },
    testTimeout: 10000,
  },
});
