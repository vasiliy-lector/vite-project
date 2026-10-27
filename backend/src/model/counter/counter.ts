import { eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import {
  applyCounterAction,
  type CounterActionDto,
} from '../../../../common/src/entities/counter/counter';
import { counterTable } from './table';

// Чтение и применение действий к счётчику. Вся «сложность» — в
// applyCounterAction из common (общая с клиентом), здесь только доступ к БД.

export type CounterRepository = {
  get(): Promise<number>;
  apply(action: CounterActionDto['action']): Promise<number>;
};

export function createCounterRepository(db: NodePgDatabase): CounterRepository {
  return {
    async get() {
      const rows = await db.select().from(counterTable).where(eq(counterTable.id, 1));
      return rows[0]?.value ?? 0;
    },
    async apply(action) {
      const current = await this.get();
      const next = applyCounterAction(current, action);
      await db
        .insert(counterTable)
        .values({ id: 1, value: next })
        .onConflictDoUpdate({ target: counterTable.id, set: { value: next } });
      return next;
    },
  };
}
