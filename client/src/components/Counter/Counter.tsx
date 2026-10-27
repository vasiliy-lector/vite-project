import { useEffect } from 'react';
import { useCounterStore } from '@/components/stores/stores';
import { button, container, controls, title, value } from './Counter.css';

// Демо персистентного состояния: значение живёт в Zustand-сторе,
// которое синхронизируется с бэкендом (после монтажа — load()).
export function Counter() {
  const count = useCounterStore((state) => state.count);
  const load = useCounterStore((state) => state.load);
  const apply = useCounterStore((state) => state.apply);

  // При заходе на страницу подтягиваем актуальное значение с сервера
  useEffect(() => {
    void load();
  }, [load]);

  return (
    <section className={container}>
      <h1 className={title}>Счётчик</h1>
      <p className={value} data-testid="counter-value" aria-live="polite">
        {count}
      </p>
      <div className={controls}>
        <button type="button" className={button} onClick={() => void apply('decrement')}>
          Уменьшить
        </button>
        <button type="button" className={button} onClick={() => void apply('reset')}>
          Сбросить
        </button>
        <button type="button" className={button} onClick={() => void apply('increment')}>
          Увеличить
        </button>
      </div>
    </section>
  );
}
