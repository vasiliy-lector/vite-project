import {
  type RouterHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router';
import { ErrorBoundary } from '@/components/plain/ErrorBoundary/ErrorBoundary';
import { IndexPage } from '@/app/pages/IndexPage/IndexPage';
import { NotFound } from '@/app/pages/NotFound/NotFound';
import { RootLayout } from '@/app/layouts/RootLayout/RootLayout';
import { SettingsPage } from '@/app/pages/SettingsPage/SettingsPage';

const rootRoute = createRootRoute({
  errorComponent: ({ error }) => <ErrorBoundary error={error} />,
  notFoundComponent: () => <NotFound />,
});

// Pathless layout-роут (id без path): его дети рендерятся внутри
// RootLayout. Чтобы добавить второй лейаут, создайте ещё один
// pathless layout-роут со своим компонентом и подвесите под него
// нужные маршруты (см. раздел «Layouts» в README).
const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'layout',
  component: RootLayout,
});

const homeRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/',
  component: IndexPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/settings',
  component: SettingsPage,
});

const routeTree = rootRoute.addChildren([layoutRoute.addChildren([homeRoute, settingsRoute])]);

export function createAppRouter(history?: RouterHistory) {
  return createRouter({
    routeTree,
    history,
  });
}

export const router = createAppRouter();

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
