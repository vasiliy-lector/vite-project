import { defineConfig, devices } from '@playwright/test';

const ci = !!process.env.CI;

export default defineConfig({
  testDir: './e2e',
  // Порядок и контент spec-файлов рассчитаны на одну (общую) БД:
  // тесты внутри файла идут последовательно и каждый сбрасывает своё
  // состояние через API, поэтому параллельные воркеры не нужны.
  fullyParallel: false,
  workers: 1,
  forbidOnly: ci,
  retries: ci ? 2 : 0,
  reporter: ci
    ? [
        ['html', { open: 'never' }],
        ['junit', { outputFile: 'test-results/junit.xml' }],
      ]
    : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
  },
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.002,
    },
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // В средах, где нельзя скачать браузеры Playwright (прокси),
        // можно указать системный Chromium: E2E_CHROMIUM_PATH=/usr/bin/chromium.
        // По умолчанию — браузер, установленный Playwright (CI и e2e-docker
        // используют official-образ с ним, поэтому и бейзлайны снимаются там же).
        ...(process.env.E2E_CHROMIUM_PATH
          ? { launchOptions: { executablePath: process.env.E2E_CHROMIUM_PATH } }
          : {}),
      },
    },
  ],
  webServer: [
    {
      command: 'pnpm --filter @vite-app/backend dev',
      url: 'http://localhost:3000/api/counter',
      reuseExistingServer: !ci,
      timeout: 120_000,
    },
    {
      command:
        'pnpm --filter @vite-app/client build && pnpm --filter @vite-app/client preview --port 4173',
      url: 'http://localhost:4173',
      reuseExistingServer: !ci,
      timeout: 180_000,
    },
  ],
});
