import {
  counterActionSchema,
  counterValueSchema,
  type CounterActionDto,
} from '@common/entities/counter/counter';
import { apiPaths } from '@common/shared/api/api';
import { apiBaseUrl } from '@/helpers/env/env';

// Реальный «API» счётчика: значение хранится на бэкенде в Postgres,
// действие (increment/decrement/reset) применяется на сервере.

export async function getCounter(): Promise<number> {
  const response = await fetch(`${apiBaseUrl()}${apiPaths.counter}`);
  if (!response.ok) {
    throw new Error(`Не удалось получить счётчик: HTTP ${response.status}`);
  }
  return counterValueSchema.parse(await response.json()).value;
}

export async function sendCounterAction(action: CounterActionDto['action']): Promise<number> {
  const parsed = counterActionSchema.parse({ action });
  const response = await fetch(`${apiBaseUrl()}${apiPaths.counter}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(parsed),
  });
  if (!response.ok) {
    throw new Error(`Не удалось применить действие: HTTP ${response.status}`);
  }
  return counterValueSchema.parse(await response.json()).value;
}
