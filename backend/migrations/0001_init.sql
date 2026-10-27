-- Начальная схема и сид для обеих таблиц (применяется docker-entrypoint-initdb.d
-- к свежей базе, а в unit-тестах — к PGlite). Идемпотентно.

CREATE TABLE IF NOT EXISTS settings (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  compact_mode TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS counter (
  id INTEGER PRIMARY KEY,
  value INTEGER NOT NULL
);

INSERT INTO settings (id, display_name, compact_mode)
VALUES ('default', 'Гость', 'false')
ON CONFLICT (id) DO NOTHING;

INSERT INTO counter (id, value)
VALUES (1, 0)
ON CONFLICT (id) DO NOTHING;
