# vite-app

Стартер: **Vite 8** (Rolldown + Oxc) + **React 19.2** + **TypeScript 6** + **vanilla-extract**.

## Стек

| Инструмент                | Назначение                                                                |
| ------------------------- | ------------------------------------------------------------------------- |
| Vite 8                    | dev-сервер и продакшен-сборка                                             |
| React 19.2                | UI                                                                        |
| TypeScript 6              | типизация (`strict`, без deprecated-опций)                                |
| TanStack Router           | типизированный роутинг (code-based, pathless layout-роуты)                |
| Zustand                   | глобальное состояние (мультисторы: `useCounterStore`, `useThemeStore`)    |
| TanStack Query            | серверное состояние (кэш, инвалидация)                                    |
| TanStack Form + zod       | формы с валидацией (Standard Schema)                                      |
| vanilla-extract           | CSS-in-TypeScript: стили компилируются в статический CSS на build-времени |
| Jest 30 + Testing Library | unit-тесты (jsdom)                                                        |
| Playwright                | интеграционные и скриншотные тесты (headless Chromium)                    |
| ESLint 10 + Prettier      | линтинг и форматирование                                                  |
| Yarn 4 (Berry)            | пакетный менеджер (`nodeLinker: node-modules`)                            |
| GitHub Actions            | lint / unit / build / e2e                                                 |

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

## Как использовать как шаблон

1. Форкните репозиторий (или создайте новый проект на его основе).
2. Переименуйте пакет в `package.json` (сейчас `vite-app`).
3. Уберите демо: `src/app/pages/IndexPage/`, `src/app/pages/SettingsPage/`,
   `src/components/complex/Counter/`, `src/components/shared/stores/`,
   `src/components/shared/queries/mockApi.ts` и соответствующие маршруты в
   `src/app/router.tsx` (структуру роутера и layout оставьте).
4. `yarn` — зависимости восстановятся по lockfile.

## Быстрый старт

```bash
yarn            # установка зависимостей
yarn dev        # dev-сервер: http://localhost:5173
```

## Роутинг (TanStack Router)

Маршруты объявлены код-базово в `src/app/router.tsx`:

```
root (errorComponent + notFoundComponent)
└── layout — pathless layout-роут (id без path) → RootLayout
    ├── /           → IndexPage (рендерит Counter — демо Zustand-стора)
    └── /settings   → SettingsPage (тема + форма + TanStack Query)
```

## Layouts

Компоновку страницы определяют layout-компоненты (сейчас один — `RootLayout`:
хедер с навигацией и переключателем темы + `<Outlet />`). Чтобы добавить
второй лейаут и переключаться между ними:

1. Создайте компонент (по образцу
   `src/app/layouts/RootLayout/RootLayout.tsx`) — например папку
   `src/app/layouts/BlankLayout/BlankLayout.tsx` (только `<Outlet />`).
2. В `src/app/router.tsx` добавьте второй pathless layout-роут:
   `createRoute({ getParentRoute: () => rootRoute, id: 'blank-layout', component: BlankLayout })`.
3. Подвесите нужные маршруты под новый лейаут:
   `blankLayoutRoute.addChildren([...])`.

