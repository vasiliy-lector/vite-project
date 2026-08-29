# AGENTS.md

Guidance for AI coding agents working in this repository.

## Project Overview

`vite-app` — a starter for new projects: Vite + React with TypeScript,
vanilla-extract, TanStack Router (code-based routing with an explicit
layout route), Zustand (global stores), TanStack Query (server state) and
TanStack Form + zod (forms). The demo UI (counter on `/` backed by a Zustand
store, `/settings` with a form + query demo, light/dark theme toggle in the
layout header) uses **Russian** text end-to-end (UI strings, test
descriptions, aria labels) — preserve that convention for user-facing text.

- Package manager: **Yarn 4 (Berry)**, pinned via `yarnPath` in `.yarnrc.yml` (`nodeLinker: node-modules`)
- Node: `>= 22.12` required (Vite 8); `.nvmrc` pins **24**
- Docs language convention: human-facing docs (e.g. `README.md`) are written in **Russian**;
  agent-facing docs (this file) are always in **English**

## Commands

All commands run from the repository root with `yarn`:

| Command                | Purpose                                                                 |
| ---------------------- | ----------------------------------------------------------------------- |
| `yarn`                 | Install dependencies (must keep `yarn.lock` in sync)                    |
| `yarn dev`             | Dev server on http://localhost:5173                                     |
| `yarn build`           | Typecheck (`tsc --noEmit`) + production build to `dist/`                |
| `yarn preview`         | Serve the production build on port 4173                                 |
| `yarn typecheck`       | `tsc --noEmit`                                                          |
| `yarn lint`            | ESLint                                                                  |
| `yarn format`          | Prettier (write)                                                        |
| `yarn format:check`    | Prettier (check only, used in CI)                                       |
| `yarn test`            | Unit tests (Jest, jsdom)                                                |
| `yarn test:coverage`   | Unit tests + lcov coverage (`coverage/`)                                |
| `yarn test:e2e`        | e2e in the official Playwright image (Linux, same as CI)                |
| `yarn test:e2e:update` | Regenerate baselines in the same image                                  |
| `yarn test:e2e:ci`     | Playwright directly (no Docker); CI-only (Linux), used inside the image |

Run `yarn typecheck && yarn lint && yarn format:check && yarn test` before
considering a change done. `yarn test:e2e:ci` runs headless Chromium and is
fully self-contained (its own `webServer` config); `yarn test:e2e` wraps it
in the official Playwright image.

## Project Structure

```
src/
├── main.tsx                  # Entry point: QueryClientProvider + App
├── App.tsx                   # App root: ErrorBoundary + RouterProvider
├── router.ts                 # Code-based route tree, pathless layout route, 404
├── root-layout.tsx           # Layout entity: header (nav + theme toggle) + Outlet
├── root-layout.css.ts        # Layout styles
├── home-page.tsx             # Route "/": counter page
├── settings-page.tsx         # Route "/settings": form + query demo
├── settings.css.ts           # Settings styles
├── settings-api.ts           # Local mock fetch for the query demo (offline-safe)
├── not-found-page.tsx        # 404 page (splat catch-all)
├── not-found.css.ts          # 404 styles
├── error-boundary.tsx        # ErrorBoundary (render-error fallback UI)
├── theme-store.ts            # Zustand theme store (isDark, toggleTheme)
├── query.ts                  # QueryClient (app) + createTestQueryClient (tests)
├── vite-env.d.ts             # import.meta.env typing
├── styles/
│   ├── global.css.ts         # globalStyle (reset, font)
│   └── theme.css.ts          # createThemeContract + light/dark themes (CSS variables)
├── components/
│   ├── Counter.tsx           # Demo component, state in useCounterStore
│   ├── counter-store.ts      # Zustand counter store
│   ├── counter.css.ts        # style() + theme variables
│   └── *.test.ts(x)          # Unit tests next to sources
└── test/
    └── setup.ts              # jest-dom + disableRuntimeStyles + TextEncoder/ReadableStream
e2e/
├── counter.spec.ts           # Playwright tests + toHaveScreenshot
├── settings.spec.ts          # Nav, form, 404, screenshots
├── counter.spec.ts-snapshots/ # Baseline PNGs (Linux only)
└── settings.spec.ts-snapshots/
scripts/
└── e2e-docker.sh             # Runs e2e in the official Playwright image
```

Flat structure by convention: new top-level files live at the `src/` root
next to `App.tsx` (no `pages/`/`stores/` folders); a store may live next to
its component (as `components/counter-store.ts` does).

Key config: `vite.config.ts` (React + vanilla-extract plugins, `@/` alias),
`tsconfig.json` (strict, `paths` alias), `tsconfig.jest.json` (CJS override
for Jest), `jest.config.js` (`moduleNameMapper` for `@/`),
`playwright.config.ts`, `eslint.config.js` (flat),
`.github/workflows/ci.yml`.

## Conventions

### TypeScript

