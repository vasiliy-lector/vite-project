# Starter: Router + State + Layouts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prepare `vite-app` as a universal starter: TanStack Router (code-based, explicit layout route), Zustand (two independent stores), TanStack Query (provider + local mock demo), TanStack Form + zod (settings form), ESLint plugins, path alias `@/`, typed env, ErrorBoundary + 404, docs — all with Russian UI.

**Architecture:** Code-based TanStack Router with a pathless layout route (`id: 'layout'`) rendering `RootLayout` (header with nav + theme toggle + `Outlet`). Pages: `/` (counter on `useCounterStore`), `/settings` (theme is global via `useThemeStore`; form on TanStack Form + zod field schemas; TanStack Query demo on a local mock). Flat file structure: new files live at the `src/` root next to `App.tsx`, store for Counter lives next to `Counter.tsx`. No new folders.

**Tech Stack:** React 19.2, Vite 8, TypeScript 6, vanilla-extract, TanStack Router 1.170.x, Zustand 5.0.x, TanStack Query 5.102.x, TanStack Form 1.33.x, zod 4.5.x, Jest 30, Playwright 1.62, Yarn 4.

**Spec:** decisions from the grilling session (2026-08-29): universal starter light-by-default; code-based routing; two stores; Query with provider + small local-mock example; TanStack Form + zod 4; ESLint = 2 official TanStack plugins + community zustand; alias `@/`; ErrorBoundary + 404; typed env; README (RU) + AGENTS.md updates; name stays `vite-app`; flat structure; no LICENSE; no git hooks / PWA / i18n; native layout route with one explicit `RootLayout` (switchability documented, not dead UI); e2e baselines regenerated + new settings spec.

## Global Constraints

- UI text, aria labels, test descriptions: **Russian** everywhere.
- Prettier: 100-char lines, single quotes, semicolons, trailing commas.
- TS `strict` + `noUnusedLocals` + `noUnusedParameters` + `verbatimModuleSyntax`. TypeScript pinned `^6.0.2` — never upgrade to 7.
- vanilla-extract: style files are `*.css.ts`, **imported with `.css` extension**. Jest uses `@vanilla-extract/jest-transform`; runtime styles disabled in `src/test/setup.ts`.
- Yarn 4 (Berry), `nodeLinker: node-modules`: commit `yarn.lock` with every dependency change. npm age gate: versions published < 24 h are quarantined (`YN0016`) — if `yarn add` fails, lower the range floor (e.g. `^4.5.1` → `^4.4.0`), do not disable the gate.
- e2e screenshot baselines are Linux-only, generated in the official Playwright image via `yarn test:e2e:update` / `yarn test:e2e`. Never run `yarn test:e2e:ci` on macOS.
- No new folders under `src/` (flat layout by decision). Package name stays `vite-app`. No LICENSE file.
- Before declaring any task done: `yarn typecheck && yarn lint` must pass (plus `yarn format:check` at the final gate).

## File Map

Create:

- `src/theme-store.ts` — `useThemeStore` (isDark, toggleTheme) + `resetThemeStore`
- `src/components/counter-store.ts` — `useCounterStore` (count, increment, decrement, reset) + `resetCounterStore`
- `src/components/counter-store.test.ts`
- `src/theme-store.test.ts`
- `src/router.ts` — code-based route tree (root → pathless layout → `/`, `settings`, `*`), `router`, `createMemoryRouter`
- `src/router.test.tsx`
- `src/root-layout.tsx` — explicit layout entity: header (nav + theme toggle) + `Outlet`
- `src/root-layout.css.ts`
- `src/home-page.tsx` — renders `Counter`
- `src/settings-page.tsx` — form (TanStack Form + zod) + TanStack Query demo
- `src/settings-page.test.tsx`
- `src/settings.css.ts`
- `src/settings-api.ts` — local mock fetch
- `src/not-found-page.tsx`, `src/not-found.css.ts`
- `src/error-boundary.tsx`, `src/error-boundary.test.tsx`
- `src/query.ts` — `queryClient`, `createTestQueryClient`
- `src/vite-env.d.ts`
- `.env.example`
- `e2e/settings.spec.ts`

Modify:

- `package.json` (deps + devDeps), `yarn.lock`
- `eslint.config.js` (3 plugins), `tsconfig.json` (paths), `vite.config.ts` (alias), `jest.config.js` (moduleNameMapper)
- `src/App.tsx` (ErrorBoundary + RouterProvider), `src/main.tsx` (QueryClientProvider)
- `src/components/Counter.tsx` (store), `src/components/Counter.test.tsx`
- Delete: `src/app.css.ts` (styles move to `root-layout.css.ts`)
- `README.md`, `AGENTS.md`
- e2e baselines `e2e/counter.spec.ts-snapshots/*` (regenerated)

