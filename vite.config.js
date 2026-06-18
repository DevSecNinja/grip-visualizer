import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Cloudflare Pages serves the site from the root, so default base is '/'.
// Override with BASE_PATH (e.g. '/grip-visualizer/') when hosting under a
// sub-path such as a GitHub Pages project site.
const base = process.env.BASE_PATH ?? '/';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

// Resolve the full commit SHA from the CI-provided GITHUB_SHA, an explicit
// override, or the local git checkout. Falls back to an empty string when
// unavailable (e.g. building outside a git repository).
function resolveCommitSha() {
  if (process.env.APP_COMMIT_SHA) return process.env.APP_COMMIT_SHA;
  if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA;
  try {
    return execSync('git rev-parse HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch {
    return '';
  }
}

const appVersion = process.env.APP_VERSION ?? pkg.version;
const appCommitSha = resolveCommitSha();
const appCommitShaShort = appCommitSha ? appCommitSha.slice(0, 7) : '';

export default defineConfig({
  base,
  define: {
    'import.meta.env.APP_VERSION': JSON.stringify(appVersion),
    'import.meta.env.APP_COMMIT_SHA': JSON.stringify(appCommitSha),
    'import.meta.env.APP_COMMIT_SHA_SHORT': JSON.stringify(appCommitShaShort),
  },
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
