import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from './error-boundary';

function Bomb() {
  throw new Error('boom');
  return null;
}

describe('ErrorBoundary', () => {
  it('перехватывает ошибку рендера', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Что-то пошло не так');
    spy.mockRestore();
  });

  it('рендерит детей, если ошибки нет', () => {
    render(
      <ErrorBoundary>
        <p>ок</p>
      </ErrorBoundary>,
    );
    expect(screen.getByText('ок')).toBeVisible();
  });
});
