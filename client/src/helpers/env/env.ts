// Общая конфигурация для компонентов/страниц: базовый URL бэкенда.
// Значение берётся из VITE_API_URL, по умолчанию — локальный бэкенд.

export function apiBaseUrl(): string {
  return import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
}
