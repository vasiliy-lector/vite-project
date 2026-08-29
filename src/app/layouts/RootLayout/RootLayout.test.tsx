import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { lightTheme } from '@/components/shared/theme.css';
import { useThemeStore } from '@/components/shared/stores/themeStore';
import { RootLayout } from './RootLayout';

// Минимальный роутер для проверки layout (заглушки / и /settings):
// тестировать layout не требует полного приложения, а импорт
// app/router из app/layouts запрещён правилом уровней
function createTestRouter() {
  const rootRoute = createRootRoute();
  const layoutRoute = createRoute({
    getParentRoute: () => rootRoute,
    id: 'layout',
    component: RootLayout,
  });
  const dummyPage = () => <div data-testid="dummy-page" />;
  const homeRoute = createRoute({
    getParentRoute: () => layoutRoute,
    path: '/',
    component: dummyPage,
  });
  const settingsRoute = createRoute({
    getParentRoute: () => layoutRoute,
    path: '/settings',
    component: dummyPage,
  });

  const history = createMemoryHistory({ initialEntries: ['/'] });
  return createRouter({
    routeTree: rootRoute.addChildren([layoutRoute.addChildren([homeRoute, settingsRoute])]),
    history,
  });
}

function renderLayout() {
  const appRouter = createTestRouter();
  return { appRouter, ui: render(<RouterProvider router={appRouter} />) };
}

async function settle(appRouter: ReturnType<typeof createTestRouter>) {
  await waitFor(() => expect(appRouter.state.isLoading).toBe(false));
}

describe('RootLayout', () => {
  beforeEach(() => {
    useThemeStore.setState({ theme: 'light' });
  });

  it('показывает навигацию и кнопку темы', async () => {
    const { appRouter } = renderLayout();
    await settle(appRouter);

    expect(screen.getByRole('link', { name: 'Главная' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Настройки' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Тёмная тема' })).toBeInTheDocument();
  });

  it('переключает тему туда и обратно', async () => {
    const user = userEvent.setup();
    const { appRouter } = renderLayout();
    await settle(appRouter);

    await user.click(screen.getByRole('button', { name: 'Тёмная тема' }));
    expect(screen.getByRole('button', { name: 'Светлая тема' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Светлая тема' }));
    expect(screen.getByRole('button', { name: 'Тёмная тема' })).toBeInTheDocument();
  });

  it('вешает класс темы на <html>', async () => {
    renderLayout();
    await waitFor(() => expect(document.documentElement.classList.contains(lightTheme)).toBe(true));
  });
});
