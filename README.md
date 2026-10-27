# vite-app

Стартер-монорепо: **pnpm workspaces** (`client` + `backend` + `common`),
**Vite 8** (Rolldown + Oxc) + **React 19.2** + **TypeScript 6** +
**vanilla-extract** на клиенте, **Fastify 5** + **Drizzle** + **Postgres**
на бэкенде.

## Стек

| Инструмент                      | Назначение                                                                   |
| ------------------------------- | ---------------------------------------------------------------------------- |
| pnpm 12                         | пакетный менеджер монорепо (`workspace:*`-связи, `pnpm-workspace.yaml`)      |
| Vite 8                          | dev-сервер и продакшен-сборка (клиент)                                       |
| React 19.2                      | UI                                                                           |
| TypeScript 6                    | типизация (`strict`, без deprecated-опций)                                   |
| TanStack Router                 | типизированный роутинг (code-based, pathless layout-роуты)                   |
| Zustand                         | глобальное состояние (мультисторы: `useCounterStore`, `useThemeStore`)       |
| TanStack Query                  | серверное состояние (кэш, инвалидация; реальные запросы к бэкенду)           |
| TanStack Form + zod             | формы с валидацией (Standard Schema); zod-контракты лежат в `common`         |
| vanilla-extract                 | CSS-in-TypeScript: стили компилируются в статический CSS на build-времени    |
| Fastify 5 + Drizzle ORM         | HTTP-API на бэкенде, схема таблиц в `backend/src/model`                      |
| Postgres 16 (docker) или PGlite | реальная БД: `docker compose up -d` **или** встроенный PGlite (по умолчанию) |
| Jest 30 + Testing Library       | unit-тесты (jsdom в клиенте, node в бэкенде)                                 |
| Playwright                      | e2e и скриншотные тесты (headless Chromium)                                  |
| ESLint 10 + Prettier            | линтинг (включая архитектурные правила) и форматирование                     |
| GitHub Actions                  | lint / unit / build / e2e                                                    |

## Требования

- Node.js >= 22.12 (Vite 8); рекомендуется 24 (см. `.nvmrc`)
- pnpm: `corepack enable && corepack prepare` (версия зафиксирована в
  `packageManager` корневого `package.json`)
- Если запускаете настоящую Postgres, а не PGlite: `docker compose up -d`
  (в `docker-compose.yml` образ `postgres:16`; миграции из
  `backend/migrations/` монтируются в `docker-entrypoint-initdb.d`)

## Как использовать как шаблон

1. Форкните репозиторий (или создайте новый проект на его основе).
2. Переименуйте пакеты в `package.json`-файлах (сейчас `@vite-app/*`).
3. Уберите демо: `client/src/app/pages/{IndexPage,SettingsPage}/`,
   `client/src/components/{Counter,stores,queryClient,theme}/`,
   `client/src/helpers/{settingsApi,counterApi,env}/`,
   `backend/src/{controllers,model}/*`, контракты в `common` — и
   соответствующие маршруты в `client/src/app/routes/routes.tsx`
   (структуру роутера и layout оставьте).
4. `pnpm install` — зависимости восстановятся по `pnpm-lock.yaml`.

## Быстрый старт

```bash
pnpm install                                   # установка зависимостей (из корня)
pnpm dev                                       # параллельно: клиент :5173 + бэкенд :3000 (PGlite)
# или по отдельности:
pnpm --filter client dev
pnpm --filter backend dev
# реальная Postgres вместо PGlite:
docker compose up -d
# и backend/.env: DATABASE_URL=postgres://postgres:postgres@localhost:5432/vite_app
```

## Скрипты (запускать из корня)

