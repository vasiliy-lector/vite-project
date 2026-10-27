import { useCounterStore } from './counterStore';

// Сеть неконтролируема в unit-тестах — подменяем модуль API
// детерминированной реализацией (load сбрасывает значение к 0).
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

describe('useCounterStore', () => {
  beforeEach(() => {
    useCounterStore.setState({ count: 0 });
  });

  it('начинается с нуля', () => {
    expect(useCounterStore.getState().count).toBe(0);
  });

  it('load подтягивает значение с сервера', async () => {
    await useCounterStore.getState().load();
    expect(useCounterStore.getState().count).toBe(0);
  });

  it('increment увеличивает счёт', async () => {
    await useCounterStore.getState().load();
    await useCounterStore.getState().apply('increment');
    await useCounterStore.getState().apply('increment');
    expect(useCounterStore.getState().count).toBe(2);
  });

  it('decrement уменьшает счёт', async () => {
    await useCounterStore.getState().load();
    await useCounterStore.getState().apply('decrement');
    expect(useCounterStore.getState().count).toBe(-1);
  });

  it('reset сбрасывает счёт в ноль', async () => {
    await useCounterStore.getState().load();
    await useCounterStore.getState().apply('increment');
    await useCounterStore.getState().apply('reset');
    expect(useCounterStore.getState().count).toBe(0);
  });
});
