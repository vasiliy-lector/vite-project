import {
  type RouterHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router';
import { Counter } from './components/Counter';
import { ErrorBoundary } from './error-boundary';
import { NotFound } from './not-found';
import { RootLayout } from './root-layout';
import { SettingsPage } from './settings-page';

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
  component: Counter,
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
