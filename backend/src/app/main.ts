import 'dotenv/config';
import { createDatabase } from '../utils/db/db';
import { createApp } from './server';
import { createSettingsRepository } from '../model/settings/settings';
import { createCounterRepository } from '../model/counter/counter';

// Точка входа: подключение к БД, сборка приложения, запуск HTTP-сервера.
// DATABASE_URL: 'pglite' (или пусто) — встроенная БД; postgres://… — внешний
// Postgres из docker-compose.

async function start(): Promise<void> {
  const db = await createDatabase(process.env.DATABASE_URL);

  const app = createApp({
    settingsRepository: createSettingsRepository(db),
    counterRepository: createCounterRepository(db),
  });

  const port = Number(process.env.PORT ?? 3000);

  await app.listen({ port, host: '0.0.0.0' });
  app.log.info(`бэкенд доступен на http://localhost:${port}`);
}

void start().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