- `strict` mode plus `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`.
- Path alias `@/*` → `src/*` is wired in three places — `tsconfig.json`
  (`paths`), `vite.config.ts` (`resolve.alias`), `jest.config.js`
  (`moduleNameMapper`). Use it for imports; don't break the alias.
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
  element in `root-layout.tsx` (driven by `useThemeStore`).

### Routing and layouts

- Routes are **code-based** in `src/router.ts` (no file-based codegen);
  `createMemoryRouter` there is the canonical pattern for unit-testing the
  router (`createMemoryHistory` + `RouterProvider`).
- A layout is an explicit pathless route (`id`, e.g. `'layout'`) whose
  component owns page composition. The demo has one: `RootLayout`
  (`src/root-layout.tsx`) — header (nav links + theme toggle) + `Outlet`.
  To add a second layout, create another pathless route with its own
  component and re-parent the pages.
- 404: catch-all route with the **splat path `'`$`'** (`src/router.ts`);
legacy `'`*`'` did not match in the pinned TanStack Router version — the
  router rendered its default not-found instead.

### State (Zustand + TanStack Query)

- Global client state lives in per-concern store files at the `src/` root
  (`theme-store.ts`) or next to their component (`components/counter-store.ts`),
  each exporting a `useXStore` hook plus a `resetXStore` test helper.
- Access state via selectors (`useStore((s) => s.value)`), never destructure —
  enforced by `zustand/no-destructure` (the rule only checks hooks listed in its
  `hooks` option; extend that list in `eslint.config.js` when adding a store).
- Server state goes through TanStack Query: `src/query.ts` exports `queryClient`
  (used in `main.tsx`) and `createTestQueryClient` for tests. Demo data comes
  from a local mock (`src/settings-api.ts`), never a public API.
- Forms: TanStack Form (`useForm` + `form.Field`) with **zod 4** schemas passed
  straight into `validators` (Standard Schema — no adapter needed).

### Code style

- Prettier: 100-char lines, single quotes, semicolons, trailing commas.
- ESLint 10 flat config with `typescript-eslint` + `react-hooks`, plus
  `@tanstack/eslint-plugin-query`, `@tanstack/eslint-plugin-router` and
  `eslint-plugin-zustand` (rules-of-hooks is an error, exhaustive-deps is a
  warning).
- Prefer semantic selectors in tests: `getByRole`/`getByTestId` over CSS
  class names (classes are build artifacts of vanilla-extract).

### Testing

- Unit: Jest 30 + Testing Library, jsdom; test files live next to sources
  (`*.test.tsx`). Coverage excludes `src/main.tsx`.
- E2E: Playwright, Chromium only, `fullyParallel`. `webServer` builds and
  serves the app automatically; do not start `yarn preview` manually.
- E2E specs: `counter.spec.ts` (home page) and `settings.spec.ts` (nav,
  form, 404, screenshots).
- Screenshot baselines are committed to git under
  `e2e/counter.spec.ts-snapshots/` and `e2e/settings.spec.ts-snapshots/`
  and are **Linux-only** (file suffix `-linux.png`): e2e runs in the same
  official Playwright image both in CI and locally (`yarn test:e2e`), so a
  single group of baselines suffices. After a UI change, regenerate them
  with `yarn test:e2e:update` (it copies baselines back for all specs).
  `yarn test:e2e:ci` is CI-only (Linux) — do not run it on macOS.
- Screenshot tolerance: `maxDiffPixelRatio: 0.01`.

### CI (GitHub Actions)

- Workflow: `.github/workflows/ci.yml`, triggered on push to `main` and on
  PRs. Jobs: `lint` (typecheck + eslint + prettier), `unit` (jest coverage),
  `build` (vite build), `e2e` (Playwright in the official Playwright image,
  `container: mcr.microsoft.com/playwright:v1.62.1-noble`).
- Node 24 + Yarn cache via `actions/setup-node`; installs with
  `yarn install --immutable` — **commit `yarn.lock`** whenever dependencies
  change.
- Artifacts (7-day retention): `coverage/`, `dist/`, `e2e-report/`
  (`playwright-report/` + `test-results/`).

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
- **TanStack Router in jsdom**: importing the router needs `TextEncoder`
  and `ReadableStream`, which jsdom lacks; polyfills live in
  `src/test/setup.ts` — don't remove them.
- **zod + TanStack Form**: pass schemas straight into `validators`
  (Standard Schema, no adapter). Avoid `z.coerce.number()` on a `number`
  field — its Standard Schema input type is `unknown` and breaks tsc; use
  `z.number()` and convert in the input's `handleChange`.
- **e2e Docker image parity**: the Playwright image tag in
  `scripts/e2e-docker.sh` must match the `container:` tag in
  `.github/workflows/ci.yml` — baselines are generated in that exact image.
- `.yarn/` is gitignored except the pinned release under `.yarn/releases`.
  Don't commit the Yarn cache.
