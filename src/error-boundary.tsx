import { button, container, message, title } from './error-boundary.css';

type ErrorBoundaryProps = {
  error: Error;
};

// Глобальный обработчик ошибок: подключается через errorComponent
// корневого маршрута (см. router.tsx)
export function ErrorBoundary({ error }: ErrorBoundaryProps) {
  return (
    <section className={container}>
      <h1 className={title}>Что-то пошло не так</h1>
      <p className={message}>{error.message}</p>
      <button type="button" className={button} onClick={() => window.location.reload()}>
        Обновить страницу
      </button>
    </section>
  );
}
