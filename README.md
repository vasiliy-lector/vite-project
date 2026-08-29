# vite-app

Стартер для новых проектов: **Vite 8** (Rolldown + Oxc) + **React 19.2** +
**TypeScript 6** + **vanilla-extract** + **TanStack Router** + **Zustand** +
**TanStack Query** + **TanStack Form**.

## Стек

| Инструмент                | Назначение                                                                   |
| ------------------------- | ---------------------------------------------------------------------------- |
| Vite 8                    | dev-сервер и продакшен-сборка                                                |
| React 19.2                | UI                                                                           |
| TypeScript 6              | типизация (`strict`, без deprecated-опций)                                   |
| vanilla-extract           | CSS-in-TypeScript: стили компилируются в статический CSS на build-времени    |
| TanStack Router           | роутинг: code-based маршруты, layout-роуты, 404                              |
| Zustand                   | глобальное состояние: независимые сторы (`useThemeStore`, `useCounterStore`) |
| TanStack Query            | серверное состояние: кэш, инвалидация, ретраи                                |
| TanStack Form + zod       | формы с валидацией (Standard Schema, без адаптеров)                          |
| Jest 30 + Testing Library | unit-тесты (jsdom)                                                           |
| Playwright                | интеграционные и скриншотные тесты (headless Chromium)                       |
| ESLint 10 + Prettier      | линтинг и форматирование                                                     |
| Yarn 4 (Berry)            | пакетный менеджер (`nodeLinker: node-modules`)                               |
| GitHub Actions            | lint / unit / build / e2e                                                    |

## Требования

- Node.js >= 22.12 (Vite 8); рекомендуется 24 (см. `.nvmrc`)
- Yarn 4 предоставляется репозиторием: `.yarn/releases/yarn-4.18.0.cjs` (запускается автоматически через `yarnPath` из `.yarnrc.yml`; достаточно любого `yarn` в PATH)

> **Важно:** Yarn 4 по умолчанию не устанавливает npm-версии, опубликованные менее
> 24 часов назад (защита от supply-chain-атак, `npmMinimalAgeGate: 1440` минут).
> Если после `yarn up <пакет>` вы видите ошибку `YN0016: All versions ... are quarantined` —
> уберите нижнюю границу диапазона до более старой версии (например `^8.2.2` → `^8.2.1`)
> или дождитесь 24 часов.

> **Важно:** TypeScript намеренно зафиксирован на 6-й версии (`^6.0.2`).
> Не обновляйте его до TypeScript 7 до выхода версии 7.1: в TS 7.0
> (нативный компилятор на Go) отсутствует JS API, который нужен
> вспомогательным инструментам (`typescript-eslint`, `ts-jest`).
> Поддержка JS API ожидается в 7.1.

## Быстрый старт

```bash
yarn            # установка зависимостей
yarn dev        # dev-сервер: http://localhost:5173
```

## Как использовать как шаблон

1. Скопируйте (форкните) репозиторий.
2. `yarn` — установка зависимостей.
3. Смените `name` в `package.json` на имя своего проекта.
4. Уберите или переработайте демо: страницы `home-page.tsx` / `settings-page.tsx`,
   сторы, e2e-спеки и базлайны скриншотов (`e2e/*.spec.ts-snapshots/`).
5. Маршруты — в `src/router.ts`, лейаут — в `src/root-layout.tsx` (см. «Роутинг и лейауты»).

## Скрипты

| Скрипт                              | Описание                                                                        |
| ----------------------------------- | ------------------------------------------------------------------------------- |
| `yarn dev`                          | dev-сервер Vite                                                                 |
| `yarn build`                        | typecheck + продакшен-сборка в `dist/`                                          |
| `yarn preview`                      | локальный просмотр сборки (порт 4173)                                           |
| `yarn typecheck`                    | `tsc --noEmit`                                                                  |
| `yarn lint`                         | ESLint                                                                          |
| `yarn format` / `yarn format:check` | Prettier                                                                        |
| `yarn test`                         | unit-тесты (Jest)                                                               |
| `yarn test:coverage`                | unit-тесты с покрытием (lcov)                                                   |
| `yarn test:e2e`                     | e2e в официальном Playwright-образе (Linux, как в CI) — одна группа базлайнов   |
| `yarn test:e2e:update`              | обновили UI? Пересоздать базлайны в том же образе                               |
| `yarn test:e2e:ci`                  | Playwright напрямую (без Docker): только CI (Linux), используется внутри образа |

## Структура

