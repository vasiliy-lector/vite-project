# AGENTS.md

Guidance for AI coding agents working in this repository.

## Project Overview

`vite-app` — a Vite + React starter template for new projects. Stack:
**Vite 8 + React 19.2 + TypeScript 6 + vanilla-extract + TanStack Router +
Zustand + TanStack Query + TanStack Form + zod**.
The demo UI (counter, settings) uses **Russian** text end-to-end (UI strings,
test descriptions, aria labels) — preserve that convention for user-facing text.

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
├── app/                                # L1 app/common + L2 layouts + L3 pages
│   ├── main.tsx                        # Entry: #root check, theme class, render <App/>
│   ├── App.tsx                         # Root component: QueryClientProvider + RouterProvider
│   ├── router.tsx                      # Code-based router: root + pathless layout + pages
│   ├── global.css.ts                   # globalStyle (reset, font)
│   ├── layouts/
│   │   └── RootLayout/
│   │       ├── RootLayout.tsx          # Layout: header (nav + theme toggle) + <Outlet/>
│   │       ├── RootLayout.css.ts
│   │       └── RootLayout.test.tsx     # Renders the layout with a minimal router
│   └── pages/
│       ├── IndexPage/IndexPage.tsx     # / route: renders <Counter/>
│       ├── SettingsPage/
│       │   ├── SettingsPage.tsx        # theme (store), TanStack Form + zod, Query demo
│       │   ├── SettingsPage.test.tsx
│       │   └── SettingsPage.css.ts
│       └── NotFound/                   # Global 404 (root notFoundComponent)
│           ├── NotFound.tsx
│           └── NotFound.css.ts
├── components/
│   ├── complex/
│   │   └── Counter/
│   │       ├── Counter.tsx             # Demo component backed by useCounterStore
│   │       ├── Counter.test.tsx
│   │       └── Counter.css.ts
│   ├── plain/
│   │   └── ErrorBoundary/              # Global error UI (root errorComponent)
│   │       ├── ErrorBoundary.tsx
│   │       ├── ErrorBoundary.test.tsx
│   │       └── ErrorBoundary.css.ts
│   └── shared/
│       ├── theme.css.ts                # createThemeContract + light/dark themes
│       ├── queryClient.ts              # QueryClient factory
│       ├── stores/
│       │   ├── counterStore.ts (+.test.ts)
│       │   └── themeStore.ts (+.test.ts)
│       └── queries/
│           └── mockApi.ts              # Local mock "API" (deterministic, offline)
├── entities/                           # Framework-free business logic (empty so far)
├── utils/                              # Pure utilities (empty so far)
├── vite-env.d.ts                       # import.meta.env typing
└── jest-setup.ts                       # TextEncoder polyfill + jest-dom + vanilla-extract
e2e/
├── counter.spec.ts                     # Playwright tests + toHaveScreenshot
├── settings.spec.ts                    # Playwright tests + toHaveScreenshot
└── <spec>-snapshots/                   # Baseline PNGs (Linux only)
scripts/
└── e2e-docker.sh                       # Runs e2e in the official Playwright image
```

Key config: `vite.config.ts` (React + vanilla-extract plugins, `@` alias),
`tsconfig.json` (strict, `@/*` paths), `tsconfig.jest.json` (CJS override for
Jest, inherits `paths`), `jest.config.js` (moduleNameMapper for `@/`),
`playwright.config.ts`, `eslint.config.js` (flat, includes the local arch
rules from `eslint.arch.js`), `.github/workflows/ci.yml`, `.env.example`.

## Conventions

### TypeScript

- `strict` mode plus `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`.
- This project is intentionally on **TypeScript 6** (`^6.0.2`). Do not upgrade
  to TypeScript 7 before the 7.1 release: TS 7.0 (native Go compiler) lacks
  the JS API that helper tooling (`typescript-eslint`, `ts-jest`) depends on,
  and JS API support is expected in 7.1.
- Path alias `@/` → `src/` is wired in `tsconfig.json` (`paths`),
  `vite.config.ts` (`resolve.alias`) and `jest.config.js` (`moduleNameMapper`).
  Use `@/...` imports in new code.
- Jest uses a separate CJS config (`tsconfig.jest.json`) — don't merge it
  into the main `tsconfig.json`.

### Architecture & import layers

`src/` is layered; `arch/layers` + `arch/colocation` (local plugin in
`eslint.arch.js`, wired in `eslint.config.js`) make violations lint errors.

| Level                 | Folder                                   | Purpose                                                                                                                                                                       |
| --------------------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| L1 app/common         | `src/app/` (except `pages/`, `layouts/`) | entry points: `main.tsx`, `App.tsx`, `router.tsx`, `global.css.ts`                                                                                                            |
| L2 app/layouts        | `src/app/layouts/`                       | layout components, one folder each                                                                                                                                            |
| L3 app/pages          | `src/app/pages/`                         | page components, one folder per page (folder = component name)                                                                                                                |
| L4 components/complex | `src/components/complex/`                | complex components (business logic and/or dependencies on other components)                                                                                                   |
| L5 components/plain   | `src/components/plain/`                  | simple components that **do not import other React components**; if they need one — move to `complex`                                                                         |
| L6 components/shared  | `src/components/shared/`                 | shared for components/pages: theme tokens, hooks, Zustand stores, reusable queries (type subfolders `stores/`, `hooks/`, `queries/`; single files live directly in `shared/`) |
| L7 entities           | `src/entities/`                          | complex business logic without frameworks; must be unit-tested                                                                                                                |
| L8 utils              | `src/utils/`                             | utilities without business logic and without React                                                                                                                            |

Rules (same as README «Архитектура: уровни и правила импортов»):

- Imports are allowed **down** (to a lower level) and from **one's own folder**
  (colocation). Same-level imports between different folders are allowed only
  for L1, L4, L6 (pages, layouts, plain, entities, utils are independent).
- **Main file**: from outside a component folder only
  `<name>/<name>` (the file exporting the React component) can be imported;
  "innards" (styles, hooks, sub-components) are internal to the folder.
  React components live in pages, layouts, complex, plain (+ `App` in app as
  an exception); shared/entities/utils hold no React components.
- **Styles**: `*.css` from other folders/levels may only be imported from
  `components/shared` (e.g. `theme.css.ts`); own folder — always; L1 — within
  its level.
- **entities and utils**: `react` / `react-dom` imports are forbidden
  (pure TypeScript).
- **Colocation**: pages, layouts and complex/plain components live in their
  own folders — flat files at a level root are a lint error.

### Naming

- **camelCase** — file names (except React components) and identifiers:
  `router.tsx`, `counterStore.ts`, `global.css.ts`. No dashes or underscores.
- **PascalCase** — component folders and files named after the component:
  the component file, its tests and styles:
  `Counter/Counter.tsx`, `Counter/Counter.test.tsx`, `Counter/Counter.css.ts`.
- A page's folder is named after its component
  (`app/pages/SettingsPage/SettingsPage.tsx`) — one rule for all React
  components (pages, layouts, complex, plain).
- Exception: `src/vite-env.d.ts` (Vite ecosystem convention).

### Styling with vanilla-extract

- Style files are `*.css.ts` but are **imported with a `.css` extension**:
  `import { button } from './Counter.css';`
- Reuse design tokens through the theme contract
  (`src/components/shared/theme.css.ts`); don't hardcode colors that already
  exist as CSS variables.
- A component's styles live in the component's folder; `*.css` from other
  folders is only importable from `components/shared` (see Architecture).
- `style()` doesn't support compound selectors (`&.active` is a type error) —
  compose separate style objects instead.
- Theme switching: `lightTheme`/`darkTheme` classes are applied to
  `document.documentElement` (effect in `RootLayout` + initial class in
  `main.tsx`), so theme variables cascade app-wide, including the 404 page
  (which renders outside the layout).

### Routing (TanStack Router, code-based)

- The route tree lives in `src/app/router.tsx`; `register` is declared so
  `Link`/`navigate` route paths are fully typed.
- `/` renders `IndexPage` (which renders the `Counter` demo); 404 is
  `NotFound` (app/pages), the error UI is `ErrorBoundary` (components/plain).
- The layout is a **pathless layout route** (`id: 'layout'`, no `path`) whose
  component (`RootLayout`) renders header + `<Outlet/>`. Page routes are its
  children. Switching layouts = declaring a second pathless layout route and
  attaching routes to it (see README "Layouts").
- 404: `notFoundComponent` on the root route (renders outside the layout).
  Errors: `errorComponent` on the root route.
- The default active state of `Link` is the `active` class; use
  `activeProps={{ className: ... }}` + `activeOptions={{ exact: true }}`
  (there is no `NavLink`/`end` prop in this version).
- `createAppRouter(history?)` factory allows `createMemoryHistory()` in tests.

### State (Zustand)

- One store per concern, files in `src/components/shared/stores/`
  (`counterStore.ts`, `themeStore.ts`); always select values via selector functions
  (`useStore((s) => s.x)`) — `eslint-plugin-zustand` bans destructuring
  (rule `zustand/no-destructure` is configured with the store hook names).
- ESLint: official `@tanstack/eslint-plugin-query` and
  `@tanstack/eslint-plugin-router` flat configs are enabled.

### Server state (TanStack Query) + forms (TanStack Form + zod)

- `QueryClient` is created once in `src/app/App.tsx` (module level — required
  by the `stable-query-client` rule); the factory lives in
  `src/components/shared/queryClient.ts` (so pages/tests below app/common can
  import it without violating the layers).
- TanStack Form validators accept Standard Schema objects directly:
  `validators: { onSubmit: z.object(...) }`.
- **`form.handleSubmit` does NOT call `preventDefault`** — attach it via
  `onSubmit={(e) => { e.preventDefault(); ...; form.handleSubmit(); }}`
  (see `SettingsPage.tsx`), otherwise the browser reloads the page.
- `field.state.meta.errors` for Standard Schema validators are issue objects
  (`{ message, path }`), not strings — map to `.message` when rendering.
- Field binding is manual in this version (no `<field.Input/>`):
  `value={field.state.value}` + `field.handleChange(...)` + `field.handleBlur`.

### Code style

- Prettier: 100-char lines, single quotes, semicolons, trailing commas.
- ESLint 10 flat config with `typescript-eslint` + `react-hooks`
  (rules-of-hooks is an error, exhaustive-deps is a warning).
- Prefer semantic selectors in tests: `getByRole`/`getByTestId` over CSS
  class names (classes are build artifacts of vanilla-extract).

### Testing

- Unit: Jest 30 + Testing Library, jsdom; test files live next to sources
  (`*.test.tsx`). Coverage excludes `src/app/main.tsx`.
- Router tests: use `createMemoryHistory()` +
  `await waitFor(() => expect(router.state.isLoading).toBe(false))`
  (there is no `router.loadComplete` in this version; the initial render is
  empty until the first load settles). `RootLayout.test.tsx` follows the same
  pattern with its own minimal router — it must not import `app/router`
  (app/layouts is below app/common in the layer rules).
- `src/jest-setup.ts` polyfills `TextEncoder`/`TextDecoder` (jsdom lacks them;
  `@tanstack/router-core` SSR serializer needs them).
- E2E: Playwright, Chromium only, `fullyParallel`. `webServer` builds and
  serves the app automatically; do not start `yarn preview` manually.
- Screenshot baselines are committed to git under
  `e2e/<spec>-snapshots/` and are **Linux-only** (suffix `-chromium-linux.png`):
  e2e runs in the same official Playwright image both in CI and locally
  (`yarn test:e2e`), so a single group of baselines suffices.
  `scripts/e2e-docker.sh update` copies back the snapshots of **all** specs.
  After a UI change, regenerate with `yarn test:e2e:update`.
  `yarn test:e2e:ci` is CI-only (Linux) — do not run it on macOS.
- Screenshot tolerance: `maxDiffPixelRatio: 0.002`. Playwright only rewrites a
  baseline in `--update-snapshots` mode when the diff exceeds that tolerance —
  if a "changed" UI still matches within 0.2%, delete the baseline PNGs first
  to force regeneration.

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
  generation is disabled in `src/jest-setup.ts`. Don't switch to plain CSS
  or CSS Modules without an explicit request.
- **`yarn build` includes typecheck** — a build failure is often a type
  error, not a bundling error.
- **e2e Docker image parity**: the Playwright image tag in
  `scripts/e2e-docker.sh` must match the `container:` tag in
  `.github/workflows/ci.yml` — baselines are generated in that exact image.
- **e2e Docker volume**: `scripts/e2e-docker.sh` reuses a named volume
  (`vite-app-e2e-work`) for `/work` (a `node_modules` cache); the repo is
  tar-copied on top of it on every run, so files deleted from the repo linger
  in the volume. After a branch switch this is **not harmless**: `yarn build`
  runs `tsc --noEmit`, which typechecks the whole `src/` (not just the import
  graph), so stale files from another branch break the in-container build.
  Clean up before switching branches: `docker volume rm vite-app-e2e-work`
  (the next run recreates and reinstalls it).
- `.yarn/` is gitignored except the pinned release under `.yarn/releases`.
  Don't commit the Yarn cache.
