import type { FastifyReply, FastifyRequest } from 'fastify';
import { settingsSchema } from '../../../../common/src/entities/settings/settings';
import type { SettingsRepository } from '../../model/settings/settings';

// Тонкий HTTP-слой: валидация тела общей zod-схемой и вызов репозитория.
// Собственно логика — в model, поэтому unit-тесты здесь не нужны
// (достаточно интеграционного server.test.ts).

export function createSettingsController(repository: SettingsRepository) {
  return {
    getSettings: () => repository.get(),

    async saveSettings(request: FastifyRequest, reply: FastifyReply) {
      const parsed = settingsSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ message: 'Некорректные настройки' });
      }
      await repository.save(parsed.data);
      return reply.code(204).send();
    },
  };
}