```
src/
├── main.tsx                  # точка входа: QueryClientProvider + App
├── App.tsx                   # корень приложения: ErrorBoundary + RouterProvider
├── router.ts                 # code-based дерево маршрутов, layout-роут, 404
├── root-layout.tsx           # лейаут: хедер (навигация + тема) + Outlet
├── root-layout.css.ts        # стили лейаута
├── home-page.tsx             # страница «/» — счётчик
├── settings-page.tsx         # страница «/settings» — форма (TanStack Form + zod)
├── settings.css.ts           # стили настроек
├── settings-api.ts           # локальный mock для демо-запроса (TanStack Query)
├── not-found-page.tsx        # страница 404
├── not-found.css.ts          # стили 404
├── error-boundary.tsx        # ErrorBoundary (перехват ошибок рендера)
├── theme-store.ts            # Zustand-стор темы (isDark, toggleTheme)
├── query.ts                  # QueryClient (приложение + тесты)
├── vite-env.d.ts             # типизация import.meta.env
├── styles/
│   ├── global.css.ts         # globalStyle (reset, шрифт)
│   └── theme.css.ts          # createThemeContract + темы light/dark (CSS-переменные)
├── components/
│   ├── Counter.tsx           # демо-компонент, состояние — в useCounterStore
│   ├── counter-store.ts      # Zustand-стор счётчика
│   ├── counter.css.ts        # style() + переменные темы
│   └── *.test.ts(x)          # unit-тесты рядом с исходниками
└── test/
    └── setup.ts              # jest-dom + disableRuntimeStyles + TextEncoder/ReadableStream
e2e/
├── counter.spec.ts           # интеграционные тесты счётчика + toHaveScreenshot
└── settings.spec.ts          # навигация, форма, 404, скриншоты
```

## vanilla-extract

- Импорты стилей используют расширение `.css` (файл на самом деле `*.css.ts`):
  `import { button } from './counter.css';`
- В dev/build стили обрабатывает `@vanilla-extract/vite-plugin`.
- В Jest — официальный `@vanilla-extract/jest-transform` (см. `jest.config.js`),
  а `disableRuntimeStyles` в `src/test/setup.ts` отключает генерацию стилей в рантайме.
- Темы: `createThemeContract` задаёт контракт CSS-переменных, `createTheme` — значения
  для `light-theme` / `dark-theme`. Класс темы вешает `RootLayout` (см. «Роутинг и лейауты»).

## Роутинг и лейауты

Маршруты — **code-based** в `src/router.ts` (без file-based кодагена). Лейаут —
отдельная сущность: pathless-роут (`id: 'layout'`) с компонентом, который определяет
компоновку страницы. В демо один лейаут — `RootLayout` (`src/root-layout.tsx`):
хедер с навигацией и переключателем темы + `Outlet`, под ним страницы.

Чтобы добавить второй лейаут (например, без хедера), создайте pathless-роут со своим
компонентом и переподключите под него нужные страницы:

```ts
const blankLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'blankLayout',
  component: BlankLayout,
});
const aboutRoute = createRoute({ getParentRoute: () => blankLayoutRoute, path: 'about' });
```

Маршрут 404 — catch-all со splat-путём `'`$`' (в `src/router.ts`); legacy `*` не работал на закреплённой версии роутера.

## Тесты

### Unit (Jest 30, jsdom)

`yarn test`. Трансформация: `ts-jest` для `.ts/.tsx` (отдельный `tsconfig.jest.json`
под CJS-рантайм Jest) и `@vanilla-extract/jest-transform` для `*.css.ts`.

### E2E и скриншоты (Playwright, headless Chromium)

`yarn test:e2e` сам запускает `yarn build && yarn preview --port 4173` (см. `webServer`
в `playwright.config.ts`).

Базовые скриншоты лежат в git в `e2e/counter.spec.ts-snapshots/` и
`e2e/settings.spec.ts-snapshots/` — только Linux (суффикс имени
`-chromium-linux.png`): e2e гоняется в официальном Playwright-образе и в CI, и
локально, поэтому одна группа базлайнов достаточно:

- запуск: `yarn test:e2e` (тесты гоняются в образе, как в CI)
- пересоздать после изменения UI: `yarn test:e2e:update`

Порог различий: `maxDiffPixelRatio: 0.01` (см. `playwright.config.ts`).

## CI (GitHub Actions)

`.github/workflows/ci.yml` на GitHub-hosted раннерах (запуск: push в `main` и pull request):

| Джоба   | Раннер                                               | Что делает                                                                    |
| ------- | ---------------------------------------------------- | ----------------------------------------------------------------------------- |
| `lint`  | ubuntu-latest, Node 24                               | typecheck + eslint + prettier check                                           |
| `unit`  | ubuntu-latest, Node 24                               | jest с coverage (артефакт `coverage/`)                                        |
| `build` | ubuntu-latest, Node 24                               | vite build (артефакт `dist/`)                                                 |
| `e2e`   | контейнер mcr.microsoft.com/playwright:v1.62.1-noble | playwright test; артефакты `playwright-report/`, `test-results/`, отчёт JUnit |

Установка зависимостей — `yarn install --immutable` (lockfile должен быть синхронизирован).
