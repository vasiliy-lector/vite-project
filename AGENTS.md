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
├── main.tsx                  # Entry: providers (QueryClientProvider) + RouterProvider
├── router.tsx                # Code-based router: root + pathless layout route + pages
├── root-layout.tsx/.css.ts   # Layout component: header (nav + theme toggle) + <Outlet/>
├── settings-page.tsx/.css.ts # /settings: theme (store), TanStack Form + zod, Query demo
├── not-found.tsx/.css.ts     # Global 404 (root notFoundComponent)
├── error-boundary.tsx/.css.ts# Global error UI (root errorComponent)
├── counter-store.ts          # Zustand store: counter demo
├── theme-store.ts            # Zustand store: light/dark theme
├── query-client.ts           # QueryClient factory
├── mock-api.ts               # Local mock "API" (deterministic, offline)
├── vite-env.d.ts             # import.meta.env typing
├── styles/
│   ├── global.css.ts         # globalStyle (reset, font)
│   └── theme.css.ts          # createThemeContract + light/dark themes (CSS variables)
├── components/
│   ├── Counter.tsx           # Demo component backed by useCounterStore
│   ├── Counter.test.tsx      # Unit tests
│   └── counter.css.ts        # style() + theme variables
└── test/
    └── setup.ts              # TextEncoder polyfill + jest-dom + vanilla-extract
e2e/
├── counter.spec.ts           # Playwright tests + toHaveScreenshot
├── settings.spec.ts          # Playwright tests + toHaveScreenshot
└── <spec>-snapshots/         # Baseline PNGs (Linux only)
scripts/
└── e2e-docker.sh             # Runs e2e in the official Playwright image
```

Key config: `vite.config.ts` (React + vanilla-extract plugins, `@` alias),
`tsconfig.json` (strict, `@/*` paths), `tsconfig.jest.json` (CJS override for
Jest, inherits `paths`), `jest.config.js` (moduleNameMapper for `@/`),
`playwright.config.ts`, `eslint.config.js` (flat),
`.github/workflows/ci.yml`, `.env.example`.

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

### Styling with vanilla-extract

- Style files are `*.css.ts` but are **imported with a `.css` extension**:
  `import { button } from './counter.css';`
- Reuse design tokens through the theme contract (`src/styles/theme.css.ts`);
  don't hardcode colors that already exist as CSS variables.
- `style()` doesn't support compound selectors (`&.active` is a type error) —
  compose separate style objects instead.
- Theme switching: `lightTheme`/`darkTheme` classes are applied to
  `document.documentElement` (effect in `RootLayout` + initial class in
  `main.tsx`), so theme variables cascade app-wide, including the 404 page
  (which renders outside the layout).

### Routing (TanStack Router, code-based)

- The route tree lives in `src/router.tsx`; `register` is declared so
  `Link`/`navigate` route paths are fully typed.
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

- One store per concern, flat files in `src/` (`counter-store.ts`,
  `theme-store.ts`); always select values via selector functions
  (`useStore((s) => s.x)`) — `eslint-plugin-zustand` bans destructuring
  (rule `zustand/no-destructure` is configured with the store hook names).
- ESLint: official `@tanstack/eslint-plugin-query` and
  `@tanstack/eslint-plugin-router` flat configs are enabled.

### Server state (TanStack Query) + forms (TanStack Form + zod)

- `QueryClient` is created once in `main.tsx` (module level — required by the
  `stable-query-client` rule).
- TanStack Form validators accept Standard Schema objects directly:
  `validators: { onSubmit: z.object(...) }`.
- **`form.handleSubmit` does NOT call `preventDefault`** — attach it via
  `onSubmit={(e) => { e.preventDefault(); ...; form.handleSubmit(); }}`
  (see `settings-page.tsx`), otherwise the browser reloads the page.
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
  (`*.test.tsx`). Coverage excludes `src/main.tsx`.
- Router tests: use `createMemoryHistory()` +
  `await waitFor(() => expect(router.state.isLoading).toBe(false))`
  (there is no `router.loadComplete` in this version; the initial render is
  empty until the first load settles).
- `src/test/setup.ts` polyfills `TextEncoder`/`TextDecoder` (jsdom lacks them;
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
  generation is disabled in `src/test/setup.ts`. Don't switch to plain CSS
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
