import { createApp } from './server';
import type { SettingsRepository } from '../model/settings/settings';
import type { CounterRepository } from '../model/counter/counter';

// Интеграция приложения проверяется через fastify.inject() — без сети.
// Реальные репозитории (с PGlite) покрыты в src/model, поэтому здесь
// хватает тестовых реализаций с детерминированными данными.

const settingsRepository: SettingsRepository = {
  get: async () => ({ displayName: 'Гость', compactMode: false }),
  save: async () => undefined,
};

const counterRepository: CounterRepository = {
  get: async () => 3,
  apply: async (action) => (action === 'increment' ? 4 : action === 'decrement' ? 2 : 0),
};

describe('createApp', () => {
  it('отдаёт настройки и счётчик', async () => {
    const app = createApp({ settingsRepository, counterRepository });

    const settings = await app.inject({ method: 'GET', url: '/api/settings' });
    expect(settings.statusCode).toBe(200);
    expect(settings.json()).toEqual({ displayName: 'Гость', compactMode: false });

    const counter = await app.inject({ method: 'GET', url: '/api/counter' });
    expect(counter.statusCode).toBe(200);
    expect(counter.json()).toEqual({ value: 3 });
  });

  it('сохраняет настройки и применяет действия счётчика', async () => {
    const app = createApp({ settingsRepository, counterRepository });

    const saved = await app.inject({
      method: 'PUT',
      url: '/api/settings',
      payload: { displayName: 'Василий', compactMode: true },
    });
    expect(saved.statusCode).toBe(204);

    const applied = await app.inject({
      method: 'POST',
      url: '/api/counter',
      payload: { action: 'increment' },
    });
    expect(applied.statusCode).toBe(200);
    expect(applied.json()).toEqual({ value: 4 });
  });

  it('отклоняет некорректные данные', async () => {
    const app = createApp({ settingsRepository, counterRepository });

    const badSettings = await app.inject({
      method: 'PUT',
      url: '/api/settings',
      payload: { displayName: 'В', compactMode: true },
    });
    expect(badSettings.statusCode).toBe(400);

    const badAction = await app.inject({
      method: 'POST',
      url: '/api/counter',
      payload: { action: 'divide' },
    });
    expect(badAction.statusCode).toBe(400);
  });
});
