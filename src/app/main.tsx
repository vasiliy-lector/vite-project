import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { lightTheme } from '@/components/shared/theme.css';
import { App } from './App';
import './global.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Не найден контейнер #root');
}

// Тема по умолчанию — светлая. Класс вешается на <html> ещё до рендера,
// чтобы CSS-переменные темы были доступны на всех страницах, включая 404
document.documentElement.classList.add(lightTheme);

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
