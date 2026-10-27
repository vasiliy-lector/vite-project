# AGENTS.md

Guidance for AI coding agents working in this repository.

## Project Overview

`vite-app` — a pnpm-workspaces monorepo starter: **Vite 8 + React 19.2 +
TypeScript 6 + vanilla-extract + TanStack Router/Zustand/TanStack Query/
TanStack Form + zod** on the client, **Fastify 5 + Drizzle ORM + Postgres**
on the backend, with a shared **`common`** package (zod contracts, DTO types).
The demo UI (counter, settings) uses **Russian** text end-to-end (UI strings,
test descriptions, aria labels) — preserve that convention for user-facing text.

- Package manager: **pnpm 12** pinned via `packageManager` in the root
  `package.json` (workspaces declared in `pnpm-workspace.yaml`)
- Node: `>= 22.12` required (Vite 8); `.nvmrc` pins **24**
- Docs language convention: human-facing docs (e.g. `README.md`) are written
  in **Russian**; agent-facing docs (this file) are always in **English**

## Commands

All commands run from the repository root with `pnpm`:

| Command                | Purpose                                                             |
| ---------------------- | ------------------------------------------------------------------- |
| `pnpm install`         | Install dependencies (keep `pnpm-lock.yaml` in sync)                |
| `pnpm dev`             | Run client (:5173) and backend (:3000) in parallel                  |
| `pnpm build`           | Typecheck + build all packages (`pnpm -r build`)                    |
| `pnpm preview`         | Serve the client production build on port 4173                      |
| `pnpm typecheck`       | `tsc --noEmit` in every package                                     |
| `pnpm lint`            | ESLint (root config covers all packages incl. arch rules)           |
| `pnpm format`          | Prettier (write)                                                    |
| `pnpm format:check`    | Prettier (check only, used in CI)                                   |
| `pnpm test`            | Unit tests (Jest) in every package                                  |
| `pnpm test:coverage`   | Unit tests + lcov coverage (per package `coverage/`)                |
| `pnpm test:e2e`        | e2e in the official Playwright image (Linux, same as CI)            |
| `pnpm test:e2e:update` | Regenerate baselines in the same image                              |
| `pnpm test:e2e:ci`     | Playwright directly (no Docker); CI-only (Linux), used in the image |

Run `pnpm typecheck && pnpm lint && pnpm format:check && pnpm test` before
considering a change done. `pnpm test:e2e:ci` runs headless Chromium and
starts both servers itself via `webServer` (backend + built client).

## Project Structure

```
/root/                          # pnpm workspace root
├── pnpm-workspace.yaml         # packages + allowBuilds (esbuild, @parcel/watcher, unrs-resolver)
├── package.json                # root scripts, packageManager: pnpm@12.x, lint/format tooling
├── docker-compose.yml          # postgres:16 (optional — backend defaults to embedded PGlite)
├── playwright.config.ts        # root e2e config (two webServer entries, serial workers)
├── e2e/                        # Playwright specs + Linux screenshot baselines (outside packages)
│   ├── counter.spec.ts / settings.spec.ts
│   └── <spec>-snapshots/      # committed PNGs (suffix -chromium-linux.png)
├── eslint.arch.js              # local ESLint plugin: arch/layers + arch/colocation
├── eslint.config.js            # root flat config (covers client/backend/common src)
├── client/                     # Vite + React app (src: app → components → helpers → model → utils)
│   └── src/
│       ├── app/                # main.tsx, App.tsx, global.css.ts, routes/, layouts/, pages/
│       │   ├── routes/routes.tsx       # code-based router (root → pathless layout → pages)
│       │   ├── layouts/RootLayout/…
│       │   └── pages/{IndexPage,SettingsPage,NotFound}/…
│       ├── components/         # Counter/, ErrorBoundary/, stores/, queryClient/, theme/
│       ├── helpers/            # env/, settingsApi/, counterApi/ (no React components)
│       ├── model/              # (empty so far) pure business logic, no React
│       ├── utils/              # (empty so far) pure utilities, no React
│       ├── jest-setup.ts       # TextEncoder polyfill + jest-dom + vanilla-extract
│       └── vite-env.d.ts       # import.meta.env typing
├── backend/                    # Fastify API (src: app → controllers → model → utils)
│   ├── migrations/0001_init.sql        # applied automatically on start (PGlite & fresh Postgres)
│   ├── tsconfig.json / tsconfig.jest.json / tsconfig.build.json
│   ├── jest.config.js                  # node environment
│   └── src/
│       ├── app/                # main.ts (entry), server.ts (Fastify + route registration),
│       │                       #   server.test.ts (inject — wiring tests)
│       ├── controllers/        # settings/, counter/ — thin HTTP handlers (no unit tests needed)
│       ├── model/              # settings/, counter/ — repositories (Drizzle); table.ts inside
│       └── utils/              # db/ (createDatabase: PGlite or node-postgres)
└── common/                     # shared contracts (src: entities → shared; zod only dep)
    └── src/
        ├── entities/settings/settings.ts   # settingsSchema, defaultSettings, SettingsDto
        ├── entities/counter/counter.ts     # counter schemas, applyCounterAction
        └── shared/api/api.ts               # apiPaths (used by client helpers and backend server)
```

