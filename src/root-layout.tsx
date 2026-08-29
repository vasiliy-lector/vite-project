import { Link, Outlet } from '@tanstack/react-router';
import { app, header, main, nav, navLink, navLinkActive, themeToggle } from './root-layout.css';
import { darkTheme, lightTheme } from './styles/theme.css';
import { useThemeStore } from './theme-store';

export function RootLayout() {
  const isDark = useThemeStore((state) => state.isDark);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  return (
    <div className={`${app} ${isDark ? darkTheme : lightTheme}`}>
      <header className={header}>
        <nav className={nav} aria-label="Основная навигация">
          <Link
            to="/"
            activeOptions={{ exact: true }}
            activeProps={{ className: navLinkActive }}
            inactiveProps={{ className: navLink }}
          >
            Счётчик
          </Link>
          <Link
            to="/settings"
            activeProps={{ className: navLinkActive }}
            inactiveProps={{ className: navLink }}
          >
            Настройки
          </Link>
        </nav>
        <button type="button" className={themeToggle} onClick={toggleTheme}>
          {isDark ? 'Светлая тема' : 'Тёмная тема'}
        </button>
      </header>
      <main className={main}>
        <Outlet />
      </main>
    </div>
  );
}
