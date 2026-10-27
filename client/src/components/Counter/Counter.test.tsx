import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useCounterStore } from '@/components/stores/stores';
import { applyCounterAction } from '@common/entities/counter/counter';
import { Counter } from './Counter';

// Сеть в unit-тестах неконтролируема, поэтому модуль API подменён
// детерминированной реализацией (та же логика, что в common).
jest.mock('@/helpers/counterApi/counterApi', () => {
  let value = 0;
  return {
    getCounter: jest.fn(async () => {
      value = 0;
      return 0;
    }),
    sendCounterAction: jest.fn(async (action: 'increment' | 'decrement' | 'reset') => {
      value = action === 'increment' ? value + 1 : action === 'decrement' ? value - 1 : 0;
      return value;
    }),
  };
});

describe('Counter', () => {
  beforeEach(() => {
    useCounterStore.setState({ count: 0 });
  });

  it('начинается с нуля', async () => {
    render(<Counter />);
    await waitFor(() => expect(screen.getByTestId('counter-value')).toHaveTextContent('0'));
  });

  it('увеличивает значение по кнопке «Увеличить»', async () => {
    const user = userEvent.setup();
    render(<Counter />);
    await waitFor(() => expect(screen.getByTestId('counter-value')).toHaveTextContent('0'));

    await user.click(screen.getByRole('button', { name: 'Увеличить' }));
    await user.click(screen.getByRole('button', { name: 'Увеличить' }));

    expect(screen.getByTestId('counter-value')).toHaveTextContent('2');
  });

  it('уменьшает значение по кнопке «Уменьшить»', async () => {
    const user = userEvent.setup();
    render(<Counter />);
    await waitFor(() => expect(screen.getByTestId('counter-value')).toHaveTextContent('0'));

    await user.click(screen.getByRole('button', { name: 'Уменьшить' }));

    expect(screen.getByTestId('counter-value')).toHaveTextContent('-1');
  });

  it('сбрасывает значение по кнопке «Сбросить»', async () => {
    const user = userEvent.setup();
    render(<Counter />);
    await waitFor(() => expect(screen.getByTestId('counter-value')).toHaveTextContent('0'));

    await user.click(screen.getByRole('button', { name: 'Увеличить' }));
    await user.click(screen.getByRole('button', { name: 'Увеличить' }));
    await user.click(screen.getByRole('button', { name: 'Сбросить' }));

    expect(screen.getByTestId('counter-value')).toHaveTextContent('0');
  });

  it('использует общую чистую логику из common', () => {
    expect(applyCounterAction(0, 'increment')).toBe(1);
    expect(applyCounterAction(0, 'decrement')).toBe(-1);
    expect(applyCounterAction(5, 'reset')).toBe(0);
  });

  it('показывает значение из глобального стора', () => {
    // До загрузки с сервера показывается локальное значение
    useCounterStore.setState({ count: 5 });
    render(<Counter />);
    expect(screen.getByTestId('counter-value')).toHaveTextContent('5');
    expect(screen.getByTestId('counter-value')).toHaveAttribute('aria-live', 'polite');
  });
});