---

### Task 1: Toolchain — dependencies, ESLint plugins, path alias, typed env

**Files:**

- Modify: `package.json`, `yarn.lock`, `eslint.config.js`, `tsconfig.json`, `vite.config.ts`, `jest.config.js`
- Create: `src/vite-env.d.ts`, `.env.example`

**Interfaces:**

- Produces: working `@/` alias in Vite + Jest + tsc; ESLint flat configs for `@tanstack/query/*` and `@tanstack/router/*` rules; typed `import.meta.env`.

- [ ] **Step 1: Install runtime dependencies**

```bash
yarn add @tanstack/react-router@^1.170.32 @tanstack/react-query@^5.102.8 @tanstack/react-form@^1.33.5 zustand@^5.0.15 zod@^4.5.1
```

Expected: success, `yarn.lock` updated. If `YN0016: ... quarantined` appears for any package, lower that range floor to an older release and retry.

- [ ] **Step 2: Install ESLint plugin devDependencies**

```bash
yarn add -D @tanstack/eslint-plugin-query@^5.102.8 @tanstack/eslint-plugin-router@^1.162.0 eslint-plugin-zustand@^1.0.2
```

- [ ] **Step 3: Wire ESLint plugins (flat config)**

Replace `eslint.config.js` with:

```js
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import query from '@tanstack/eslint-plugin-query';
import router from '@tanstack/eslint-plugin-router';
import zustand from 'eslint-plugin-zustand';

export default tseslint.config(
  {
    ignores: ['dist', 'coverage', 'playwright-report', 'test-results', '.yarn', 'node_modules'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks },
    languageOptions: { globals: { ...globals.browser } },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  ...query.configs['flat/recommended'],
  ...router.configs['flat/recommended'],
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { zustand },
    rules: {
      'zustand/no-destructure': ['warn', { hooks: ['useCounterStore', 'useThemeStore'] }],
    },
  },
  {
    files: [
      'e2e/**/*.ts',
      'vite.config.ts',
      'playwright.config.ts',
      'jest.config.js',
      'eslint.config.js',
    ],
    languageOptions: { globals: { ...globals.node } },
  },
  prettier,
);
```

Facts: `@tanstack/eslint-plugin-query` exports `configs['flat/recommended']` (array) with plugin key `@tanstack/query`; `@tanstack/eslint-plugin-router` exports `configs['flat/recommended']` with plugin key `@tanstack/router`. `zustand/no-destructure` **requires** the `hooks` option (array of hook names) to check anything.

- [ ] **Step 4: Path alias in tsconfig.json**

Add to `compilerOptions`:

```json
"baseUrl": ".",
"paths": {
  "@/*": ["./src/*"]
},
```

`tsconfig.jest.json` extends `tsconfig.json` and inherits `paths` — no change needed there (Jest runtime resolution comes from Step 6).

- [ ] **Step 5: Path alias in vite.config.ts**

```ts
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), vanillaExtractPlugin()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
  },
  preview: {
    port: 4173,
  },
});
```

- [ ] **Step 6: Path alias in jest.config.js**

Add to the exported config object:

```js
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/src/$1',
},
```

- [ ] **Step 7: Typed env**

Create `src/vite-env.d.ts`:

```ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

Create `.env.example`:

```
# Примеры переменных окружения Vite (prefix VITE_)
VITE_API_URL=http://localhost:3000
```

- [ ] **Step 8: Verify**

```bash
yarn typecheck && yarn lint
```

Expected: both pass.

- [ ] **Step 9: Commit**

```bash
git add package.json yarn.lock eslint.config.js tsconfig.json vite.config.ts jest.config.js src/vite-env.d.ts .env.example
git commit -m "chore: add TanStack Router/Query/Form, zustand, zod, ESLint plugins, path alias, typed env"
```

---

### Task 2: Zustand stores (theme + counter) with unit tests

**Files:**

- Create: `src/theme-store.ts`, `src/theme-store.test.ts`, `src/components/counter-store.ts`, `src/components/counter-store.test.ts`

**Interfaces:**

- Produces: `useThemeStore: isDark: boolean, toggleTheme: () => void`; `resetThemeStore(): void`; `useCounterStore: count: number, increment, decrement, reset`; `resetCounterStore(): void`.

- [ ] **Step 1: Write failing tests**

`src/theme-store.test.ts`:

```ts
import { resetThemeStore, useThemeStore } from '@/theme-store';

