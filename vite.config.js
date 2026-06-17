import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Cloudflare Pages serves the site from the root, so default base is '/'.
// Override with BASE_PATH (e.g. '/grip-visualizer/') when hosting under a
// sub-path such as a GitHub Pages project site.
const base = process.env.BASE_PATH ?? '/';

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
