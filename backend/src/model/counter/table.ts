import { pgTable, integer } from 'drizzle-orm/pg-core';

// Таблица персистентного счётчика: одна глобальная строка (id = 1).
export const counterTable = pgTable('counter', {
  id: integer('id').primaryKey(),
  value: integer('value').notNull(),
});