Key config: `client/vite.config.ts` (React + vanilla-extract plugins, `@` and
`@common` aliases), `client/tsconfig.json` (`paths` for both aliases),
`client/jest.config.js` (plus a `@/helpers/env/env` → `env.cjs.ts` mapper so
jest can run without `import.meta`).

## Conventions

### TypeScript

- `strict` mode plus `noUnusedLocals`, `noUnusedParameters`,
  `verbatimModuleSyntax`; backend builds with CommonJS output (dev via `tsx`).
- This project is intentionally on **TypeScript 6** (`^6.0.2`). Do not upgrade
  to TypeScript 7 before the 7.1 release: TS 7.0 (native Go compiler) lacks
  the JS API that helper tooling (`typescript-eslint`, `ts-jest`) depends on,
  and JS API support is expected in 7.1.
- Path aliases: every package uses `@/*` → its own `src/*`; `client` and
  `backend` additionally map `@common/*` → `common/src/*` (source-only
  consumption — `common` is never built). **Backend source imports cross
  package boundaries via relative paths** (`../../..` to `common/src/...`)
  so compiled output runs under plain Node without alias support; the
  client keeps `@/` and `@common/` aliases (bundled by Vite, mapped in Jest).

### Architecture & import layers

`src/` in each package is layered; `arch/layers` + `arch/colocation` (local
plugin in `eslint.arch.js`, wired in `eslint.config.js`) make violations lint errors.

| Package | Levels (left can import right; upward imports are errors) |
| ------- | --------------------------------------------------------- |
| client  | `app` → `components` → `helpers` → `model` → `utils`      |
| backend | `app` → `controllers` → `model` → `utils`                 |
| common  | `entities` → `shared`                                     |

Rules (same as README «Архитектура: уровни и правила импортов»):

- Imports are allowed **down** (to a lower level) and from **one's own
  folder** (colocation). Same-level cross-folder imports are allowed in every
  layer — what is restricted is _depth_: from outside a folder you may
  only import the folder's **main file** (`<Name>/<Name>.*`, plus `index.*`)
  — styles, hooks, tables and other "innards" are internal to the folder.
  (In practice: always create a main file named after the folder.)
- **React**: no `react`/`react-dom` imports in `client` `helpers`/`model`/`utils`
  and `common`; no `.tsx` files imported into `client/src/helpers`.
- **Cross-package**: `client` and `backend` may import `common`; `common`
  must not import app packages, and `client` ⇄ `backend` imports are errors.
- **Colocation**: components/pages must live in their own folders — flat
  files directly in a level root are a lint error (exception: entry files in
  `client/src/app` and `backend/src/app`).

### Naming

- **camelCase** — file names (except React components) and identifiers:
  `routes.tsx`, `counterStore.ts`, `global.css.ts`. No dashes or underscores.
- **PascalCase** — component folders and files named after the component:
  the component file, its tests and styles:
  `Counter/Counter.tsx`, `Counter/Counter.test.tsx`, `Counter/Counter.css.ts`.
- A page's folder is named after its component
  (`app/pages/SettingsPage/SettingsPage.tsx`) — one rule for all React
  components (pages, layouts, components).
- Non-component folders use a main file that matches the folder
  (`stores/stores.ts`, `settingsApi/settingsApi.ts`, `api/api.ts`).
- Exception: `src/vite-env.d.ts` (Vite ecosystem convention) and root
  configs (`playwright.config.ts`, `jest.config.js`, …).

### Styling with vanilla-extract

- Style files are `*.css.ts` but are **imported with a `.css` extension**:
  `import { button } from './Counter.css';`
- Reuse design tokens through the theme contract
  (`client/src/components/theme/theme.css.ts` via its main `theme.ts`);
  don't hardcode colors that already exist as CSS variables.
