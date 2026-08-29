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
