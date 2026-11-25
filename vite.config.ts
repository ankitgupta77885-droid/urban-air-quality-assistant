import { resolve } from 'node:path';

import { defineConfig } from 'vite';

const SERVER_PORT = 3000;
const CLIENT_PORT = 5173;

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist/web',
    emptyOutDir: true,
    sourcemap: false,
    target: 'es2022',
  },
  resolve: {
    alias: {
      '@shared': resolve(__dirname, 'src/shared'),
      '@web': resolve(__dirname, 'src/web'),
    },
  },
  server: {
    port: CLIENT_PORT,
    watch: {
      ignored: ['**/coverage/**', '**/.git/**'],
    },
    proxy: {
      '/api': {
        target: `http://localhost:${SERVER_PORT}`,
        changeOrigin: true,
      },
    },
  },
});