describe('useThemeStore', () => {
  beforeEach(() => {
    resetThemeStore();
  });

  it('по умолчанию светлая тема', () => {
    expect(useThemeStore.getState().isDark).toBe(false);
  });

  it('переключает тему туда и обратно', () => {
    useThemeStore.getState().toggleTheme();
    expect(useThemeStore.getState().isDark).toBe(true);
    useThemeStore.getState().toggleTheme();
    expect(useThemeStore.getState().isDark).toBe(false);
  });
});
```

`src/components/counter-store.test.ts`:

```ts
import { resetCounterStore, useCounterStore } from '@/components/counter-store';

describe('useCounterStore', () => {
  beforeEach(() => {
    resetCounterStore();
  });

  it('начальное значение равно 0', () => {
    expect(useCounterStore.getState().count).toBe(0);
  });

  it('увеличивает значение', () => {
    useCounterStore.getState().increment();
    useCounterStore.getState().increment();
    expect(useCounterStore.getState().count).toBe(2);
  });

  it('уменьшает значение', () => {
    useCounterStore.getState().decrement();
    expect(useCounterStore.getState().count).toBe(-1);
  });

  it('сбрасывает значение в ноль', () => {
    useCounterStore.getState().increment();
    useCounterStore.getState().reset();
    expect(useCounterStore.getState().count).toBe(0);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
yarn test theme-store counter-store
```

Expected: FAIL (modules not found).

- [ ] **Step 3: Implement stores**

`src/theme-store.ts`:

```ts
import { create } from 'zustand';

type ThemeState = {
  isDark: boolean;
  toggleTheme: () => void;
};

export const useThemeStore = create<ThemeState>()((set) => ({
  isDark: false,
  toggleTheme: () => set((state) => ({ isDark: !state.isDark })),
}));

export function resetThemeStore(): void {
  useThemeStore.setState({ isDark: false }, true);
}
```

`src/components/counter-store.ts`:

```ts
import { create } from 'zustand';

type CounterState = {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
};

export const useCounterStore = create<CounterState>()((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}));

export function resetCounterStore(): void {
  useCounterStore.setState({ count: 0 }, true);
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
yarn test theme-store counter-store
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/theme-store.ts src/theme-store.test.ts src/components/counter-store.ts src/components/counter-store.test.ts
git commit -m "feat: add zustand stores for theme and counter"
```

---

### Task 3: Counter component on useCounterStore

**Files:**

- Modify: `src/components/Counter.tsx`, `src/components/Counter.test.tsx`

**Interfaces:**

- Consumes: `useCounterStore` selectors (Task 2).
- Produces: `Counter` without props (state comes from the global store).

- [ ] **Step 1: Update the component tests (failing)**

Replace `src/components/Counter.test.tsx` with:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { resetCounterStore, useCounterStore } from './counter-store';
import { Counter } from './Counter';

describe('Counter', () => {
  beforeEach(() => {
    resetCounterStore();
  });

  it('показывает начальное значение 0', () => {
    render(<Counter />);
    expect(screen.getByTestId('counter-value')).toHaveTextContent('0');
    expect(screen.getByTestId('counter-value')).toHaveAttribute('aria-live', 'polite');
  });

  it('увеличивает значение по кнопке «Увеличить»', async () => {
    const user = userEvent.setup();
    render(<Counter />);

    await user.click(screen.getByRole('button', { name: 'Увеличить' }));
    await user.click(screen.getByRole('button', { name: 'Увеличить' }));

    expect(screen.getByTestId('counter-value')).toHaveTextContent('2');
  });

  it('уменьшает значение по кнопке «Уменьшить»', async () => {
    const user = userEvent.setup();
    render(<Counter />);

    await user.click(screen.getByRole('button', { name: 'Уменьшить' }));

    expect(screen.getByTestId('counter-value')).toHaveTextContent('-1');
  });

  it('сбрасывает значение по кнопке «Сбросить»', async () => {
    const user = userEvent.setup();
    render(<Counter />);

    await user.click(screen.getByRole('button', { name: 'Увеличить' }));
    await user.click(screen.getByRole('button', { name: 'Увеличить' }));
    await user.click(screen.getByRole('button', { name: 'Сбросить' }));

    expect(screen.getByTestId('counter-value')).toHaveTextContent('0');
  });

  it('показывает значение из стора', () => {
    useCounterStore.setState({ count: 5 }, true);
    render(<Counter />);

    expect(screen.getByTestId('counter-value')).toHaveTextContent('5');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
yarn test Counter
```

Expected: FAIL (component still uses local state / prop signature mismatch).

- [ ] **Step 3: Rewrite the component on the store (selector pattern — no destructuring, per `zustand/no-destructure`)**

Replace `src/components/Counter.tsx` with:

```tsx
import { button, container, controls, title, value } from './counter.css';
import { useCounterStore } from './counter-store';

export function Counter() {
  const count = useCounterStore((state) => state.count);
  const increment = useCounterStore((state) => state.increment);
  const decrement = useCounterStore((state) => state.decrement);
  const reset = useCounterStore((state) => state.reset);

  return (
    <section className={container}>
      <h1 className={title}>Счётчик</h1>
      <p className={value} data-testid="counter-value" aria-live="polite">
        {count}
      </p>
      <div className={controls}>
        <button type="button" className={button} onClick={decrement}>
          Уменьшить
        </button>
        <button type="button" className={button} onClick={reset}>
          Сбросить
        </button>
        <button type="button" className={button} onClick={increment}>
          Увеличить
        </button>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
yarn test
```

Expected: PASS (all suites).

- [ ] **Step 5: Commit**

```bash
git add src/components/Counter.tsx src/components/Counter.test.tsx
git commit -m "refactor: move counter state to zustand store"
```

---

### Task 4: Router, explicit layout route, pages, 404, ErrorBoundary

**Files:**

- Create: `src/router.ts`, `src/router.test.tsx`, `src/root-layout.tsx`, `src/root-layout.css.ts`, `src/home-page.tsx`, `src/settings-page.tsx`, `src/not-found-page.tsx`, `src/not-found.css.ts`, `src/error-boundary.tsx`, `src/error-boundary.test.tsx`
- Modify: `src/App.tsx`, `src/main.tsx`
- Delete: `src/app.css.ts` (its `app`/`themeToggle` styles move to `root-layout.css.ts`)
- Create: `src/query.ts` (needed by main.tsx in this task)

**Interfaces:**

- Consumes: `useThemeStore` (Task 2), `Counter` (Task 3).
- Produces: `router` (browser history), `createMemoryRouter(initialEntry?: string)`; `queryClient`, `createTestQueryClient()`; `RootLayout`, `HomePage`, `SettingsPage`, `NotFoundPage`, `ErrorBoundary`. In this task `SettingsPage` renders heading + empty form placeholder (Task 5 fills it).

- [ ] **Step 1: Write failing router + error-boundary tests**

`src/router.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { RouterProvider } from '@tanstack/react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { resetCounterStore } from './components/counter-store';
import { createTestQueryClient } from './query';
import { createMemoryRouter } from './router';
import { resetThemeStore } from './theme-store';

function renderRouter(initialEntry: string) {
  const router = createMemoryRouter(initialEntry);
  return render(
    <QueryClientProvider client={createTestQueryClient()}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}

describe('router', () => {
  beforeEach(() => {
    resetCounterStore();
    resetThemeStore();
  });

  it('показывает счётчик на главной', async () => {
    renderRouter('/');
    expect(await screen.findByRole('heading', { name: 'Счётчик' })).toBeVisible();
  });

  it('показывает страницу настроек по /settings', async () => {
    renderRouter('/settings');
    expect(await screen.findByRole('heading', { name: 'Настройки' })).toBeVisible();
  });

  it('показывает 404 для неизвестных маршрутов', async () => {
    renderRouter('/nope');
    expect(await screen.findByRole('heading', { name: 'Страница не найдена' })).toBeVisible();
  });
});
```

`src/error-boundary.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from './error-boundary';

function Bomb() {
  throw new Error('boom');
}

describe('ErrorBoundary', () => {
  it('перехватывает ошибку рендера', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Что-то пошло не так');
    spy.mockRestore();
  });

  it('рендерит детей, если ошибки нет', () => {
    render(
      <ErrorBoundary>
        <p>ок</p>
      </ErrorBoundary>,
    );
    expect(screen.getByText('ок')).toBeVisible();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
yarn test router error-boundary
```

Expected: FAIL (modules not found).

- [ ] **Step 3: Implement router with explicit pathless layout route**

`src/router.ts`:

```ts
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  type Router,
} from '@tanstack/react-router';
import { HomePage } from './home-page';
import { NotFoundPage } from './not-found-page';
import { RootLayout } from './root-layout';
import { SettingsPage } from './settings-page';

const rootRoute = createRootRoute();

const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'layout',
  component: RootLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/',
  component: HomePage,
});

const settingsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: 'settings',
  component: SettingsPage,
});

const notFoundRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '*',
  component: NotFoundPage,
});

const routeTree = rootRoute.addChildren([
  layoutRoute.addChildren([indexRoute, settingsRoute, notFoundRoute]),
]);

export const router = createRouter({ routeTree });

export function createMemoryRouter(initialEntry = '/'): Router {
  return createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initialEntry] }),
  });
}
```

- [ ] **Step 4: Implement RootLayout (header + theme toggle + Outlet) and its styles**

`src/root-layout.css.ts`:

```ts
import { style } from '@vanilla-extract/css';
import { theme } from './styles/theme.css';

export const app = style({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  background: theme.colorBackground,
  color: theme.colorText,
});

export const header = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 24px',
  borderBottom: `1px solid ${theme.colorCardBorder}`,
});

export const nav = style({
  display: 'flex',
  gap: 16,
});

export const navLink = style({
  fontSize: 14,
  color: theme.colorMuted,
  textDecoration: 'none',
});

export const navLinkActive = style({
  fontSize: 14,
  color: theme.colorText,
  fontWeight: 600,
  textDecoration: 'none',
});

export const themeToggle = style({
  padding: '8px 16px',
  fontSize: 14,
  fontFamily: 'inherit',
  border: `1px solid ${theme.colorCardBorder}`,
  borderRadius: theme.borderRadius,
  background: 'transparent',
  color: theme.colorMuted,
  cursor: 'pointer',
  ':hover': {
    color: theme.colorText,
  },
});

export const main = style({
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 32,
});
```

`src/root-layout.tsx`:

```tsx
import { Link, Outlet } from '@tanstack/react-router';
import { app, header, main, nav, navLink, navLinkActive, themeToggle } from './root-layout.css';
import { darkTheme, lightTheme } from './styles/theme.css';
import { useThemeStore } from './theme-store';

export function RootLayout() {
  const isDark = useThemeStore((state) => state.isDark);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  return (
    <div className={`${app} ${isDark ? darkTheme : lightTheme}`}>
      <header className={header}>
        <nav className={nav} aria-label="Основная навигация">
          <Link
            to="/"
            activeOptions={{ exact: true }}
            activeProps={{ className: navLinkActive }}
            inactiveProps={{ className: navLink }}
          >
            Счётчик
          </Link>
          <Link
            to="/settings"
            activeProps={{ className: navLinkActive }}
            inactiveProps={{ className: navLink }}
          >
            Настройки
          </Link>
        </nav>
        <button type="button" className={themeToggle} onClick={toggleTheme}>
          {isDark ? 'Светлая тема' : 'Тёмная тема'}
        </button>
      </header>
      <main className={main}>
        <Outlet />
      </main>
    </div>
  );
}
```

Delete `src/app.css.ts` (styles now live in `root-layout.css.ts`).

- [ ] **Step 5: Implement pages, error boundary, query client**

`src/home-page.tsx`:

```tsx
import { Counter } from './components/Counter';

export function HomePage() {
  return <Counter />;
}
```

`src/settings-page.tsx` (intermediate version — heading only; Task 5 fills the form):

```tsx
import { box, heading } from './settings.css';

export function SettingsPage() {
  return (
    <section className={box}>
      <h1 className={heading}>Настройки</h1>
    </section>
  );
}
```

`src/settings.css.ts` (create now, used by Task 5 too):

```ts
import { style } from '@vanilla-extract/css';
import { theme } from './styles/theme.css';

export const box = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  width: '100%',
  maxWidth: 480,
  padding: '24px 32px',
  border: `1px solid ${theme.colorCardBorder}`,
  borderRadius: theme.borderRadius,
});

export const heading = style({
  margin: 0,
  fontSize: 24,
  fontWeight: 600,
});

export const heading2 = style({
  margin: 0,
  fontSize: 18,
  fontWeight: 600,
});

export const fieldStyle = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
});

export const input = style({
  padding: '8px 12px',
  fontSize: 16,
  fontFamily: 'inherit',
  border: `1px solid ${theme.colorCardBorder}`,
  borderRadius: theme.borderRadius,
  background: 'transparent',
  color: theme.colorText,
});

export const error = style({
  fontSize: 14,
  color: '#ef4444',
});

export const button = style({
  padding: '10px 20px',
  fontSize: 16,
  fontFamily: 'inherit',
  border: 'none',
  borderRadius: theme.borderRadius,
  background: theme.colorButtonBackground,
  color: theme.colorButtonText,
  cursor: 'pointer',
  ':hover': {
    opacity: 0.9,
  },
});

export const saved = style({
  margin: 0,
  fontSize: 14,
  color: theme.colorMuted,
});
```

`src/not-found.css.ts`:

```ts
import { style } from '@vanilla-extract/css';
import { theme } from './styles/theme.css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 16,
});

export const title = style({
  margin: 0,
  fontSize: 24,
  fontWeight: 600,
});

export const link = style({
  fontSize: 16,
  color: theme.colorCounter,
  fontWeight: 600,
  textDecoration: 'none',
});
```

`src/not-found-page.tsx`:

```tsx
import { Link } from '@tanstack/react-router';
import { container, link, title } from './not-found.css';

export function NotFoundPage() {
  return (
    <section className={container}>
      <h1 className={title}>Страница не найдена</h1>
      <Link to="/" className={link}>
        На главную
      </Link>
    </section>
  );
}
```

`src/error-boundary.tsx`:

```tsx
import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  error: Error | null;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error(error, info.componentStack);
  }

  render() {
    if (this.state.error !== null) {
      return (
        <div role="alert">
          <p>Что-то пошло не так.</p>
          <button type="button" onClick={() => this.setState({ error: null })}>
            Попробовать снова
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

`src/query.ts`:

```ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient();

export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
}
```

- [ ] **Step 6: Wire App + main**

Replace `src/App.tsx` with:

```tsx
import { RouterProvider } from '@tanstack/react-router';
import { ErrorBoundary } from './error-boundary';
import { router } from './router';

export function App() {
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}
```

Replace `src/main.tsx` with:

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { App } from './App';
import { queryClient } from './query';
import './styles/global.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Не найден контейнер #root');
}

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);
```

- [ ] **Step 7: Run tests to verify they pass**

```bash
yarn test
yarn typecheck
```

Expected: all PASS. (Router smoke tests use the canonical `createMemoryHistory` + `findByText` pattern.)

- [ ] **Step 8: Commit**

```bash
git add src/
git rm src/app.css.ts
git commit -m "feat: add tanstack router with explicit layout route, 404, error boundary"
```

---

### Task 5: TanStack Form + zod settings form and TanStack Query demo

**Files:**

- Modify: `src/settings-page.tsx`
- Create: `src/settings-api.ts`, `src/settings-page.test.tsx`

**Interfaces:**

- Consumes: `createTestQueryClient` (Task 4), `settings.css` (Task 4).
- Produces: `fetchRemoteSettings(): Promise<RemoteSettings>` (`RemoteSettings = { requests: number; lastUpdate: string }`); `SettingsPage` with a validated form (Имя, Возраст) + query block.

- [ ] **Step 1: Write failing tests**

`src/settings-page.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClientProvider } from '@tanstack/react-query';
import { createTestQueryClient } from './query';
import { SettingsPage } from './settings-page';

function renderSettings() {
  return render(
    <QueryClientProvider client={createTestQueryClient()}>
      <SettingsPage />
    </QueryClientProvider>,
  );
}

describe('SettingsPage', () => {
  it('показывает ошибку валидации на коротком имени', async () => {
    const user = userEvent.setup();
    renderSettings();

    await user.type(screen.getByLabelText('Имя'), 'А');

    expect(await screen.findByText('Имя: минимум 2 символа')).toBeVisible();
  });

  it('сохраняет форму при валидных значениях', async () => {
    const user = userEvent.setup();
    renderSettings();

    await user.type(screen.getByLabelText('Имя'), 'Василий');
    await user.click(screen.getByRole('button', { name: 'Сохранить' }));

    expect(await screen.findByTestId('settings-saved')).toBeVisible();
  });

  it('загружает данные через TanStack Query', async () => {
    renderSettings();

    expect(await screen.findByTestId('query-data')).toHaveTextContent('42');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
yarn test settings-page
```

Expected: FAIL (form/query not implemented yet).

- [ ] **Step 3: Implement local mock API**

`src/settings-api.ts`:

```ts
export type RemoteSettings = {
  requests: number;
  lastUpdate: string;
};

export function fetchRemoteSettings(): Promise<RemoteSettings> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ requests: 42, lastUpdate: '2026-08-29' });
    }, 300);
  });
}
```

- [ ] **Step 4: Implement the settings page**

Replace `src/settings-page.tsx` with:

```tsx
import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { fetchRemoteSettings } from './settings-api';
import { box, button, error, fieldStyle, heading, heading2, input, saved } from './settings.css';

const usernameSchema = z.string().min(2, 'Имя: минимум 2 символа');
const ageSchema = z.coerce
  .number()
  .int('Возраст: введите целое число')
  .min(1, 'Возраст: минимум 1')
  .max(120, 'Возраст: максимум 120');

function errorText(error: unknown): string {
  if (typeof error === 'string') return error;
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String(error.message);
  }
  return String(error);
}

export function SettingsPage() {
  const [isSaved, setIsSaved] = useState(false);

  const form = useForm({
    defaultValues: {
      username: '',
      age: 18,
    },
    onSubmit: () => {
      setIsSaved(true);
    },
  });

  const { data, isPending } = useQuery({
    queryKey: ['remote-settings'],
    queryFn: fetchRemoteSettings,
  });

  return (
    <section className={box}>
      <h1 className={heading}>Настройки</h1>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void form.handleSubmit(event);
        }}
      >
        <form.Field name="username" validators={{ onChange: usernameSchema }}>
          {(field) => (
            <label className={fieldStyle}>
              Имя
              <input
                className={input}
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
                onBlur={field.handleBlur}
              />
              {field.state.meta.isTouched && field.state.meta.errors.length > 0 ? (
                <em className={error}>{field.state.meta.errors.map(errorText).join(', ')}</em>
              ) : null}
            </label>
          )}
        </form.Field>
        <form.Field name="age" validators={{ onChange: ageSchema }}>
          {(field) => (
            <label className={fieldStyle}>
              Возраст
              <input
                className={input}
                type="number"
                value={field.state.value}
                onChange={(event) => field.handleChange(Number(event.target.value))}
                onBlur={field.handleBlur}
              />
              {field.state.meta.isTouched && field.state.meta.errors.length > 0 ? (
                <em className={error}>{field.state.meta.errors.map(errorText).join(', ')}</em>
              ) : null}
            </label>
          )}
        </form.Field>
        <div>
          <button type="submit" className={button}>
            Сохранить
          </button>
        </div>
        {isSaved ? (
          <p data-testid="settings-saved" className={saved}>
            Сохранено
          </p>
        ) : null}
      </form>
      <h2 className={heading2}>Данные (TanStack Query)</h2>
      <p data-testid="query-data">{isPending ? 'Загрузка…' : `Заявки: ${data.requests}`}</p>
    </section>
  );
}
```

Notes:

- TanStack Form natively accepts Standard Schema objects in `validators` (zod 4 conforms) — no adapter needed.
- If `tsc` reports a type mismatch for `validators` (schema vs function) or `field.state.meta.errors` entries are typed as plain `string[]`, simplify `errorText` to `error.message` / `.join(', ')` accordingly and re-verify — the runtime shape for form-level standard schema issues is `{ message }` objects mapped to fields.

- [ ] **Step 5: Run tests to verify they pass**

```bash
yarn test
yarn typecheck
```

Expected: all PASS.

- [ ] **Step 6: Commit**

```bash
git add src/settings-page.tsx src/settings-page.test.tsx src/settings-api.ts
git commit -m "feat: settings form on tanstack form + zod and query demo on local mock"
```

---

### Task 6: E2E — settings spec + baseline regeneration (Linux image)

**Files:**

- Create: `e2e/settings.spec.ts`
- Regenerate: `e2e/counter.spec.ts-snapshots/*`, new `e2e/settings.spec.ts-snapshots/*`

**Interfaces:**

- Consumes: built app (webServer builds automatically), testids `counter-value`, `settings-saved`, `query-data`; Russian button/link names.

- [ ] **Step 1: Write the settings e2e spec**

`e2e/settings.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

test.describe('Настройки', () => {
  test('переходит на страницу настроек через навигацию', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Настройки' }).click();
    await expect(page.getByRole('heading', { name: 'Настройки' })).toBeVisible();
  });

  test('заполняет и сохраняет форму', async ({ page }) => {
    await page.goto('/settings');
    await page.getByLabel('Имя').fill('Василий');
    await page.getByRole('button', { name: 'Сохранить' }).click();
    await expect(page.getByTestId('settings-saved')).toBeVisible();
  });

  test('показывает 404 для неизвестных маршрутов', async ({ page }) => {
    await page.goto('/nope');
    await expect(page.getByRole('heading', { name: 'Страница не найдена' })).toBeVisible();
  });

  test('скриншоты страницы настроек (light, dark)', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.getByTestId('query-data')).toContainText('42');
    await expect(page).toHaveScreenshot('settings-light.png', { fullPage: true });

    await page.getByRole('button', { name: 'Тёмная тема' }).click();
    await expect(page).toHaveScreenshot('settings-dark.png', { fullPage: true });
  });
});
```

`e2e/counter.spec.ts` — no code change (theme button still exists, now in the layout header); only its baselines change.

- [ ] **Step 2: Regenerate baselines in the official Playwright image (Linux)**

```bash
yarn test:e2e:update
```

Expected: builds the app, runs Playwright with `--update-snapshots` inside `mcr.microsoft.com/playwright:v1.62.1-noble`; new PNGs written for both specs. Do not run on macOS directly (baselines are Linux-only).

- [ ] **Step 3: Verify e2e passes**

```bash
yarn test:e2e
```

Expected: all tests PASS against the regenerated baselines.

- [ ] **Step 4: Commit**

```bash
git add e2e/
git commit -m "test: e2e settings spec, nav, 404, screenshots; regenerate baselines"
```

---

### Task 7: Docs — README (Russian) + AGENTS.md

**Files:**

- Modify: `README.md`, `AGENTS.md`

**Interfaces:** none (docs only).

- [ ] **Step 1: Update README.md (Russian)**

- Title line: keep `# vite-app`; subtitle becomes «Стартер для новых проектов: **Vite 8** + **React 19.2** + **TypeScript 6** + **vanilla-extract** + **TanStack Router** + **Zustand** + **TanStack Query** + **TanStack Form**».
- Stack table: add rows — TanStack Router (роутинг, code-based), Zustand (глобальное состояние, мультисторы), TanStack Query (серверное состояние: кэш, инвалидация), TanStack Form + zod (формы с валидацией Standard Schema).
- Structure block: reflect new files (`router.ts`, `root-layout.tsx/.css.ts`, `home-page.tsx`, `settings-page.tsx/.css.ts`, `settings-api.ts`, `not-found-page.tsx/.css.ts`, `error-boundary.tsx`, `query.ts`, `theme-store.ts`, `vite-env.d.ts`, `components/counter-store.ts`; delete `app.css.ts`).
- New section «Как использовать как шаблон»: fork/clone, сменить имя пакета, удалить или переработать демо-страницы, команды для старта.
- New section «Лейауты»: layout-роут — отдельная сущность (pathless-роут `id: 'layout'` + компонент `RootLayout`); демо содержит один лейаут; чтобы добавить второй — создать pathless-роут со своим компонентом и переподключить под него нужные страницы (код-пример 5 строк).
- Add to Tests section: e2e now covers two pages (`counter.spec.ts`, `settings.spec.ts`).

- [ ] **Step 2: Update AGENTS.md (English, agent-facing)**

- Project Overview: mention TanStack Router (code-based, explicit layout route), Zustand, TanStack Query, TanStack Form + zod.
- Project Structure: add new files; remove `app.css.ts`; note flat structure convention (new top-level files live at `src/` root next to `App.tsx`; Counter store lives next to `Counter.tsx`).
- Conventions: add — stores are per-concern files exposing a `useXStore` hook + `resetXStore` test helper, selector access (no destructuring, `zustand/no-destructure`); layouts are explicit pathless routes (`id`) whose component owns page composition; pages are thin route components; ESLint now includes `@tanstack/eslint-plugin-query`, `@tanstack/eslint-plugin-router`, `eslint-plugin-zustand` (flat).
- Gotchas: zod 4 Standard Schema works in TanStack Form `validators` without adapters; `zustand/no-destructure` rule requires the `hooks` option — extend the list in `eslint.config.js` when adding stores.

- [ ] **Step 3: Verify formatting**

```bash
yarn format:check
```

Expected: PASS (run `yarn format` first if Prettier reformats docs tables).

- [ ] **Step 4: Commit**

```bash
git add README.md AGENTS.md
git commit -m "docs: document new stack, starter usage, layout pattern"
```

---

### Task 8: Final gate

- [ ] **Step 1: Run the full verification suite**

```bash
yarn typecheck && yarn lint && yarn format:check && yarn test && yarn build
```

Expected: all PASS. (Build includes typecheck; e2e was verified in Task 6 — rerun `yarn test:e2e` only if UI changed since.)

- [ ] **Step 2: Fix any failures, re-run the failing gate, commit**

```bash
git add -A
git commit -m "chore: finalize starter (router + state + layouts)"
```

- [ ] **Step 3: Sanity-check the demo manually**

```bash
yarn dev
```

Check http://localhost:5173: `/` — counter (store-driven), header nav + theme toggle; `/settings` — form validation (short name → error, submit → «Сохранено»), query block shows «Заявки: 42» after ~300 ms; `/nope` — «Страница не найдена». Theme toggle works from any page (global store).