- A component's styles live in the component's folder; cross-folder `*.css`
  imports must go through that folder's main file (see Architecture).
- `style()` doesn't support compound selectors (`&.active` is a type error) —
  compose separate style objects instead.
- Theme switching: `lightTheme`/`darkTheme` classes are applied to
  `document.documentElement` (effect in `RootLayout` + initial class in
  `main.tsx`), so theme variables cascade app-wide, including the 404 page
  (which renders outside the layout).

### Routing (TanStack Router, code-based)

- The route tree lives in `client/src/app/routes/routes.tsx`; `register` is
  declared so `Link`/`navigate` route paths are fully typed.
- `/` renders `IndexPage` (which renders `Counter`); 404 is `NotFound`
  (app/pages), the error UI is `ErrorBoundary` (components).
- The layout is a **pathless layout route** (`id: 'layout'`, no `path`) whose
  component (`RootLayout`) renders header + `<Outlet/>`. Page routes are its
  children. Switching layouts = declaring a second pathless layout route and
  attaching routes to it (see README "Layouts").
- 404: `notFoundComponent` on the root route (renders outside the layout).
  Errors: `errorComponent` on the root route.
- The default active state of `Link` is the `active` class; use
  `activeProps={{ className: ... }}` + `activeOptions={{ exact: true }}`.
- `createAppRouter(history?)` factory allows `createMemoryHistory()` in tests.

### State (Zustand)

- Stores live in `client/src/components/stores/` (`counterStore.ts`,
  `themeStore.ts`, barrel `stores.ts`); always select values via selector
  functions (`useStore((s) => s.x)`) — `eslint-plugin-zustand` bans
  destructuring (`zustand/no-destructure` configured with the store hook names).
- `useCounterStore` is **server-backed**: `load()`/`apply(action)` call the
  real API; the e2e/preview flows rely on it being deterministic (reset in
  `beforeEach`).

### Server state (TanStack Query) + forms (TanStack Form + zod)

- `QueryClient` is created once in `client/src/app/App.tsx` (module level —
  required by the `stable-query-client` rule); factory in
  `client/src/components/queryClient/queryClient.ts`.
- API functions (`getSettings`/`saveSettings`, `getCounter`/`sendCounterAction`)
  live in `client/src/helpers/*` and hit the real backend (`VITE_API_URL` or
  `http://localhost:3000`); contracts come from `common` (`@common/...`).
- TanStack Form validators accept Standard Schema objects directly:
  `validators: { onSubmit: settingsSchema }`.
- **`form.handleSubmit` does NOT call `preventDefault`** — attach it via
  `onSubmit={(e) => { e.preventDefault(); ...; form.handleSubmit(); }}`
  (see `SettingsPage.tsx`), otherwise the browser reloads the page.
- `field.state.meta.errors` for Standard Schema validators are issue objects
  (`{ message, path }`), not strings — map to `.message` when rendering.
- Field binding is manual (no `<field.Input/>`): `value={field.state.value}` +
  `field.handleChange(...)` + `field.handleBlur`.

### Backend layers (Fastify + Drizzle)

- `backend/src/app` wires everything: `db.ts` (PGlite vs `postgres://…`),
  `server.ts` (`createApp` builds Fastify, registers CORS and routes from
  `apiPaths`), `main.ts` (entry: create DB, create app, listen on
  `process.env.PORT ?? 3000`, host `0.0.0.0`).
- `controllers/*` = thin HTTP handlers (validation with common schemas +
  repository calls). They are intentionally not unit-tested; `server.test.ts`
  checks route wiring via `app.inject()` with fake repositories.
- `model/*` = repositories over Drizzle tables (`table.ts`); covered by
  unit tests against PGlite running the same `migrations/0001_init.sql`.
- Dev: `pnpm --filter backend dev` (tsx). Prod build: `tsc -p
tsconfig.build.json` → `node dist/backend/src/app/main.js` (start script).

### Code style

- Prettier: 100-char lines, single quotes, semicolons, trailing commas.
- ESLint 10 flat config with `typescript-eslint` + `react-hooks`
  (rules-of-hooks is an error, exhaustive-deps is a warning) plus the local
  arch rules, and the Tanstack/Zustand plugins.
- Prefer semantic selectors in tests: `getByRole`/`getByTestId` over CSS
  class names (classes are build artifacts of vanilla-extract).

### Testing

