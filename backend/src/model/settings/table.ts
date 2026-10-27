import { pgTable, text } from 'drizzle-orm/pg-core';

// Таблица настроек пользователя: одна глобальная строка (id = 'default').
export const settingsTable = pgTable('settings', {
  id: text('id').primaryKey(),
  displayName: text('display_name').notNull(),
  compactMode: text('compact_mode').notNull(),
});

export type SettingsRow = typeof settingsTable.$inferSelect;
