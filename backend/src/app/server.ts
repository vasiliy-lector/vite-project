import Fastify from 'fastify';
import cors from '@fastify/cors';
import { apiPaths } from '../../../common/src/shared/api/api';
import { createSettingsController } from '../controllers/settings/settings';
import { createCounterController } from '../controllers/counter/counter';
import type { SettingsRepository } from '../model/settings/settings';
import type { CounterRepository } from '../model/counter/counter';

export type AppDependencies = {
  settingsRepository: SettingsRepository;
  counterRepository: CounterRepository;
};

// Сборка Fastify-приложения: регистрация роутов (пути — общий контракт
// из common), обработчики берутся из контроллеров. Приложение не
// «слушает» само — это делает main.ts, а в тестах достаточно inject().
export function createApp(deps: AppDependencies) {
  const app = Fastify({ logger: false });

  // Разрешаем запросы с origin клиента (в preview/e2e это localhost:4173);
  // без methods preflight для PUT/POST блокируется дефолтом плагина (GET,HEAD)
  void app.register(cors, { origin: true, methods: ['GET', 'PUT', 'POST', 'OPTIONS'] });

  const settings = createSettingsController(deps.settingsRepository);
  const counter = createCounterController(deps.counterRepository);

  app.get(apiPaths.settings, () => settings.getSettings());
  app.put(apiPaths.settings, (request, reply) => settings.saveSettings(request, reply));

  app.get(apiPaths.counter, () => counter.getCounter());
  app.post(apiPaths.counter, (request, reply) => counter.applyAction(request, reply));

  return app;
}
