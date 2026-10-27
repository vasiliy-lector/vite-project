import { create } from 'zustand';
import { getCounter, sendCounterAction } from '@/helpers/counterApi/counterApi';

export type CounterAction = 'increment' | 'decrement' | 'reset';

type CounterStore = {
  count: number;
  load: () => Promise<void>;
  apply: (action: CounterAction) => Promise<void>;
};

// Персистентный счётчик: значение хранится на бэкенде (Postgres),
// действия применяются на сервере, стор лишь синхронизирует его с UI.
export const useCounterStore = create<CounterStore>()((set) => ({
  count: 0,
  load: async () => {
    set({ count: await getCounter() });
  },
  apply: async (action) => {
    set({ count: await sendCounterAction(action) });
  },
}));
