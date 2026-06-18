# GRIP Visualizer — Copilot Coding Agent Instructions

Trust these instructions. Only search the codebase if something here is missing or proves
incorrect. Following them avoids redundant exploration and the most common build failures.

## What this repository is

An interactive, single-page website that maps the Flemish **GRIP** information-security &
privacy growth path to the **Microsoft A3/A5** stack. It renders four views (Matrix, Journey,
A3 vs A5, Prioritize) plus a measure detail panel and a trilingual (NL/EN/FR) UI, all driven by
one dataset: [src/data/grip.json](../src/data/grip.json). Dutch is the source of truth; EN/FR are
translations.

- **Type:** small front-end web app (a few dozen source files; no backend).
- **Stack:** React 19, Vite 6, Vitest 3, ESLint 9 (flat config), Prettier 3, jsdom.
- **Runtime/tooling:** Node **24**, npm (uses `package-lock.json` → `npm ci` in CI). ES modules
  (`"type": "module"`).
- **Deploy:** static site to Cloudflare Pages via the reusable `DevSecNinja/.github` Pages
  workflow on push to `main`.

## Build, test, and validation commands

Always run `npm install` (or `npm ci`) once before any other command in a fresh checkout.
`node_modules` is already present in this dev container, so installation is usually unnecessary.

| Purpose | Command | Notes |
| --- | --- | --- |
| Install deps | `npm install` / `npm ci` | Required before lint/test/build in a clean checkout. |
| Dev server | `npm run dev` | Vite on http://localhost:5173 (host enabled, polling watch). |
| Lint | `npm run lint` | Runs `eslint .`. **Validated: passes.** Fast. |
| Test | `npm test` | Runs `vitest run`. **Validated: 15 tests pass.** Takes ~60s (slow jsdom setup) — be patient, do not assume a hang. |
| Test (watch) | `npm run test:watch` | Interactive; do not use in automation. |
| Format | `npm run format` | `prettier --write .` — see warning below. |
| Build | `npm run build` | `vite build` → `dist/`. **Fails locally in this dev container — see below.** |
| Preview | `npm run preview` | Serves a prior `dist/` build. |

### Known build failure in this environment (important)

`npm run build` reliably fails in this dev container with:

```
EPERM: operation not permitted, copyfile '.../public/favicon.svg' -> '.../dist/favicon.svg'
```

Root cause: Node's `copyFileSync` (reflink copy used by Vite to copy the `public/` folder) is not
permitted on the bind-mounted workspace filesystem. The JavaScript bundling itself succeeds
("42 modules transformed") — only the static-asset copy step fails. Plain `cp` works, but Vite
uses `copyFileSync`. This is **environment-specific**; the build succeeds in CI on
`ubuntu-latest`. Do **not** spend time "fixing" this or editing `vite.config.js`/`public/` to work
around it. **Validate your changes with `npm run lint` and `npm test` instead**, and rely on CI
for the production build.

### Formatting warning

`prettier --check .` flags ~18 **pre-existing** files as unformatted, and `npm run format`
(`prettier --write .`) rewrites many files repo-wide. **Do not run `npm run format` on the whole
repo** — it creates large unrelated diffs. Only format the specific files you changed (e.g.
`npx prettier --write <file>`). Markdown is formatted with **dprint** (see `dprint.json`), not
Prettier (`*.md` is in `.prettierignore`).

## Continuous integration / checks before merge

Workflows live in `.github/workflows/` and mostly delegate to reusable `DevSecNinja/.github`
workflows:

- **lint.yml** — runs the shared lint suite (ESLint, formatters, security linters). Triggers on PR
  and push to `main`. Shell linters are disabled (no shell scripts here).
- **pages.yml** — runs `npm ci`, `npm test`, `npm run build`, then deploys `dist/` to Cloudflare
  Pages. Triggers on push/PR (ignores `**.md`). Requires secrets `CLOUDFLARE_ACCOUNT_ID` and
  `CLOUDFLARE_API_TOKEN`.
- **links.yml** — `lychee` broken-link checker over `**/*.md` and `src/data/grip.json` (config in
  `lychee.toml`). Triggers on changes to those files and weekly. Keep `docsUrl`/`sourceUrl` links
  valid and pointed at current official docs.
- **config-sync.yml** — scheduled config sync from the shared repo; not relevant to code changes.

To replicate CI gates locally before opening a PR: `npm run lint` and `npm test` (the build is
covered by CI given the local EPERM limitation). Keep PRs small and focused; update tests/docs
alongside code. **There is no local pre-commit hook yet** (lefthook is planned, not configured) —
run lint and tests manually.

## Repository conventions (org-wide `DevSecNinja` defaults)

These apply across DevSecNinja repos and are inherited here. JS/JSX/CSS are handled by ESLint +
Prettier (above); the rules below matter when you touch **workflows, YAML, Markdown, or JSON**.

