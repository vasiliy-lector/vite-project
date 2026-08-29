import { Link, Outlet } from '@tanstack/react-router';
import { useEffect } from 'react';
import { header, layout, main, nav, navLink, navLinkActive, themeToggle } from './root-layout.css';
import { darkTheme, lightTheme } from './styles/theme.css';
import { useThemeStore } from './theme-store';

// Layout-компонент: определяет компоновку страницы (хедер с навигацией
// и переключателем темы + область контента). Чтобы добавить второй лейаут,
// создайте новый компонент по образцу этого и подвесите под него маршруты
// отдельным pathless layout-роутом (см. README).
export function RootLayout() {
  const themeMode = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  // Класс темы вешается на <html>, чтобы CSS-переменные были доступны
  // даже на 404-странице (она рендерится без layout)
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle(lightTheme, themeMode === 'light');
    root.classList.toggle(darkTheme, themeMode === 'dark');
  }, [themeMode]);

  return (
    <div className={layout}>
      <header className={header}>
        <nav className={nav} aria-label="Основная навигация">
          <Link
            to="/"
            className={navLink}
            activeProps={{ className: navLinkActive }}
            activeOptions={{ exact: true }}
          >
            Главная
          </Link>
          <Link to="/settings" className={navLink} activeProps={{ className: navLinkActive }}>
            Настройки
          </Link>
        </nav>
        <button type="button" className={themeToggle} onClick={toggleTheme}>
          {themeMode === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
        </button>
      </header>
      <main className={main}>
        <Outlet />
      </main>
    </div>
  );
}
