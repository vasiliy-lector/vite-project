import * as z from 'zod';

// Контракт персистентного счётчика: действие, которое клиент просит
// применить, и текущее значение после него.

export const counterActionSchema = z.object({
  action: z.enum(['increment', 'decrement', 'reset']),
});

export type CounterActionDto = z.infer<typeof counterActionSchema>;

export const counterValueSchema = z.object({
  value: z.number().int(),
});

export type CounterValueDto = z.infer<typeof counterValueSchema>;

// Чистая бизнес-логика: следующее значение счётчика по действию.
// Используется и на бэкенде (обработка действия), и в тестах клиента.
export function applyCounterAction(current: number, action: CounterActionDto['action']): number {
  switch (action) {
    case 'increment':
      return current + 1;
    case 'decrement':
      return current - 1;
    case 'reset':
      return 0;
  }
}
