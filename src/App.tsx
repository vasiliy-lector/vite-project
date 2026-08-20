import { useState } from 'react';
import { app, themeToggle } from './app.css';
import { Counter } from './components/Counter';
import { darkTheme, lightTheme } from './styles/theme.css';

export function App() {
  const [isDark, setIsDark] = useState(false);

  return (
    <div className={`${app} ${isDark ? darkTheme : lightTheme}`}>
      <button
        type="button"
        className={themeToggle}
        onClick={() => setIsDark((dark) => !dark)}
        aria-pressed={isDark}
      >
        {isDark ? 'Светлая тема' : 'Тёмная тема'}
      </button>
      <Counter />
    </div>
  );
}
