import { RouterProvider } from '@tanstack/react-router';
import { ErrorBoundary } from './error-boundary';
import { router } from './router';

export function App() {
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}