import { Link } from '@tanstack/react-router';
import { backLink, code, container, title } from './not-found.css';

// Глобальная 404-страница: подключается через notFoundComponent
// корневого маршрута (см. router.tsx)
export function NotFound() {
  return (
    <section className={container}>
      <p className={code}>404</p>
      <h1 className={title}>Страница не найдена</h1>
      <Link to="/" className={backLink}>
        На главную
      </Link>
    </section>
  );
}
