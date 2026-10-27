import fs from 'node:fs';
import path from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { createSettingsRepository } from './settings';

// Тестовая БД — реальный Postgres (встроенный PGlite), без моков:
// схема и сид применяются из того же init-скрипта, что и в docker-compose.

const initSqlPath = path.resolve(__dirname, '../../../migrations/0001_init.sql');

async function createTestRepository() {
  const client = new PGlite();
  await client.exec(fs.readFileSync(initSqlPath, 'utf8'));
  // Тип БД объявлен как NodePgDatabase, PGlite совместим с ним структурно
  const repository = createSettingsRepository(drizzle(client) as never);
  return { client, repository };
}

describe('createSettingsRepository', () => {
  it('читает посещенные данные и сохраняет изменения', async () => {
    const { client, repository } = await createTestRepository();
    try {
      expect(await repository.get()).toEqual({ displayName: 'Гость', compactMode: false });

      await repository.save({ displayName: 'Василий', compactMode: true });
      expect(await repository.get()).toEqual({ displayName: 'Василий', compactMode: true });
    } finally {
      await client.close();
    }
  });
});
