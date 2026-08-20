import { useState } from 'react';
import { button, container, controls, title, value } from './counter.css';

type CounterProps = {
  initialValue?: number;
};

export function Counter({ initialValue = 0 }: CounterProps) {
  const [count, setCount] = useState(initialValue);

  return (
    <section className={container}>
      <h1 className={title}>Счётчик</h1>
      <p className={value} data-testid="counter-value" aria-live="polite">
        {count}
      </p>
      <div className={controls}>
        <button
          type="button"
          className={button}
          onClick={() => setCount((current) => current - 1)}
        >
          Уменьшить
        </button>
        <button type="button" className={button} onClick={() => setCount(0)}>
          Сбросить
        </button>
        <button
          type="button"
          className={button}
          onClick={() => setCount((current) => current + 1)}
        >
          Увеличить
        </button>
      </div>
    </section>
  );
}
