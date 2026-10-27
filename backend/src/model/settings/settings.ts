import { eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import {
  defaultSettings,
  type SettingsDto,
} from '../../../../common/src/entities/settings/settings';
import { settingsTable, type SettingsRow } from './table';

// Узкая бизнес-логика: чтение/запись настроек из Postgres.
// Тип БД — «node-postgres», но в тестах/.dev передаётся PGlite
// (тот же набор методов drizzle, совместим структурно).

export type SettingsRepository = {
  get(): Promise<SettingsDto>;
  save(settings: SettingsDto): Promise<void>;
};

export function createSettingsRepository(db: NodePgDatabase): SettingsRepository {
  return {
    async get() {
      const rows = await db.select().from(settingsTable).where(eq(settingsTable.id, 'default'));
      const row: SettingsRow | undefined = rows[0];
      if (!row) {
        return defaultSettings;
      }
      return {
        displayName: row.displayName,
        compactMode: row.compactMode === 'true',
      };
    },
    async save(settings) {
      await db
        .insert(settingsTable)
        .values({ id: 'default', ...settings, compactMode: String(settings.compactMode) })
        .onConflictDoUpdate({
          target: settingsTable.id,
          set: { displayName: settings.displayName, compactMode: String(settings.compactMode) },
        });
    },
  };
}
