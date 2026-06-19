# Contributing to GRIP Visualizer

First off — **thank you for being here!** Contributions are very much encouraged and
genuinely appreciated, whether that's a bug report, a fix, a new or improved Microsoft
mapping, a translation tweak, or a documentation improvement. No contribution is too small.

This project is an independent, unofficial visualizer that maps the Flemish **GRIP** growth
path (_Groeipad informatieveiligheid en privacy voor het Vlaamse onderwijs_) to the
**Microsoft A3/A5** stack. It is built with **React + Vite**, tested with **Vitest**, and
deployed as a static site.

## Ways to contribute

- 🐛 **Report bugs** or unexpected behaviour via [issues](https://github.com/DevSecNinja/grip-visualizer/issues).
- 🌍 **Improve translations** (Dutch / English / French).
- 🔗 **Add or correct mappings** between GRIP measures and Microsoft products/features.
- 📝 **Improve docs** (this file, the README, in-app copy).
- ✨ **Propose features** — open an issue first so we can discuss scope.

## Project overview

- **UI** — `src/components/`, `src/App.jsx`
- **Mapping data** — `src/data/grip.json`
- **Translations / copy** — `src/i18n/strings.js`
- **Styles** — `src/styles/index.css`
- **Tests** — `src/**/*.test.{js,jsx}`

For the tech stack, project layout, data model and deployment, see
[ARCHITECTURE.md](ARCHITECTURE.md).

## Getting started

The quickest path is a **Dev Container / GitHub Codespaces** (config in `.devcontainer/`),
which gives you Node and all tooling preinstalled. Otherwise, with Node 24+ locally:

```bash
npm install
npm run dev       # start the dev server (http://localhost:5173)
npm run build     # production build into dist/
npm run preview   # preview the production build
npm run lint      # eslint
npm run format    # prettier (JS/CSS) — markdown is formatted with dprint
npm test          # vitest
```

## Translations

All UI copy lives in [`src/i18n/strings.js`](src/i18n/strings.js), organised by language
under the `ui` object. The project ships three languages: **Dutch (`nl`)**, **English
(`en`)** and **French (`fr`)**.

- **Dutch is the source of truth.** The GRIP material is Dutch; non-Dutch strings are
  translations and should preserve the Dutch meaning. When in doubt, the original Dutch wins.
- The `t(lang, key)` helper falls back to Dutch when a key is missing in another language, so
  **always add new keys to `nl` first**, then `en` and `fr`.
- Aim for clear, concise copy aligned with the Microsoft writing style (see #23).

### Adding a new language

1. Add the language code to the `LANGS` array in `src/i18n/strings.js`.
2. Add a matching block under `ui` with translations for every key (copy the `nl` block as a
   starting point so no keys are missed).
3. Make sure the language toggle in the header renders and switches correctly.

## Mapping data

Measures live in [`src/data/grip.json`](src/data/grip.json). The full schema (every field, the
`a5Adds` / `addOn` / `standalone` badge flags, standards and guidance) is documented in
[ARCHITECTURE.md](ARCHITECTURE.md#data-model). A measure looks like:

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
  ]
}
```

Guidelines when editing mappings:

- Only map to a Microsoft product/feature where a **defensible** relationship exists — avoid
  forced or misleading mappings.
- Set `tier` to the lowest licence that delivers the capability (`A1` / `A3` / `A5`).
- Use `a5Adds: true` for capabilities unlocked specifically by A5 (these feed the A3 vs A5
  view).
- Use `addOn: true` for capabilities that need a **separate paid add-on** on top of the base
  licence (e.g. Microsoft Priva, Entra ID Governance). Add `standalone: true` when the add-on
  has **no Microsoft 365 base tier** (a separate service such as Microsoft Sentinel or Entra
  Private Access). See [ARCHITECTURE.md](ARCHITECTURE.md#badge-logic) for how these render.
- Keep `docsUrl` pointing at current, official Microsoft documentation.
- The Microsoft mapping is an **informative** starting point, not licensing advice.

## Quality gates

Before opening a PR, please run:

```bash
npm run lint
npm run format
npm test
```

### Git hooks (lefthook)

This repo uses [lefthook](https://lefthook.dev) to run the linters, formatters and tests
automatically. Inside the **Dev Container / Codespaces** the hooks are installed for you by
`.devcontainer/post-create.sh`. For a local setup:

```bash
npm install                     # installs ESLint, Prettier, Vitest
mise install                    # installs the pinned CI linters + lefthook (see .mise.toml)
mise exec -- lefthook install   # wires up the git hooks
```

What runs:

- **pre-commit** (on staged files) — ESLint `--fix`, Prettier, dprint (Markdown), yamlfmt +
  yamllint, actionlint, zizmor and gitleaks. Auto-fixable changes are re-staged for you.
- **pre-push** — `npm run lint` and `npm test` across the whole project.

Run the full pre-commit suite on demand with `mise exec -- lefthook run pre-commit`. To bypass
hooks in an emergency, use `git commit --no-verify` (please don't make a habit of it).

- A broken-links checker validates documentation and `docsUrl`/`sourceUrl` links (see #24).

## Pull request guidelines

- Keep PRs **small and focused** — one logical change per PR.
- **Update docs and tests** alongside code changes.
- **Link the related issue** (e.g. `Closes #123`).
- Use [Conventional Commits](#conventional-commits--releases) for commit messages.
- Make sure lint, build and tests pass.

## Conventional Commits & releases

Releases are automated with
[release-please](https://github.com/googleapis/release-please): it derives the next
[semantic version](https://semver.org/), updates `package.json` and `CHANGELOG.md`, and
creates the Git tag and GitHub Release. This only works if commits follow the
[Conventional Commits](https://www.conventionalcommits.org/) specification.

Each commit message should be of the form `type(optional scope): description`, e.g.
`feat(i18n): add Spanish translations` or `fix: correct A5 tier on Conditional Access`.

Common types and their effect on the version bump:

| Type        | Use for                                                 | Version bump |
| ----------- | ------------------------------------------------------- | ------------ |
| `feat:`     | A new feature                                           | minor        |
| `fix:`      | A bug fix                                               | patch        |
| `docs:`     | Documentation-only changes                              | none         |
| `chore:`    | Tooling, deps, housekeeping                             | none         |
| `ci:`       | CI / workflow changes                                   | none         |
| `refactor:` | Code change that neither fixes a bug nor adds a feature | none         |
| `test:`     | Adding or fixing tests                                  | none         |
| `perf:`     | A performance improvement                               | patch        |

For a **breaking change**, append `!` after the type (e.g. `feat!: drop A1 view`) or add a
`BREAKING CHANGE:` footer. While the project is pre-`1.0.0`, breaking changes bump the
**minor** version.

### How a release happens

1. You merge Conventional Commits (e.g. `feat:` / `fix:`) into `main`.
2. release-please opens or updates a `chore(main): release vX.Y.Z` PR with the version bump
   and changelog entries.
3. Once that PR is reviewed and merged, the tag and GitHub Release are created automatically.

> Tip: when a change spans multiple commits, the **PR title** should also follow the
> Conventional Commits format, since PRs are typically squash-merged.

## Code of conduct & licensing

Please be kind and constructive in all interactions. By contributing, you agree that your
contributions are licensed under the project's [MIT License](LICENSE).

---

Thanks again for helping improve GRIP Visualizer! 💙
