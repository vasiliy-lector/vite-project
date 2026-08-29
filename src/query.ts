import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient();

export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
}
