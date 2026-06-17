# GRIP Visualizer

Interactive website that maps the Flemish **GRIP** growth path (_Groeipad informatieveiligheid
en privacy voor het Vlaamse onderwijs_) to the **Microsoft A3/A5** stack. Built for webinars with
EDU **Microsoft Elevate** customers in Flanders, and reusable across organisations.

## Features

- **Matrix view** — the 42 GRIP measures across the 6 _Basis_ levels, faithful to the official PDF.
- **Journey view** — the same data as a progressive roadmap from Basis 1 → 6.
- **Measure detail panel** — matching Microsoft products/features, license tier (A1/A3/A5) and
  documentation links per measure.
- **A3 vs A5 toggle** — highlights what A5 adds on top of A3.
- **Bilingual UI** — Dutch / English toggle (GRIP wording stays Dutch as source of truth).
- **Color-coded by Basis maturity level**, with Organisational (O) vs Technical (T) accents.

One dataset (`src/data/grip.json`) powers both views.

## Tech stack

React + Vite, Vitest for tests, ESLint + Prettier. Deploys as a static site to GitHub Pages.

## Getting started

```bash
npm install
npm run dev       # start the dev server
npm run build     # production build into dist/
npm run preview   # preview the production build
npm run lint      # eslint
npm test          # vitest
```

## Data model

Each measure in `src/data/grip.json`:

```jsonc
{
  "code": "O7",            // GRIP code (O = Organisatorisch, T = Technisch)
  "basis": 1,               // Basis maturity level 1–6
  "type": "O",
  "title_nl": "...",
  "title_en": "...",
  "summary_nl": "...",
  "summary_en": "...",
  "microsoft": [
    { "name": "Conditional Access", "tier": "A3", "docsUrl": "https://...", "a5Adds": false }
  ]
}
```

`a5Adds: true` marks capabilities unlocked by A5 — these drive the A3/A5 highlight.

## Deployment (Cloudflare Pages)

Deployment runs through the central **`DevSecNinja/.github`** reusable Pages workflow
(`.github/workflows/pages.yml`). On every push to `main` it runs `npm ci`, `npm test`,
`npm run build` and deploys `dist/` to **Cloudflare Pages**.

Cloudflare serves the site from the **root**, so the Vite `base` defaults to `/`. When hosting
under a sub-path instead (e.g. a GitHub Pages project site at `/grip-visualizer/`), set the
`BASE_PATH` env var at build time.

Required repository secrets (**Settings → Secrets and variables → Actions**):

- `CLOUDFLARE_ACCOUNT_ID` — the 32-character account ID from the Cloudflare dashboard
  (Account Home → **Account ID**, or the hex segment in the dashboard URL).
- `CLOUDFLARE_API_TOKEN` — a token with the **Account → Cloudflare Pages → Edit** permission.

The Cloudflare Pages project name defaults to the repository name (`grip-visualizer`).

## Source

Official GRIP matrix:
[Overzicht Groeipad informatieveiligheid en privacy (GRIP)](https://assets.vlaanderen.be/image/upload/v1770992646/repositories-prd/Overzicht_Groeipad_informatieveiligheid_en_privacy_GRIP_voor_het_Vlaamse_onderwijs_r0a7v2.pdf).

> The Microsoft mapping is an informative starting point for webinars, not licensing advice.
> Always validate capability/tier availability against current Microsoft licensing.