- Unit: Jest 30 + Testing Library; test files live next to sources
  (`*.test.tsx`). Client uses jsdom, backend uses node env (backend needs
  `NODE_OPTIONS=--experimental-vm-modules` — already in its test scripts for
  PGlite's dynamic imports).
- Network is **mocked in unit tests** (uncontrollable dependency) via
  `jest.mock('@/helpers/...')` with deterministic data (`'Гость'` etc.).
  E2E runs against the **real** backend + real (embedded) Postgres — only
  genuinely uncontrollable things may be mocked there; tests reset state
  through the API in `beforeEach`.
- Router tests: use `createMemoryHistory()` +
  `await waitFor(() => expect(router.state.isLoading).toBe(false))` (there is
  no `router.loadComplete` in this version; the initial render is empty until
  the first load settles). `RootLayout.test.tsx` follows the same pattern with
  its own minimal router — it must not import the real `routes.tsx` (colocation).
- `client/src/jest-setup.ts` polyfills `TextEncoder`/`TextDecoder` (jsdom
  lacks them; `@tanstack/router-core` SSR serializer needs them).
- E2E: Playwright, Chromium only, `fullyParallel: false`, `workers: 1`
  (shared persistent rows). `webServer` builds and serves the client and
  starts the backend automatically; do not start servers manually.
- Screenshot baselines are committed to git under
  `e2e/<spec>-snapshots/` and are **Linux-only** (suffix
  `-chromium-linux.png`): e2e runs in the official Playwright image both in
  CI and locally (`pnpm test:e2e`), so a single group of baselines suffices.
  After a UI change, regenerate with `pnpm test:e2e:update`.
  `pnpm test:e2e:ci` is CI-only (Linux) — do not run it on macOS.
- Screenshot tolerance: `maxDiffPixelRatio: 0.002`. Playwright only rewrites a
  baseline in `--update-snapshots` mode when the diff exceeds that tolerance —
  if a "changed" UI still matches within 0.2%, delete the baseline PNGs first
  to force regeneration.

### CI (GitHub Actions)

- Workflow: `.github/workflows/ci.yml`, triggered on push to `main` and on
  PRs. Jobs: `lint` (typecheck + eslint + prettier), `unit` (jest coverage),
  `build` (pnpm -r build), `e2e` (Playwright in the official image
  `mcr.microsoft.com/playwright:v1.64.1-noble` with a `postgres:16` service;
  `DATABASE_URL` env is set for it).
- Install pnpm with `pnpm/action-setup@v4` **before** `actions/setup-node`
  (version comes from `packageManager`), then setup-node with `cache: pnpm`
  — otherwise setup-node cannot find the pnpm binary when computing the cache
  key («Unable to locate executable file: pnpm»). Don't use manual
  `corepack enable/prepare` steps in the workflow. Installs with
  `pnpm install --frozen-lockfile` — **commit
  `pnpm-lock.yaml`** whenever dependencies change.
- Artifacts (7-day retention): `client/coverage/`, `backend/coverage/`,
  `client/dist/`, `backend/dist/`, `playwright-report/` + `test-results/`.

## Gotchas

- **pnpm install scripts**: pnpm ≥ 10 quarantines postinstall scripts by
  default. `pnpm-workspace.yaml` lists `allowBuilds: {esbuild: true,
'@parcel/watcher': true, unrs-resolver: true}` — keep it, or Vite/tsx lose
  their native binaries.
- **CI order**: pnpm must be installed before `actions/setup-node` runs with
  `cache: pnpm` (use `pnpm/action-setup@v4`; see «CI» above).
- **Playwright image parity**: the image tag in `scripts/e2e-docker.sh` and
  `ci.yml` must match the `@playwright/test` version — baselines are
  generated in that exact image.
- **e2e Docker volume**: `scripts/e2e-docker.sh` re-syncs the repo into the
  work volume with `rsync --delete` (stale files from other branches cannot
  break the in-container build, unlike the old yarn cache-volume flow).
- **`pnpm build` includes typecheck** — a build failure is often a type
  error, not a bundling error.
- **Backend compiled output must not use `@/` aliases**: Node doesn't know
  tsconfig paths. Keep `backend/src` imports relative (they can still cross
  into `common/src` via `../../..` — that is intentional and lint-approved).
- **PGlite/Postgres version**: `migrations/0001_init.sql` must work on both
  PGlite (embedded) and real Postgres ≥ 16.
- `.yarn/` and yarn leftovers are gone; `.gitignore` still mentions
  `.yarn/*` — harmless, keep or clean up deliberately.
