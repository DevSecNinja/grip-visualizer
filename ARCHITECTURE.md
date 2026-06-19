# Architecture

This document explains how **GRIP Visualizer** is built: the tech stack, the single dataset
that drives the whole app, and how it is deployed. For how to _contribute_ (local setup,
translations, editing mappings, quality gates), see [CONTRIBUTING.md](CONTRIBUTING.md).

## Tech stack

- **React 19** single-page app, built and bundled with **Vite 6**.
- **Vitest 3** (+ jsdom) for unit/component tests; **Playwright** for end-to-end tests.
- **ESLint 9** (flat config) and **Prettier 3** for JS/JSX/CSS; **dprint** for Markdown.
- ES modules throughout (`"type": "module"`), Node **24**.

The app is entirely client-side — there is no backend. Everything renders from one JSON
dataset.

## Project layout

```text
src/
  main.jsx            React entry; mounts App
  App.jsx             Top-level state (language, active view, filters, selection)
  components/         UI: views, cards, chips, detail panel, export/print
  data/
    grip.json         The dataset (single source of truth)
    grip.js           Accessors: getMeasures, findMeasure, localized, measureTier, …
    analytics.js      A3 vs A5 split helpers
    export.js         Client-side PDF / PowerPoint / Markdown export
    assessment.js     Self-assessment state (browser-only)
  i18n/strings.js     All UI copy, keyed by language (nl/en/fr); t(lang, key)
  styles/index.css    All styling
public/               Static assets served from the site root
e2e/                  Playwright specs
```

The four views (Matrix, Journey, A3 vs A5, Prioritize), the measure detail panel, the
self-assessment scorecard and the export/print output are all wired up in
[src/App.jsx](src/App.jsx) and read from the dataset via helpers in
[src/data/grip.js](src/data/grip.js).

## Data model

Every measure in [src/data/grip.json](src/data/grip.json) follows this shape:

```jsonc
{
  "code": "O7",             // GRIP code (O = Organisatorisch, T = Technisch)
  "basis": 1,               // Basis maturity level 1–6
  "type": "O",
  "horizon": "short",       // implementation effort: short | medium | long
  "title_nl": "...",
  "title_en": "...",
  "title_fr": "...",
  "summary_nl": "...",
  "summary_en": "...",
  "summary_fr": "...",
  "microsoft": [
    {
      "name": "Conditional Access",
      "tier": "A3",          // lowest licence that delivers the capability: A1 | A3 | A5
      "docsUrl": "https://...",
      "a5Adds": false,       // true = capability unlocked specifically by A5
      "addOn": false,        // true = needs a separate paid add-on licence
      "standalone": false,   // true = add-on with no M365 base tier (e.g. Sentinel)
      "value_nl": "...",     // optional: localized "what A5/the add-on adds" text
      "value_en": "...",
      "value_fr": "...",
      "valueUrl": "https://..."
    }
  ],
  "standards": {             // optional: many-to-many mapping to control frameworks
    "nis2": ["21(2)(i)", "21(2)(j)"],
    "cisV8": ["6.3", "6.5"]
  },
  "standardsWhy": {          // optional: localized rationale for the mapping above
    "nl": "Waarom deze koppeling bestaat ...",
    "en": "Why this mapping exists ...",
    "fr": "Pourquoi cette correspondance existe ..."
  },
  "guidance": {              // optional: practical, actionable advice (per language)
    "nl": { "rationale": "...", "do": ["..."], "dont": ["..."] },
    "en": { "rationale": "...", "do": ["..."], "dont": ["..."] },
    "fr": { "rationale": "...", "do": ["..."], "dont": ["..."] }
  }
}
```

### Field reference

- **`horizon`** drives the Prioritize view (effort/timeline, independent of the Basis sequence).
- **`tier`** is the lowest licence that delivers the capability (`A1` / `A3` / `A5`).
- **`a5Adds: true`** marks capabilities unlocked specifically by A5 — these feed the A3 vs A5
  view and render an A5 value-add badge.
- **`addOn: true`** marks a capability that needs a **separate paid add-on** on top of the base
  licence (e.g. Microsoft Priva, Entra ID Governance). It renders an "Add-on" badge.
- **`standalone: true`** (only meaningful with `addOn`) marks an add-on that has **no Microsoft
  365 base tier** — a separate service such as Microsoft Sentinel or Entra Private Access. These
  render the "Add-on" badge **alone** (no A-tier), whereas a non-standalone add-on like Priva
  renders its base tier **plus** "Add-on" (e.g. `A3 + Add-on`).
- **`value_*` / `valueUrl`** are optional localized texts explaining what the A5 tier or the
  add-on adds; shown in the measure detail panel.
- **`standards`** is optional and many-to-many; when present, the detail pane shows a "Standards
  mapping" section. The available standards (id, label, url) are declared in `meta.standards`.
- **`standardsWhy`** is optional and localized; renders above the control chips to explain _why_
  the measure maps to those controls.
- **`guidance`** is optional and localized; renders a "Practical guidance" section (rationale +
  do/don't).

> Dutch (`*_nl`) is the source of truth. English and French are translations, with `*_fr`
> AI-generated; the in-app disclaimer notes this.

### Badge logic

The licence badge shown on a **measure card/chip** comes from `measureTier()` in
[src/data/grip.js](src/data/grip.js): it returns the highest real licence tier across the
mappings, **unless** every mapping is a standalone add-on — in which case it returns the
"Add-on" badge. The per-mapping badge in the detail panel is rendered by
[src/components/LicenseBadge.jsx](src/components/LicenseBadge.jsx) using the
`tier` / `a5Adds` / `addOn` / `standalone` flags described above.

## Deployment (Cloudflare Pages)

Deployment runs through the central **`DevSecNinja/.github`** reusable Pages workflow
([.github/workflows/pages.yml](.github/workflows/pages.yml)). On every push to `main` it runs
`npm ci`, `npm test`, `npm run build` and deploys `dist/` to **Cloudflare Pages**.

Cloudflare serves the site from the **root**, so the Vite `base` defaults to `/`. When hosting
under a sub-path instead (e.g. a GitHub Pages project site at `/grip-visualizer/`), set the
`BASE_PATH` env var at build time.

Required repository secrets (**Settings → Secrets and variables → Actions**):

- `CLOUDFLARE_ACCOUNT_ID` — the 32-character account ID from the Cloudflare dashboard
  (Account Home → **Account ID**, or the hex segment in the dashboard URL).
- `CLOUDFLARE_API_TOKEN` — a token with the **Account → Cloudflare Pages → Edit** permission.

The Cloudflare Pages project name defaults to the repository name (`grip-visualizer`).
