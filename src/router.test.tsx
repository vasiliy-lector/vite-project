import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createMemoryHistory } from '@tanstack/react-router';
import { render, screen, waitFor } from '@testing-library/react';
import { createQueryClient } from './query-client';
import { createAppRouter } from './router';

function renderApp(initialPath = '/') {
  const history = createMemoryHistory({ initialEntries: [initialPath] });
  const appRouter = createAppRouter(history);

  const queryClient = createQueryClient();

  const ui = render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={appRouter} />
    </QueryClientProvider>,
  );

  return { appRouter, ui };
}

async function settle(appRouter: ReturnType<typeof createAppRouter>) {
  await waitFor(() => expect(appRouter.state.isLoading).toBe(false));
}

describe('роутер', () => {
  it('рендерит главную страницу с layout по умолчанию', async () => {
    const { appRouter } = renderApp('/');
    await settle(appRouter);

    expect(screen.getByRole('heading', { name: 'Счётчик' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Настройки' })).toBeInTheDocument();
  });

  it('рендерит страницу настроек после навигации', async () => {
    const { appRouter } = renderApp('/');
    await settle(appRouter);

    await appRouter.navigate({ to: '/settings' });
    await settle(appRouter);

    expect(screen.getByRole('heading', { name: 'Настройки' })).toBeInTheDocument();
    // Данные подтягиваются из локального mock
    const input = await screen.findByTestId('display-name');
    expect(input).toHaveValue('Гость');
  });

  it('рендерит 404-страницу для неизвестного маршрута', async () => {
    const { appRouter } = renderApp('/');
    await settle(appRouter);

    // history.push обходит типизацию маршрутов — для теста 404
    appRouter.history.push('/nope');
    await settle(appRouter);

    expect(screen.getByRole('heading', { name: 'Страница не найдена' })).toBeInTheDocument();
  });
});
