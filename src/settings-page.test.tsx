import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClientProvider } from '@tanstack/react-query';
import { createTestQueryClient } from './query';
import { SettingsPage } from './settings-page';

function renderSettings() {
  return render(
    <QueryClientProvider client={createTestQueryClient()}>
      <SettingsPage />
    </QueryClientProvider>,
  );
}

describe('SettingsPage', () => {
  it('показывает ошибку валидации на коротком имени', async () => {
    const user = userEvent.setup();
    renderSettings();

    await user.type(screen.getByLabelText('Имя'), 'А');

    expect(await screen.findByText('Имя: минимум 2 символа')).toBeVisible();
  });

  it('сохраняет форму при валидных значениях', async () => {
    const user = userEvent.setup();
    renderSettings();

    await user.type(screen.getByLabelText('Имя'), 'Василий');
    await user.click(screen.getByRole('button', { name: 'Сохранить' }));

    expect(await screen.findByTestId('settings-saved')).toBeVisible();
  });

  it('загружает данные через TanStack Query', async () => {
    renderSettings();

    expect(await screen.findByText('Заявки: 42')).toHaveAttribute('data-testid', 'query-data');
  });
});
