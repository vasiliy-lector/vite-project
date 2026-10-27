// Jest-вариант конфигурации (main — env.ts с import.meta.env).
// В unit-тестах нет vite, поэтому читаем процессное окружение.

export function apiBaseUrl(): string {
  return process.env.VITE_API_URL || 'http://localhost:3000';
}
