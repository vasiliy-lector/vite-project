import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createQueryClient } from './query-client';
import { SettingsPage } from './settings-page';

function renderPage() {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <SettingsPage />
    </QueryClientProvider>,
  );
}

describe('SettingsPage', () => {
  it('показывает состояние загрузки', () => {
    renderPage();
    expect(screen.getByTestId('settings-loading')).toHaveTextContent('Загрузка настроек…');
  });

  it('заполняет форму данными из mock-API', async () => {
    renderPage();
    const input = await screen.findByTestId('display-name');
    expect(input).toHaveValue('Гость');
  });

  it('отклоняет имя короче 2 символов при сохранении', async () => {
    const user = userEvent.setup();
    renderPage();
    const input = await screen.findByTestId('display-name');

    await user.clear(input);
    await user.type(input, 'a');
    await user.click(screen.getByRole('button', { name: 'Сохранить' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Минимум 2 символа');
  });

  it('сохраняет форму после отправки', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByTestId('display-name');

    await user.click(screen.getByRole('button', { name: 'Сохранить' }));

    expect(await screen.findByTestId('settings-saved')).toHaveTextContent('Сохранено: Гость');
  });
});
