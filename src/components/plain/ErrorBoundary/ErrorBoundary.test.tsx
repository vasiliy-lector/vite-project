import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';

describe('ErrorBoundary', () => {
  it('показывает заголовок и текст ошибки', () => {
    render(<ErrorBoundary error={new Error('Тестовая ошибка')} />);

    expect(screen.getByRole('heading', { name: 'Что-то пошло не так' })).toBeInTheDocument();
    expect(screen.getByText('Тестовая ошибка')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Обновить страницу' })).toBeInTheDocument();
  });
});
