import { useCounterStore } from './counter-store';

describe('useCounterStore', () => {
  beforeEach(() => {
    useCounterStore.setState({ count: 0 });
  });

  it('начинается с нуля', () => {
    expect(useCounterStore.getState().count).toBe(0);
  });

  it('increment увеличивает счёт', () => {
    const { increment } = useCounterStore.getState();
    increment();
    increment();
    expect(useCounterStore.getState().count).toBe(2);
  });

  it('decrement уменьшает счёт', () => {
    useCounterStore.getState().decrement();
    expect(useCounterStore.getState().count).toBe(-1);
  });

  it('reset сбрасывает счёт в ноль', () => {
    const state = useCounterStore.getState();
    state.increment();
    state.reset();
    expect(useCounterStore.getState().count).toBe(0);
  });
});
