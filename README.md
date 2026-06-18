# GRIP Visualizer

Interactive website that maps the Flemish **GRIP** growth path (_Groeipad informatieveiligheid
en privacy voor het Vlaamse onderwijs_) to the **Microsoft A3/A5** stack. Built for webinars with
EDU **Microsoft Elevate** customers in Flanders, and reusable across organisations.

## Features

Four views, all powered by the single dataset in `src/data/grip.json`:

- **Matrix view** — the 42 GRIP measures (52 instances) across the 6 _Basis_ levels, faithful to
  the official PDF.
- **Journey view** — the same data as a progressive roadmap from Basis 1 → 6.
- **A3 vs A5 view** — what A5 adds on top of A3, with A5-only capabilities grouped per Microsoft
  product (sub-features merged into one card; license plans kept separate).
- **Prioritize view** — measures grouped by implementation horizon (short / medium / long term),
  with a "achievable with A3 today" indicator to help organisations sequence the work.

Plus:

- **Measure detail panel** — matching Microsoft products/features, license tier (A1/A3/A5) and
  documentation links per measure.
- **Type & tier filters** — dim the Matrix/Journey by Organisational/Technical or by A1/A3/A5.
- **Trilingual UI** — Dutch / English / French toggle (GRIP wording stays Dutch as source of
  truth; non-Dutch translations are AI-generated, as noted in the in-app disclaimer).
- **Color-coded by Basis maturity level**, with Organisational (O) vs Technical (T) accents.

## Tech stack

React + Vite, Vitest for tests, ESLint + Prettier. Deploys as a static site (Cloudflare Pages /
GitHub Pages) via the central `DevSecNinja/.github` reusable workflows.

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
    { "name": "Conditional Access", "tier": "A3", "docsUrl": "https://...", "a5Adds": false }
  ],
  "standards": {           // optional: mapping to common control frameworks
    "nis2": ["21(2)(i)", "21(2)(j)"],
    "cisV8": ["6.3", "6.5"]
  },
  "standardsWhy": {        // optional: localized rationale for the mapping above
    "nl": "Waarom deze koppeling bestaat ...",
    "en": "Why this mapping exists ...",
    "fr": "Pourquoi cette correspondance existe ..."
  },
  "guidance": {            // optional: practical, actionable advice (per language)
    "nl": {
      "rationale": "Waarom dit belangrijk is ...",
      "do": ["Wel doen ..."],
      "dont": ["Niet doen ..."]
    },
    "en": { "rationale": "...", "do": ["..."], "dont": ["..."] },
    "fr": { "rationale": "...", "do": ["..."], "dont": ["..."] }
  }
}
```

- `horizon` drives the Prioritize view (effort/timeline, independent of the Basis sequence).
- `a5Adds: true` marks capabilities unlocked by A5 — these feed the A3 vs A5 view.
- `standards` is **optional** and **many-to-many**; when present, the detail pane shows a
  "Standards mapping" section. The available standards (id, label, url) are declared in
  `meta.standards`. Only map where a defensible relationship exists; omit otherwise.
- `standardsWhy` is **optional** and localized (NL/EN/FR, falling back to Dutch); when present,
  it renders above the control chips to explain **why** the measure maps to those controls.
- `guidance` is **optional**; when present, the detail pane renders a "Practical guidance"
  section (rationale + do/don't). It's localized (NL/EN/FR), falling back to Dutch.
- `title_fr` / `summary_fr` are AI-generated translations; Dutch remains the source of truth.

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

## Contributing

Contributions are very welcome — bug reports, fixes, new mappings, translations and docs.
See [CONTRIBUTING.md](CONTRIBUTING.md) for how to set up locally, where translations live
(`src/i18n/strings.js`, Dutch is the source of truth) and how to edit the mapping data
(`src/data/grip.json`).

## License

Released under the [MIT License](LICENSE).
