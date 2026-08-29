import { expect, test } from '@playwright/test';

test.describe('Настройки', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings');
  });

  test('загружает настройки из локального mock', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Настройки' })).toBeVisible();
    await expect(page.getByTestId('settings-loading')).toBeVisible();
    await expect(page.getByTestId('display-name')).toHaveValue('Гость');
  });

  test('сохраняет форму с новым именем', async ({ page }) => {
    await page.getByTestId('display-name').fill('Василий');
    await page.getByRole('button', { name: 'Сохранить' }).click();

    await expect(page.getByTestId('settings-saved')).toHaveText('Сохранено: Василий');
  });

  test('валидирует имя при сохранении', async ({ page }) => {
    await page.getByTestId('display-name').fill('В');
    await page.getByRole('button', { name: 'Сохранить' }).click();

    await expect(page.getByRole('alert')).toHaveText('Минимум 2 символа');
  });

  test('переключает тему со страницы настроек', async ({ page }) => {
    await page.getByRole('button', { name: 'Переключить тему' }).click();

    // Кнопка в хедере показывает целевую тему: в тёмной — «Светлая тема»
    await expect(page.getByRole('button', { name: 'Светлая тема' })).toBeVisible();
  });

  test('скриншот страницы (light)', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Сохранить' })).toBeVisible();
    await expect(page).toHaveScreenshot('settings-light.png', { fullPage: true });
  });
});
