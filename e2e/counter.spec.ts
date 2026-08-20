import { expect, test } from '@playwright/test';

test.describe('Счётчик', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('изменяет счёт кнопками «Увеличить» и «Уменьшить»', async ({ page }) => {
    const value = page.getByTestId('counter-value');

    await expect(value).toHaveText('0');

    await page.getByRole('button', { name: 'Увеличить' }).click();
    await expect(value).toHaveText('1');

    await page.getByRole('button', { name: 'Увеличить' }).click();
    await expect(value).toHaveText('2');

    await page.getByRole('button', { name: 'Уменьшить' }).click();
    await expect(value).toHaveText('1');
  });

  test('сбрасывает счёт в ноль', async ({ page }) => {
    const value = page.getByTestId('counter-value');

    await page.getByRole('button', { name: 'Увеличить' }).click();
    await page.getByRole('button', { name: 'Увеличить' }).click();

    await page.getByRole('button', { name: 'Сбросить' }).click();

    await expect(value).toHaveText('0');
  });

  test('скриншоты состояний (light, light после клика, dark)', async ({ page }) => {
    await expect(page).toHaveScreenshot('counter-light.png', { fullPage: true });

    await page.getByRole('button', { name: 'Увеличить' }).click();
    await expect(page).toHaveScreenshot('counter-light-after-increase.png', {
      fullPage: true,
    });

    await page.getByRole('button', { name: 'Тёмная тема' }).click();
    await expect(page).toHaveScreenshot('counter-dark.png', { fullPage: true });
  });
});