| Скрипт                              | Описание                                                                              |
| ----------------------------------- | ------------------------------------------------------------------------------------- |
| `pnpm dev`                          | dev-сервер клиента + бэкенд параллельно                                               |
| `pnpm build`                        | typecheck + сборка всех пакетов (`pnpm -r build`; бэкенд собирается в `backend/dist`) |
| `pnpm preview`                      | просмотр продакшен-сборки клиента (порт 4173)                                         |
| `pnpm typecheck`                    | `tsc --noEmit` во всех пакетах                                                        |
| `pnpm lint`                         | ESLint (включая архитектурные правила по всем пакетам)                                |
| `pnpm format` / `pnpm format:check` | Prettier                                                                              |
| `pnpm test`                         | unit-тесты (`pnpm -r test`: Jest в клиенте и бэкенде; common тестов не имеет)         |
| `pnpm test:coverage`                | unit-тесты с покрытием (per-package `coverage/`)                                      |
| `pnpm test:e2e`                     | e2e в официальном Playwright-образе (Linux, как в CI) — одна группа базлайнов         |
| `pnpm test:e2e:update`              | обновили UI? Пересоздать базлайны в том же образе                                     |
| `pnpm test:e2e:ci`                  | Playwright напрямую (без Docker); запускает webServer'ы сам                           |

## Структура

```
pnpm-workspace.yaml / docker-compose.yml / playwright.config.ts / eslint.arch.js
e2e/                                   # Playwright-тесты и скриншоты (в корне, вне пакетов)
├── counter.spec.ts / settings.spec.ts
└── *-snapshots/                       # Linux-базлайны скриншотов (в git)

common/src/                            # общие контракты (без React)
├── entities/settings/settings.ts      # zod-схема + DTO настроек
├── entities/counter/counter.ts        # схема/DTO счётчика + applyCounterAction
└── shared/api/api.ts                  # общие пути API

client/src/                            # уровня: app → components → helpers → model → utils
├── app/                               # точка входа
│   ├── main.tsx / App.tsx / global.css.ts
│   ├── routes/
│   │   ├── routes.tsx                 # роутер: дерево маршрутов, 404, error boundary
│   │   └── routes.test.tsx
│   ├── layouts/RootLayout/…           # хедер (нав + тема) + <Outlet />
│   └── pages/{IndexPage,SettingsPage,NotFound}/…
├── components/
│   ├── Counter/…                      # демо-компонент на сторе (персистентный счётчик)
│   ├── ErrorBoundary/…                # глобальный обработчик ошибок
│   ├── stores/                        # Zustand: counterStore, themeStore, stores.ts (barrel)
│   ├── queryClient/queryClient.ts     # фабрика QueryClient
│   └── theme/theme.css.ts             # createThemeContract + темы light/dark
├── helpers/
│   ├── env/env.ts                     # базовый URL API (VITE_API_URL)
│   ├── settingsApi/settingsApi.ts     # реальные запросы GET/PUT /api/settings
│   └── counterApi/counterApi.ts       # реальные запросы к /api/counter
├── model/                             # (пока пусто: чистая бизнес-логика без React)
└── utils/                             # (пока пусто)

backend/src/                           # уровня: app → controllers → model → utils
├── app/
│   ├── main.ts                        # точка входа: БД + сборка + listen
│   ├── server.ts                      # Fastify + регистрация роутов (по путям из common)
│   └── server.test.ts                 # проверка wiring через fastify.inject()
├── controllers/{settings,counter}/…   # тонкие HTTP-хендлеры (без unit-тестов)
├── model/{settings,counter}/…         # репозитории/логика; table.ts — схемы Drizzle
└── utils/db/db.ts                     # подключение: PGlite или node-postgres

backend/migrations/0001_init.sql       # схема + сид (применяется автоматически)
```

## Именование

- **camelCase** — имена файлов (кроме React-компонентов) и идентификаторы:
  `routes.tsx`, `counterStore.ts`, `global.css.ts`. Без дефисов и подчёркиваний.
- **PascalCase** — папки компонентов и файлы с именем компонента: файл,
  экспортирующий React-компонент, его тесты и стили — `Counter/Counter.tsx`,
  `Counter/Counter.test.tsx`, `Counter/Counter.css.ts`.