Маршруты под разными layout-роутами живут на одних и тех же URL — «смена
лейаута» это и есть выбор layout-роута, под которым объявлен маршрут.

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
├── app/                                        # L1 app/common + layouts + pages
│   ├── main.tsx                                # точка входа: #root, класс темы, render <App/>
│   ├── App.tsx                                 # корень: QueryClientProvider + RouterProvider
│   ├── router.tsx / router.test.tsx            # роутер: дерево маршрутов, 404, error boundary
│   ├── global.css.ts                           # globalStyle (reset, шрифт)
│   ├── layouts/
│   │   └── RootLayout/
│   │       ├── RootLayout.tsx                  # layout: хедер (нав + тема) + Outlet
│   │       ├── RootLayout.css.ts
│   │       └── RootLayout.test.tsx             # рендерит layout с минимальным роутером
│   └── pages/
│       ├── IndexPage/
│       │   └── IndexPage.tsx                   # / → рендерит Counter
│       ├── SettingsPage/
│       │   ├── SettingsPage.tsx                # тема из стора, форма (TanStack Form + zod), query
│       │   ├── SettingsPage.test.tsx
│       │   └── SettingsPage.css.ts
│       └── NotFound/
│           ├── NotFound.tsx                    # глобальная 404-страница
│           └── NotFound.css.ts
├── components/
│   ├── complex/
│   │   └── Counter/
│   │       ├── Counter.tsx                     # демо-компонент на Zustand-сторе (UI на русском)
│   │       ├── Counter.test.tsx
│   │       └── Counter.css.ts
│   ├── plain/
│   │   └── ErrorBoundary/
│   │       ├── ErrorBoundary.tsx               # глобальный обработчик ошибок
│   │       ├── ErrorBoundary.test.tsx
│   │       └── ErrorBoundary.css.ts
│   └── shared/
│       ├── theme.css.ts                        # createThemeContract + темы light/dark
│       ├── queryClient.ts                      # фабрика QueryClient
│       ├── stores/
│       │   ├── counterStore.ts (+ .test.ts)    # Zustand-стор счётчика
│       │   └── themeStore.ts (+ .test.ts)      # Zustand-стор темы
│       └── queries/
│           └── mockApi.ts                      # локальный mock «API» (офлайн, детерминирован)
├── entities/                                   # сложная бизнес-логика (пока пусто)
├── utils/                                      # утилиты (пока пусто)
├── vite-env.d.ts                               # типизация import.meta.env
└── test/
    └── setup.ts                                # jest-dom + disableRuntimeStyles + TextEncoder-полифил
