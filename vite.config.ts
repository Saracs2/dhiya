/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base so the production build in dist/ can be served from any folder
// (or a GitHub Pages sub-path) and works fully offline at a demo booth.
export default defineConfig(({ mode }) => {
  // ESP32 address for the dev-server proxy. Set ESP32_URL in .env.local
  // (see .env.example) to point at your own board.
  const env = loadEnv(mode, '.', 'ESP32_');
  const esp32Target = env.ESP32_URL || 'http://10.61.11.156';

  return {
    base: './',
    plugins: [react()],

    server: {
      proxy: {
        '/esp32': {
          target: esp32Target,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/esp32/, ''),
        },
      },
    },

    test: {
      environment: 'node',
      include: ['src/**/*.test.ts'],
    },
  };
});