- У каждого модуля/папки должен быть **главный файл с именем папки**
  (`stores/stores.ts`, `settingsApi/settingsApi.ts`, `settings/settings.ts`) —
  только его можно импортировать снаружи папки (см. «Архитектура»).
- Исключение: `client/src/vite-env.d.ts` — экосистемная конвенция Vite.

## Архитектура: уровни и правила импортов

Каждый пакет делится на уровни. Импорты разрешены **только вниз** (в более
низкий уровень) и из **своей папки**; внутри одного уровня cross-folder
импорты разрешены, но наружу из папки доступен только главный файл
(`<Name>/<Name>.*`) или `index.*` — «кишки» (стили, хелперы, данные) видны
только из своей папки. Проверка — кастомное правило ESLint
(`eslint.arch.js`: `arch/layers`, `arch/colocation`), нарушение — ошибка при
`pnpm lint`.

| Пакет   | Уровни (слева — выше)                                |
| ------- | ---------------------------------------------------- |
| client  | `app` → `components` → `helpers` → `model` → `utils` |
| backend | `app` → `controllers` → `model` → `utils`            |
| common  | `entities` → `shared`                                |

Дополнительные правила:

- `model` и `utils` (и `helpers` в клиенте) не импортируют `react` /
  `react-dom`; в `helpers` запрещены `.tsx` (компоненты живут в `components`).
- Пакет `common` импортирует только свои исходники и внешние библиотеки;
  cross-импорты между `client`/`backend` запрещены; `common` доступен обоим
  через алиасы `@/*` (своё) и `@common/*`.
- Всё в слоях (кроме `src/app`) лежит в папках с главным файлом — плоские
  файлы в корне уровня запрещены.

## Роутинг (TanStack Router)

Маршруты объявлены код-базово в `client/src/app/routes/routes.tsx`:

```
root (errorComponent + notFoundComponent)
└── layout — pathless layout-роут (id без path) → RootLayout
    ├── /           → IndexPage (рендерит Counter: персистентный счётчик с бэкенда)
    └── /settings   → SettingsPage (тема из стора + форма TanStack Form + Query к /api/settings)
```

## Layouts

Компоновку страницы определяют layout-компоненты (сейчас один — `RootLayout`:
хедер с навигацией и переключателем темы + `<Outlet />`). Чтобы добавить
второй лейаут и переключаться между ними:

1. Создайте компонент (по образцу
   `client/src/app/layouts/RootLayout/RootLayout.tsx`) — например папку
   `client/src/app/layouts/BlankLayout/BlankLayout.tsx` (только `<Outlet />`).
2. В `client/src/app/routes/routes.tsx` добавьте второй pathless layout-роут:
   `createRoute({ getParentRoute: () => rootRoute, id: 'blank-layout', component: BlankLayout })`.
3. Подвесите нужные маршруты под новый лейаут:
   `blankLayoutRoute.addChildren([...])`.

Маршруты под разными layout-роутами живут на одних и тех же URL — «смена
лейаута» это и есть выбор layout-роута, под которым объявлен маршрут.

## Окружение

- `.env.example` в корне описывает переменные: скопируйте
  `VITE_API_URL` в `client/.env` (базовый URL бэкенда; по умолчанию
  `http://localhost:3000`), `DATABASE_URL`/`PORT` — в `backend/.env`
  (без `DATABASE_URL` бэкенд поднимает встроенную PGlite).
- Типизация клиентских env — в `client/src/vite-env.d.ts`.

## vanilla-extract

- Импорты стилей используют расширение `.css` (файл на самом деле `*.css.ts`):
  `import { button } from './Counter.css';`
- В dev/build стили обрабатывает `@vanilla-extract/vite-plugin`.
- В Jest — официальный `@vanilla-extract/jest-transform` (см.
  `client/jest.config.js`), а `disableRuntimeStyles` в
  `client/src/jest-setup.ts` отключает генерацию стилей в рантайме.