e2e/
├── counter.spec.ts           # интеграционные тесты + toHaveScreenshot
├── settings.spec.ts          # та же, для /settings
└── *-snapshots/              # Linux-базлайны скриншотов (в git)
```

## Именование

- **camelCase** — имена файлов (кроме React-компонентов) и идентификаторы:
  `router.tsx`, `counterStore.ts`, `global.css.ts`. Без дефисов и подчёркиваний.
- **PascalCase** — папки компонентов и файлы с именем компонента: файл,
  экспортирующий React-компонент, его тесты и стили —
  `Counter/Counter.tsx`, `Counter/Counter.test.tsx`, `Counter/Counter.css.ts`.
- Папка страницы называется как компонент страницы
  (`app/pages/SettingsPage/SettingsPage.tsx`) — одно правило для всех
  React-компонентов (pages, layouts, complex, plain).
- Исключение: `src/vite-env.d.ts` — экосистемная конвенция Vite.

## Архитектура: уровни и правила импортов

`src/` делится на уровни. Импорты разрешены **только вниз** (в более низкий
уровень), из **своей папки** (colocation) и — для уровней L1, L4, L6 — внутри
своего уровня. Проверка — кастомное правило ESLint
(`eslint.arch.js`: `arch/layers`, `arch/colocation`), нарушение — ошибка при
`yarn lint`.

| Уровень               | Папка                                    | Назначение                                                                                                                                                               |
| --------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| L1 app/common         | `src/app/` (кроме `pages/` и `layouts/`) | входные точки: `main.tsx`, `App.tsx`, `router.tsx`, `global.css.ts`                                                                                                      |
| L2 app/layouts        | `src/app/layouts/`                       | layout-компоненты, каждый в своей папке                                                                                                                                  |
| L3 app/pages          | `src/app/pages/`                         | страницы-компоненты, каждая в папке с именем компонента                                                                                                                  |
| L4 components/complex | `src/components/complex/`                | сложные компоненты (с бизнес-логикой и/или зависимостью от других компонентов)                                                                                           |
| L5 components/plain   | `src/components/plain/`                  | простые компоненты **без импортов других React-компонентов**; если другой компонент стал необходим — выносить в `complex`                                                |
| L6 components/shared  | `src/components/shared/`                 | общее для компонентов и страниц: токены темы, хуки, Zustand-сторы, reиспользуемые queries (подпапки `stores/`, `hooks/`, `queries/`; одиночный файл — прямо в `shared/`) |
| L7 entities           | `src/entities/`                          | сложная бизнес-логика без фреймворков; обязана покрываться unit-тестами                                                                                                  |
| L8 utils              | `src/utils/`                             | утилиты без бизнес-логики и без привязки к React                                                                                                                         |

Дополнительные правила:

- **Главный файл React-компонента**: извне папки компонента можно импортировать
  только главный файл — `<имя папки>/<имя папки>`; «кишки» (стили, хуки,
  подкомпоненты) доступны только из своей папки. React-компоненты живут в
  pages, layouts, complex, plain (в `app` как исключение — `App`).
- **Стили**: `*.css` из других папок/уровней можно импортировать только из
  `components/shared` (общие файлы, напр. `theme.css.ts`); из своей папки —
  без ограничений; для L1 (app/common) — в пределах уровня.
- **entities и utils**: запрещены импорты `react` и `react-dom`
  (чистый TypeScript).
- **Colocation**: страницы, layout-ы и компоненты (complex/plain) лежат в
  собственных папках — плоские файлы в корне уровня запрещены.

## Окружение

`.env.example` описывает переменные окружения (скопировать в `.env`):
доступны только с префиксом `VITE_`, типизация — в `src/vite-env.d.ts`.

## vanilla-extract

- Импорты стилей используют расширение `.css` (файл на самом деле `*.css.ts`):
  `import { button } from './Counter.css';`
- В dev/build стили обрабатывает `@vanilla-extract/vite-plugin`.
- В Jest — официальный `@vanilla-extract/jest-transform` (см. `jest.config.js`),
  а `disableRuntimeStyles` в `src/test/setup.ts` отключает генерацию стилей в рантайме.
- Темы: `createThemeContract` задаёт контракт CSS-переменных, `createTheme` — значения
  для `light-theme` / `dark-theme`. Контракт токенов лежит в
  `src/components/shared/theme.css.ts` (доступен всем уровням как общий файл
  `shared/`), globalStyle — в `src/app/global.css.ts`. Класс темы вешается на
  `<html>` (`useEffect` в `RootLayout` + первичный класс в `main.tsx`), поэтому
  переменные доступны даже на 404-странице, которая рендерится вне layout.
- Стиль компонента лежит в папке компонента, и `*.css` из других папок
  импортируется только из `components/shared` (см. «Архитектура»).

## Тесты

### Unit (Jest 30, jsdom)

`yarn test`. Трансформация: `ts-jest` для `.ts/.tsx` (отдельный `tsconfig.jest.json`
под CJS-рантайм Jest) и `@vanilla-extract/jest-transform` для `*.css.ts`.

### E2E и скриншоты (Playwright, headless Chromium)

`yarn test:e2e` сам запускает `yarn build && yarn preview --port 4173` (см. `webServer`
в `playwright.config.ts`).

Базовые скриншоты лежат в git в `e2e/<spec>-snapshots/` — только Linux
(суффикс имени `-chromium-linux.png`): e2e гоняется в официальном Playwright-образе
и в CI, и локально, поэтому одна группа базлайнов достаточно:

- запуск: `yarn test:e2e` (тесты гоняются в образе, как в CI)
- пересоздать после изменения UI: `yarn test:e2e:update`

Порог различий: `maxDiffPixelRatio: 0.002` (см. `playwright.config.ts`).

## CI (GitHub Actions)

`.github/workflows/ci.yml` на GitHub-hosted раннерах (запуск: push в `main` и pull request):

| Джоба   | Раннер                                               | Что делает                                                                    |
| ------- | ---------------------------------------------------- | ----------------------------------------------------------------------------- |
| `lint`  | ubuntu-latest, Node 24                               | typecheck + eslint + prettier check                                           |
| `unit`  | ubuntu-latest, Node 24                               | jest с coverage (артефакт `coverage/`)                                        |
| `build` | ubuntu-latest, Node 24                               | vite build (артефакт `dist/`)                                                 |
| `e2e`   | контейнер mcr.microsoft.com/playwright:v1.62.1-noble | playwright test; артефакты `playwright-report/`, `test-results/`, отчёт JUnit |

Установка зависимостей — `yarn install --immutable` (lockfile должен быть синхронизирован).
