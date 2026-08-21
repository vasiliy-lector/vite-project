# AGENTS.md

Guidance for AI coding agents working in this repository.

## Project Overview

`vite-app` — a Vite + React starter with TypeScript and vanilla-extract.
The demo UI (counter with light/dark theme toggle) uses **Russian** text
end-to-end (UI strings, test descriptions, aria labels) — preserve that
convention for user-facing text.

- Package manager: **Yarn 4 (Berry)**, pinned via `yarnPath` in `.yarnrc.yml` (`nodeLinker: node-modules`)
- Node: `>= 22.12` required (Vite 8); `.nvmrc` pins **24**
- Docs language convention: human-facing docs (e.g. `README.md`) are written in **Russian**;
  agent-facing docs (this file) are always in **English**

## Commands

All commands run from the repository root with `yarn`:

| Command                | Purpose                                                        |
| ---------------------- | -------------------------------------------------------------- |
| `yarn`                 | Install dependencies (must keep `yarn.lock` in sync)           |
| `yarn dev`             | Dev server on http://localhost:5173                            |
| `yarn build`           | Typecheck (`tsc --noEmit`) + production build to `dist/`       |
| `yarn preview`         | Serve the production build on port 4173                        |
| `yarn typecheck`       | `tsc --noEmit`                                                 |
| `yarn lint`            | ESLint                                                         |
| `yarn format`          | Prettier (write)                                               |
| `yarn format:check`    | Prettier (check only, used in CI)                              |
| `yarn test`            | Unit tests (Jest, jsdom)                                       |
| `yarn test:coverage`   | Unit tests + lcov coverage (`coverage/`)                       |
| `yarn test:e2e`        | Playwright; auto-runs `yarn build && yarn preview --port 4173` |
| `yarn test:e2e:update` | Regenerate screenshot baselines after intentional UI changes   |

Run `yarn typecheck && yarn lint && yarn format:check && yarn test` before
considering a change done. `yarn test:e2e` runs headless Chromium and is
fully self-contained (its own `webServer` config).

## Project Structure

```
src/
├── main.tsx                  # Entry point, imports global styles
├── App.tsx                   # App root, theme toggle (applies theme class on root div)
├── app.css.ts                # App layout + theme toggle styles
├── styles/
│   ├── global.css.ts         # globalStyle (reset, font)
│   └── theme.css.ts          # createThemeContract + light/dark themes (CSS variables)
├── components/
│   ├── Counter.tsx           # Demo component (Russian UI)
│   ├── Counter.test.tsx      # Unit tests
│   └── counter.css.ts        # style() + theme variables
└── test/
    └── setup.ts              # jest-dom + vanilla-extract disableRuntimeStyles
e2e/
├── counter.spec.ts           # Playwright tests + toHaveScreenshot
└── counter.spec.ts-snapshots/ # Baseline PNGs, committed per-OS (see below)
```

Key config: `vite.config.ts` (React + vanilla-extract plugins),
`tsconfig.json` (strict), `tsconfig.jest.json` (CJS override for Jest),
`jest.config.js`, `playwright.config.ts`, `eslint.config.js` (flat),
`.gitlab-ci.yml`.

## Conventions

### TypeScript

- `strict` mode plus `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`.
- This project is intentionally on **TypeScript 6** (`^6.0.2`). Do not upgrade
  to TypeScript 7 before the 7.1 release: TS 7.0 (native Go compiler) lacks
  the JS API that helper tooling (`typescript-eslint`, `ts-jest`) depends on,
  and JS API support is expected in 7.1.
- Jest uses a separate CJS config (`tsconfig.jest.json`) — don't merge it
  into the main `tsconfig.json`.

### Styling with vanilla-extract

- Style files are `*.css.ts` but are **imported with a `.css` extension**:
  `import { button } from './counter.css';`
- Reuse design tokens through the theme contract (`src/styles/theme.css.ts`);
  don't hardcode colors that already exist as CSS variables.
- Theme switching: `lightTheme`/`darkTheme` classes are toggled on the root
  element in `App.tsx`.

### Code style

- Prettier: 100-char lines, single quotes, semicolons, trailing commas.
- ESLint 10 flat config with `typescript-eslint` + `react-hooks`
  (rules-of-hooks is an error, exhaustive-deps is a warning).
- Prefer semantic selectors in tests: `getByRole`/`getByTestId` over CSS
  class names (classes are build artifacts of vanilla-extract).

### Testing

- Unit: Jest 30 + Testing Library, jsdom; test files live next to sources
  (`*.test.tsx`). Coverage excludes `src/main.tsx`.
- E2E: Playwright, Chromium only, `fullyParallel`. `webServer` builds and
  serves the app automatically; do not start `yarn preview` manually.
- Screenshot baselines are committed to git under
  `e2e/counter.spec.ts-snapshots/` and are **OS-specific** (file suffix
  `-darwin.png` / `-linux.png`). After a UI change, update baselines for the
  OS you work on: `yarn test:e2e:update`. CI runs on Linux (Ubuntu noble via
  the Playwright Docker image) — mac/Windows UI changes that alter pixels
  will fail CI until Linux baselines are regenerated in the CI image.
- Screenshot tolerance: `maxDiffPixelRatio: 0.01`.

### CI (GitLab)

- Jobs: `lint` (typecheck + eslint + prettier), `unit` (jest coverage),
  `build` (vite build), `e2e` (Playwright in the official Playwright image).
- Installs with `yarn install --immutable` — **commit `yarn.lock`** whenever
  dependencies change.

## Gotchas

- **Yarn 4 age gate**: npm versions published less than 24 h ago are
  quarantined (`YN0016: All versions ... are quarantined`). If `yarn up`
  fails, lower the range floor to an older release (e.g. `^8.2.2` →
  `^8.2.1`); do not disable `npmMinimalAgeGate`.
- **vanilla-extract in Jest**: `*.css.ts` files must keep going through
  `@vanilla-extract/jest-transform` (see `jest.config.js`); runtime style
  generation is disabled in `src/test/setup.ts`. Don't switch to plain CSS
  or CSS Modules without an explicit request.
- **`yarn build` includes typecheck** — a build failure is often a type
  error, not a bundling error.
- `.yarn/` is gitignored except the pinned release under `.yarn/releases`.
  Don't commit the Yarn cache.
