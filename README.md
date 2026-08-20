# vite-app

Стартер: **Vite 8** (Rolldown + Oxc) + **React 19.2** + **TypeScript 6** + **vanilla-extract**.

## Стек

| Инструмент                | Назначение                                                                |
| ------------------------- | ------------------------------------------------------------------------- |
| Vite 8                    | dev-сервер и продакшен-сборка                                             |
| React 19.2                | UI                                                                        |
| TypeScript 6              | типизация (`strict`, без deprecated-опций)                                |
| vanilla-extract           | CSS-in-TypeScript: стили компилируются в статический CSS на build-времени |
| Jest 30 + Testing Library | unit-тесты (jsdom)                                                        |
| Playwright                | интеграционные и скриншотные тесты (headless Chromium)                    |
| ESLint 10 + Prettier      | линтинг и форматирование                                                  |
| Yarn 4 (Berry)            | пакетный менеджер (`nodeLinker: node-modules`)                            |
| GitLab CI                 | lint / unit / build / e2e                                                 |

## Требования

- Node.js >= 22.12 (Vite 8); рекомендуется 24 (см. `.nvmrc`)
- Yarn 4 предоставляется репозиторием: `.yarn/releases/yarn-4.18.0.cjs` (запускается автоматически через `yarnPath` из `.yarnrc.yml`; достаточно любого `yarn` в PATH)

> **Важно:** Yarn 4 по умолчанию не устанавливает npm-версии, опубликованные менее
> 24 часов назад (защита от supply-chain-атак, `npmMinimalAgeGate: 1440` минут).
> Если после `yarn up <пакет>` вы видите ошибку `YN0016: All versions ... are quarantined` —
> уберите нижнюю границу диапазона до более старой версии (например `^8.2.2` → `^8.2.1`)
> или дождитесь 24 часов.

## Быстрый старт

```bash
yarn            # установка зависимостей
yarn dev        # dev-сервер: http://localhost:5173
```

## Скрипты

| Скрипт                              | Описание                                                                             |
| ----------------------------------- | ------------------------------------------------------------------------------------ |
| `yarn dev`                          | dev-сервер Vite                                                                      |
| `yarn build`                        | typecheck + продакшен-сборка в `dist/`                                               |
| `yarn preview`                      | локальный просмотр сборки (порт 4173)                                                |
| `yarn typecheck`                    | `tsc --noEmit`                                                                       |
| `yarn lint`                         | ESLint                                                                               |
| `yarn format` / `yarn format:check` | Prettier                                                                             |
| `yarn test`                         | unit-тесты (Jest)                                                                    |
| `yarn test:coverage`                | unit-тесты с покрытием (lcov)                                                        |
| `yarn test:e2e`                     | Playwright: интеграционные + скриншотные тесты (собирает и поднимает `vite preview`) |
| `yarn test:e2e:update`              | обновили UI? Пересоздать базовые скриншоты                                           |

## Структура

```
src/
├── main.tsx                  # точка входа, импорт глобальных стилей
├── App.tsx                   # корень приложения, переключатель темы
├── app.css.ts                # layout приложения, кнопка переключения темы
├── styles/
│   ├── global.css.ts         # globalStyle (reset, шрифт)
│   └── theme.css.ts          # createThemeContract + темы light/dark (CSS-переменные)
├── components/
│   ├── Counter.tsx           # демо-компонент (UI на русском)
│   ├── Counter.test.tsx      # unit-тесты
│   └── counter.css.ts        # style() + переменные темы
└── test/
    └── setup.ts              # jest-dom + disableRuntimeStyles (vanilla-extract)
e2e/
└── counter.spec.ts           # интеграционные тесты + toHaveScreenshot
```

## vanilla-extract

- Импорты стилей используют расширение `.css` (файл на самом деле `*.css.ts`):
  `import { button } from './counter.css';`
- В dev/build стили обрабатывает `@vanilla-extract/vite-plugin`.
- В Jest — официальный `@vanilla-extract/jest-transform` (см. `jest.config.js`),
  а `disableRuntimeStyles` в `src/test/setup.ts` отключает генерацию стилей в рантайме.
- Темы: `createThemeContract` задаёт контракт CSS-переменных, `createTheme` — значения
  для `light-theme` / `dark-theme`. Класс темы вешается на корневой элемент в `App.tsx`.

## Тесты

### Unit (Jest 30, jsdom)

`yarn test`. Трансформация: `ts-jest` для `.ts/.tsx` (отдельный `tsconfig.jest.json`
под CJS-рантайм Jest) и `@vanilla-extract/jest-transform` для `*.css.ts`.

### E2E и скриншоты (Playwright, headless Chromium)

`yarn test:e2e` сам запускает `yarn build && yarn preview --port 4173` (см. `webServer`
в `playwright.config.ts`).

Базовые скриншоты лежат в git в `e2e/counter.spec.ts-snapshots/`. Имя файла включает
платформу (`-linux.png` / `-macos.png`), поэтому базлайны генерируются под каждую ОС:

- локально (macOS): `yarn test:e2e:update`
- под Linux (как в CI): `yarn test:e2e:update` в том же образе Playwright, что и в пайплайне

Порог различий: `maxDiffPixelRatio: 0.01` (см. `playwright.config.ts`).

## CI (GitLab)

`.gitlab-ci.yml` рассчитан на gitlab.com с Docker-раннерами:

| Джоба   | Образ                                      | Что делает                                                                    |
| ------- | ------------------------------------------ | ----------------------------------------------------------------------------- |
| `lint`  | node:24-alpine                             | typecheck + eslint + prettier check                                           |
| `unit`  | node:24-alpine                             | jest с coverage (артефакт `coverage/`)                                        |
| `build` | node:24-alpine                             | vite build (артефакт `dist/`)                                                 |
| `e2e`   | mcr.microsoft.com/playwright:v1.62.1-noble | playwright test; артефакты `playwright-report/`, `test-results/`, отчёт JUnit |

Установка зависимостей — `yarn install --immutable` (lockfile должен быть синхронизирован).
