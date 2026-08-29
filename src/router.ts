import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  type AnyRouter,
} from '@tanstack/react-router';
import { HomePage } from './home-page';
import { NotFoundPage } from './not-found-page';
import { RootLayout } from './root-layout';
import { SettingsPage } from './settings-page';

const rootRoute = createRootRoute();

const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'layout',
  component: RootLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/',
  component: HomePage,
});

const settingsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: 'settings',
  component: SettingsPage,
});

const notFoundRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '$',
  component: NotFoundPage,
});

const routeTree = rootRoute.addChildren([
  layoutRoute.addChildren([indexRoute, settingsRoute, notFoundRoute]),
]);

export const router = createRouter({ routeTree });

export function createMemoryRouter(initialEntry = '/'): AnyRouter {
  return createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initialEntry] }),
  });
}