import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClientProvider } from '@tanstack/react-query';
import { resetCounterStore } from './components/counter-store';
import { createTestQueryClient } from './query';
import { resetThemeStore } from './theme-store';
import { App } from './App';

function renderApp() {
  return render(
    <QueryClientProvider client={createTestQueryClient()}>
      <App />
    </QueryClientProvider>,
  );
}

describe('App', () => {
  beforeEach(() => {
    resetCounterStore();
    resetThemeStore();
  });

  it('показывает «Тёмная тема» по умолчанию', async () => {
    renderApp();

    expect(await screen.findByRole('button', { name: 'Тёмная тема' })).toBeVisible();
  });

  it('переключает тему туда и обратно', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(await screen.findByRole('button', { name: 'Тёмная тема' }));
    expect(await screen.findByRole('button', { name: 'Светлая тема' })).toBeVisible();

    await user.click(await screen.findByRole('button', { name: 'Светлая тема' }));
    expect(await screen.findByRole('button', { name: 'Тёмная тема' })).toBeVisible();
  });
});
