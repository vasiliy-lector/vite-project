import type { FastifyReply, FastifyRequest } from 'fastify';
import {
  counterActionSchema,
  counterValueSchema,
} from '../../../../common/src/entities/counter/counter';
import type { CounterRepository } from '../../model/counter/counter';

// Тонкий HTTP-слой счётчика: валидация действия и вызов репозитория.
// Чистая логика изменений (applyCounterAction) лежит в common и
// вызывается внутри репозитория.

export function createCounterController(repository: CounterRepository) {
  return {
    getCounter: async () => {
      const value = await repository.get();
      return counterValueSchema.parse({ value });
    },

    async applyAction(request: FastifyRequest, reply: FastifyReply) {
      const parsed = counterActionSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ message: 'Неизвестное действие' });
      }
      const value = await repository.apply(parsed.data.action);
      return counterValueSchema.parse({ value });
    },
  };
}
