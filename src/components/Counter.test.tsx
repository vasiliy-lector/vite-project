import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Counter } from './Counter';

describe('Counter', () => {
  it('показывает начальное значение 0', () => {
    render(<Counter />);
    expect(screen.getByTestId('counter-value')).toHaveTextContent('0');
  });

  it('увеличивает значение по кнопке «Увеличить»', async () => {
    const user = userEvent.setup();
    render(<Counter />);

    await user.click(screen.getByRole('button', { name: 'Увеличить' }));

    expect(screen.getByTestId('counter-value')).toHaveTextContent('1');
  });

  it('уменьшает значение по кнопке «Уменьшить»', async () => {
    const user = userEvent.setup();
    render(<Counter />);

    await user.click(screen.getByRole('button', { name: 'Уменьшить' }));

    expect(screen.getByTestId('counter-value')).toHaveTextContent('-1');
  });

  it('сбрасывает значение по кнопке «Сбросить»', async () => {
    const user = userEvent.setup();
    render(<Counter />);

    await user.click(screen.getByRole('button', { name: 'Увеличить' }));
    await user.click(screen.getByRole('button', { name: 'Увеличить' }));
    await user.click(screen.getByRole('button', { name: 'Сбросить' }));

    expect(screen.getByTestId('counter-value')).toHaveTextContent('0');
  });

  it('использует переданное начальное значение', () => {
    render(<Counter initialValue={5} />);
    expect(screen.getByTestId('counter-value')).toHaveTextContent('5');
  });
});
