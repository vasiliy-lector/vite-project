import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { lightTheme } from './styles/theme.css';
import './styles/global.css';
import { createQueryClient } from './query-client';
import { router } from './router';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Не найден контейнер #root');
}

// Тема по умолчанию — светлая. Класс вешается на <html> ещё до рендера,
// чтобы CSS-переменные темы были доступны на всех страницах, включая 404
document.documentElement.classList.add(lightTheme);

const queryClient = createQueryClient();

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