- Темы: `createThemeContract` задаёт контракт CSS-переменных, `createTheme` —
  значения для `light-theme` / `dark-theme`. Контракт токенов лежит в
  `client/src/components/theme/` (главный файл `theme.ts` реэкспортирует из
  `theme.css.ts` — наружу импортируется только он), globalStyle — в
  `client/src/app/global.css.ts`. Класс темы вешается на `<html>`
  (`useEffect` в `RootLayout` + первичный класс в `main.tsx`), поэтому
  переменные доступны даже на 404-странице, которая рендерится вне layout.
- Стиль компонента лежит в папке компонента, и `*.css` из других папок
  импортируется только из `components/theme/` (см. «Архитектура»).

## Тесты

### Unit (Jest 30)

- Клиент: `pnpm --filter client test` (jsdom; сеть в тестах мокается через
  `jest.mock('@/helpers/...')` — сетевые запросы неконтролируемы в unit-среде).
- Бэкенд: `pnpm --filter backend test` (node; в `model/*` тесты работают с
  реальной embedded-БД PGlite и тем же `0001_init.sql` — без моков drizzle;
  wiring проверяется в `server.test.ts` через `fastify.inject()`).
- Всё сразу: `pnpm test` (`pnpm -r test`).

### E2E и скриншоты (Playwright, headless Chromium)

`pnpm test:e2e` гоняет тесты в официальном Playwright-образе (Linux, как в CI);
`pnpm test:e2e:ci` — Playwright напрямую. Конфиг (`playwright.config.ts`) сам
поднимает бэкенд (`pnpm --filter backend dev`) и клиент (build + preview),
поэтому тесты идут против реального API и реальной БД.

Базовые скриншоты лежат в git в `e2e/<spec>-snapshots/` — только Linux
(суффикс имени `-chromium-linux.png`): e2e гоняется в официальном
Playwright-образе и в CI, и локально, поэтому одной группы базлайнов достаточно:

- запуск: `pnpm test:e2e` (тесты гоняются в образе, как в CI)
- пересоздать после изменения UI: `pnpm test:e2e:update`
- `pnpm test:e2e:ci` — только CI (Linux); внутри образа на macOS не запускать.

Порог различий: `maxDiffPixelRatio: 0.002` (см. `playwright.config.ts`).

## CI (GitHub Actions)

`.github/workflows/ci.yml` на GitHub-hosted раннерах (запуск: push в `main`
и pull request):

| Джоба   | Раннер                                                                       | Что делает                                                          |
| ------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `lint`  | ubuntu-latest, Node 24                                                       | typecheck + eslint + prettier check (из корня)                      |
| `unit`  | ubuntu-latest, Node 24                                                       | jest с coverage (артефакты `client/coverage/`, `backend/coverage/`) |
| `build` | ubuntu-latest, Node 24                                                       | сборка всех пакетов (артефакты `client/dist/`, `backend/dist/`)     |
| `e2e`   | контейнер mcr.microsoft.com/playwright:v1.64.1-noble + service `postgres:16` | `pnpm test:e2e:ci`; артефакты `playwright-report/`, `test-results/` |

Установка зависимостей — `pnpm install --frozen-lockfile` (lockfile должен
быть синхронизирован). Для e2e в контейнере версия образа Playwright должна
совпадать с версией `@playwright/test` в `package.json`.

## Важные детали

- **pnpm + install-скрипты**: `esbuild`, `@parcel/watcher`, `unrs-resolver`
  разрешены через `onlyBuiltDependencies`/`allowBuilds` в
  `pnpm-workspace.yaml` — не удаляйте эти записи, иначе Vite/tsx не соберутся.
- **`pnpm build` включает typecheck** — ошибка сборки часто оказывается ошибкой типов.
- **volume для e2e**: `scripts/e2e-docker.sh` делает чистую копию проекта в
  `/work` (`rsync --delete`) — протухшие файлы из других веток не ломают сборку.
- **PGlite vs Postgres**: по умолчанию бэкенд использует встроенную PGlite
  (подходит для demo/e2e). Для настоящей Postgres запустите `docker compose
up -d` и пропишите `DATABASE_URL` в `backend/.env`.
