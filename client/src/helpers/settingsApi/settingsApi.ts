import { defaultSettings, settingsSchema } from '@common/entities/settings/settings';
import { apiPaths } from '@common/shared/api/api';
import { apiBaseUrl } from '@/helpers/env/env';

// Реальный «API» настроек вместо прежнего офлайн-мока: запросы идут
// на бэкенд (Fastify + Postgres). Контракт и валидация — из common.

export async function getSettings() {
  const response = await fetch(`${apiBaseUrl()}${apiPaths.settings}`);
  if (!response.ok) {
    throw new Error(`Не удалось загрузить настройки: HTTP ${response.status}`);
  }
  return settingsSchema.parse(await response.json());
}

export async function saveSettings(settings: typeof defaultSettings): Promise<void> {
  const response = await fetch(`${apiBaseUrl()}${apiPaths.settings}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  if (!response.ok) {
    throw new Error(`Не удалось сохранить настройки: HTTP ${response.status}`);
  }
}
