# GRIP Visualizer

Interactive website that maps the Flemish **GRIP** growth path (_Groeipad informatieveiligheid
en privacy voor het Vlaamse onderwijs_) to the **Microsoft A3/A5** stack. Built for webinars with
EDU **Microsoft Elevate** customers in Flanders, and reusable across organisations.

> The Microsoft mapping is an **informative** starting point for webinars, **not licensing
> advice**. Always validate capability/tier availability against current Microsoft licensing.

## What it does

GRIP defines information-security & privacy measures across 6 maturity levels (_Basis_ 1–6).
GRIP Visualizer makes that growth path explorable and shows, for each measure, which Microsoft
capabilities help you deliver it and at which licence tier.

### Views

- **Matrix** — all GRIP measures across the 6 _Basis_ levels, faithful to the official PDF.
- **Journey** — the same data as a progressive roadmap from Basis 1 → 6.
- **A3 vs A5** — what A5 adds on top of A3, grouped per Microsoft product.
- **Prioritize** — measures grouped by implementation horizon (short / medium / long term),
  with an "achievable with A3 today" indicator to help you sequence the work.

### And more

- **Measure detail panel** — matching Microsoft products/features, licence tier (A1/A3/A5),
  add-on indicators, the value A5 or an add-on brings, and documentation links per measure.
- **Self-assessment** — score your organisation against each measure, entirely in the browser,
  with import/export of your results.
- **Export** — generate a PDF, PowerPoint or Markdown summary client-side.
- **Type & tier filters** — focus the Matrix/Journey by Organisational/Technical or by licence
  tier.
- **Trilingual UI** — Dutch / English / French. GRIP wording stays Dutch as the source of truth;
  non-Dutch translations are AI-generated, as noted in the in-app disclaimer.

## Getting started

Requires Node 24+.

```bash
npm install
npm run dev       # start the dev server on http://localhost:5173
```

Other useful commands:

```bash
npm run build     # production build into dist/
npm run preview   # preview the production build
npm run lint      # eslint
npm test          # vitest
```

## Documentation

- **[ARCHITECTURE.md](ARCHITECTURE.md)** — tech stack, project layout, the `grip.json` data
  model and badge logic, and deployment.
- **[CONTRIBUTING.md](CONTRIBUTING.md)** — how to set up locally, edit translations and mappings,
  and the quality gates and release process.

## Source

Official GRIP matrix:
[Overzicht Groeipad informatieveiligheid en privacy (GRIP)](https://assets.vlaanderen.be/image/upload/v1770992646/repositories-prd/Overzicht_Groeipad_informatieveiligheid_en_privacy_GRIP_voor_het_Vlaamse_onderwijs_r0a7v2.pdf).

## Contributing

Contributions are very welcome — bug reports, fixes, new mappings, translations and docs.
See [CONTRIBUTING.md](CONTRIBUTING.md) to get started.

## License

Released under the [MIT License](LICENSE).
