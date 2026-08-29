import { resetCounterStore, useCounterStore } from '@/components/counter-store';

describe('useCounterStore', () => {
  beforeEach(() => {
    resetCounterStore();
  });

  it('начальное значение равно 0', () => {
    expect(useCounterStore.getState().count).toBe(0);
  });

  it('увеличивает значение', () => {
    useCounterStore.getState().increment();
    useCounterStore.getState().increment();
    expect(useCounterStore.getState().count).toBe(2);
  });

  it('уменьшает значение', () => {
    useCounterStore.getState().decrement();
    expect(useCounterStore.getState().count).toBe(-1);
  });

  it('сбрасывает значение в ноль', () => {
    useCounterStore.getState().increment();
    useCounterStore.getState().reset();
    expect(useCounterStore.getState().count).toBe(0);
  });
});