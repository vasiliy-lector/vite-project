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
