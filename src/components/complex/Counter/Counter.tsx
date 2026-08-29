import { useCounterStore } from '@/components/shared/stores/counterStore';
import { button, container, controls, title, value } from './Counter.css';

// Демо глобального состояния: значение живёт в Zustand-сторе,
// а не в локальном state компонента
export function Counter() {
  const count = useCounterStore((state) => state.count);
  const increment = useCounterStore((state) => state.increment);
  const decrement = useCounterStore((state) => state.decrement);
  const reset = useCounterStore((state) => state.reset);

  return (
    <section className={container}>
      <h1 className={title}>Счётчик</h1>
      <p className={value} data-testid="counter-value" aria-live="polite">
        {count}
      </p>
      <div className={controls}>
        <button type="button" className={button} onClick={decrement}>
          Уменьшить
        </button>
        <button type="button" className={button} onClick={reset}>
          Сбросить
        </button>
        <button type="button" className={button} onClick={increment}>
          Увеличить
        </button>
      </div>
    </section>
  );
}
