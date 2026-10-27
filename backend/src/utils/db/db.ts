import fs from 'node:fs';
import path from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import { drizzle as drizzlePglite } from 'drizzle-orm/pglite';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import pg from 'pg';

// Подключение к Postgres: либо реальный сервер (DATABASE_URL вида
// postgres://…), либо встроенный PGlite (пусто / 'pglite') — чтобы dev,
// тесты и CI работали без отдельного развёртывания БД.
//
// Миграции — plain SQL из backend/migrations: применяются при старте
// идемпотентно (CREATE TABLE IF NOT EXISTS + seed ON CONFLICT DO NOTHING),
// поэтому подходят и для docker-compose (initdb), и для CI, и локально.

const initSqlPath = path.resolve(process.cwd(), 'migrations/0001_init.sql');

export type Database = NodePgDatabase;

export async function createDatabase(connectionString: string | undefined): Promise<Database> {
  if (!connectionString || connectionString === 'pglite') {
    const client = new PGlite();
    await client.exec(fs.readFileSync(initSqlPath, 'utf8'));
    // PGlite даёт тот же drizzle-API; приводим тип к NodePgDatabase,
    // чтобы репозитории не зависели от конкретного драйвера.
    return drizzlePglite(client) as unknown as Database;
  }
  const pool = new pg.Pool({ connectionString });
  await pool.query(fs.readFileSync(initSqlPath, 'utf8'));
  return drizzlePg(pool);
}
