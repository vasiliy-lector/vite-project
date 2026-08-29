import { Link } from '@tanstack/react-router';
import { container, link, title } from './not-found.css';

export function NotFoundPage() {
  return (
    <section className={container}>
      <h1 className={title}>Страница не найдена</h1>
      <Link to="/" className={link}>
        На главную
      </Link>
    </section>
  );
}