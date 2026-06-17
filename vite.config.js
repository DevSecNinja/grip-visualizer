import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// For GitHub Pages project sites the app is served from /<repo>/.
// Override with BASE_PATH env at build time if needed.
const base = process.env.BASE_PATH ?? '/grip-visualizer/';

export default defineConfig({
  base,
  plugins: [react()],
  server: {
    host: true,
    watch: {
      usePolling: true,
      interval: 100,
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
    css: false,
  },
});
