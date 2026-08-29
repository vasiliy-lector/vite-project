import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { createQueryClient } from '@/components/shared/queryClient';
import { router } from './router';

const queryClient = createQueryClient();

// Корневой компонент приложения: провайдеры TanStack Query и роутера.
// QueryClient создаётся один раз на модульном уровне (правило
// stable-query-client из @tanstack/eslint-plugin-query)
export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
