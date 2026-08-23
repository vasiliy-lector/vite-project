import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from './App';

describe('App', () => {
  it('показывает «Тёмная тема» по умолчанию', () => {
    render(<App />);

    expect(screen.getByRole('button', { name: 'Тёмная тема' })).toBeInTheDocument();
  });

  it('переключает тему туда и обратно', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Тёмная тема' }));
    expect(screen.getByRole('button', { name: 'Светлая тема' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Светлая тема' }));
    expect(screen.getByRole('button', { name: 'Тёмная тема' })).toBeInTheDocument();
  });
});
