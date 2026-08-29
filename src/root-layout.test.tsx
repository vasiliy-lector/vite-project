import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createMemoryHistory } from '@tanstack/react-router';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createQueryClient } from './query-client';
import { createAppRouter } from './router';
import { lightTheme } from './styles/theme.css';
import { useThemeStore } from './theme-store';

function renderApp() {
  const history = createMemoryHistory({ initialEntries: ['/'] });
  const appRouter = createAppRouter(history);
  const queryClient = createQueryClient();

  return {
    appRouter,
    ui: render(
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={appRouter} />
      </QueryClientProvider>,
    ),
  };
}

async function settle(appRouter: ReturnType<typeof createAppRouter>) {
  await waitFor(() => expect(appRouter.state.isLoading).toBe(false));
}

describe('RootLayout', () => {
  beforeEach(() => {
    useThemeStore.setState({ theme: 'light' });
  });

  it('показывает навигацию и кнопку темы', async () => {
    const { appRouter } = renderApp();
    await settle(appRouter);

    expect(screen.getByRole('link', { name: 'Главная' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Настройки' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Тёмная тема' })).toBeInTheDocument();
  });

  it('переключает тему туда и обратно', async () => {
    const user = userEvent.setup();
    const { appRouter } = renderApp();
    await settle(appRouter);

    await user.click(screen.getByRole('button', { name: 'Тёмная тема' }));
    expect(screen.getByRole('button', { name: 'Светлая тема' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Светлая тема' }));
    expect(screen.getByRole('button', { name: 'Тёмная тема' })).toBeInTheDocument();
  });

  it('вешает класс темы на <html>', async () => {
    renderApp();
    await waitFor(() => expect(document.documentElement.classList.contains(lightTheme)).toBe(true));
  });
});