- **Conventional commits:** `type(scope): description`. Types: `feat`, `fix`, `docs`, `ci`,
  `chore`, `refactor`, `perf`, `test`. Flag breaking changes explicitly.
- **EditorConfig** (`.editorconfig`): LF line endings, final newline, trim trailing whitespace.
  Indent 2 spaces for JS/JSON/YAML; **4 spaces** for Markdown and shell.
- **YAML:** start files with `---`; 2-space indent; format with `yamlfmt`, lint with `yamllint`
  (configs: `.yamlfmt.yaml`, `.yamllint.yaml` — `line-length`/`comments`/`document-start` relaxed).
- **Markdown:** format with **dprint** (`dprint.json`), lint with `markdownlint` (`.markdownlint.yaml`,
  `MD013`/`MD033`/`MD041` disabled). Not Prettier.
- **GitHub Actions:** pin every action/`uses:` ref to a full commit SHA with a trailing version
  comment (`uses: actions/checkout@<sha> # v5.0.0`); keep `# renovate:` annotations intact. Must
  pass `actionlint` and `zizmor`.
- **Tool chain (mise):** `.mise.toml` pins the linters the shared `lint.yml` runs — `actionlint`,
  `dprint`, `gitleaks`, `checkov`, `yamllint`, `yamlfmt`, `shellcheck`, `shfmt`, `trivy`, `zizmor`,
  plus Node 24. If `mise` is available, run a tool via `mise exec -- <tool>` (e.g.
  `mise exec -- dprint check`); otherwise rely on CI to enforce these.
- **Secrets:** never commit plaintext secrets — `gitleaks` and `trivy` scan in CI. Deploy secrets
  (`CLOUDFLARE_*`) live in GitHub Actions secrets.

## Project layout

Repository root files of note:

- `package.json` — scripts and dependencies (start here for commands).
- `vite.config.js` — Vite + React plugin; Vitest config (jsdom, globals, `src/test/setup.js`);
  `base` defaults to `/`, override with `BASE_PATH` env var for sub-path hosting.
- `eslint.config.js` — flat ESLint config (React, hooks, refresh; `react/prop-types` off).
- `.prettierrc.json` — singleQuote, semi, printWidth 90, tabWidth 2. `.prettierignore` excludes md.
- `dprint.json` — markdown formatting.
- `.mise.toml` — pins tool versions used by CI linters (node 24, dprint, yamllint, etc.).
- `index.html` — Vite entry HTML. `public/` — static assets (favicon). `assets/` — repo media.
- `lychee.toml` — link-checker config. `renovate.json5` — dependency automation.
- `README.md`, `CONTRIBUTING.md` — overview, data model, and contribution guidance.

`src/` structure:

- `main.jsx` — React entry; mounts `App`.
- `App.jsx` — top-level state (language, active view, filters, selected measure) and the `VIEWS`
  array wiring the four views.
- `App.test.jsx` — top-level integration tests.
- `components/` — UI: `AppHeader.jsx`, `MatrixView.jsx`, `JourneyView.jsx`, `ValueA3A5View.jsx`,
  `PrioritizeView.jsx`, `MeasureDetailPanel.jsx`, `MeasureCard.jsx`, `MeasureChip.jsx`,
  `LicenseBadge.jsx`.
- `data/` — `grip.json` (the dataset), `grip.js` (accessors: `getMeasures`, `getMeta`,
  `findMeasure`, `localized`, `localizedGuidance`, `highestTier`, …), `analytics.js`,
  `grip.test.js`.
- `i18n/strings.js` — all UI copy under `ui`, keyed by language (`nl`/`en`/`fr`). `t(lang, key)`
  falls back to Dutch. **Add new keys to `nl` first**, then `en`/`fr`.
- `styles/index.css` — all styling (CSS, not enforced by Vitest: `test.css = false`).
- `test/setup.js` — Vitest setup (jest-dom matchers).

## How to make common changes

- **Mapping data:** edit `src/data/grip.json` (schema documented in README/CONTRIBUTING: `code`,
  `basis`, `type`, `horizon`, localized `title_*`/`summary_*`, `microsoft[]`, optional
  `guidance`). Use the lowest licence tier that delivers a capability; mark A5-only capabilities
  with `a5Adds: true`. Keep `docsUrl` valid (links CI will check it).
- **UI copy/translations:** edit `src/i18n/strings.js` (Dutch first). To add a language, extend the
  `LANGS` array and add a full `ui` block.
- **Views/UI:** edit the relevant component in `src/components/`; data access goes through
  `src/data/grip.js` helpers rather than importing `grip.json` directly where a helper exists.
- After any change, run `npm run lint` and `npm test`, and `npx prettier --write` only the JS/CSS
  files you touched.
