import fs from 'node:fs';
import path from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { createCounterRepository } from './counter';

const initSqlPath = path.resolve(__dirname, '../../../migrations/0001_init.sql');

async function createTestRepository() {
  const client = new PGlite();
  await client.exec(fs.readFileSync(initSqlPath, 'utf8'));
  const repository = createCounterRepository(drizzle(client) as never);
  return { client, repository };
}

describe('createCounterRepository', () => {
  it('применяет действия к посещенному значению', async () => {
    const { client, repository } = await createTestRepository();
    try {
      expect(await repository.get()).toBe(0);

      expect(await repository.apply('increment')).toBe(1);
      expect(await repository.apply('increment')).toBe(2);
      expect(await repository.apply('decrement')).toBe(1);

      await repository.apply('increment');
      expect(await repository.apply('reset')).toBe(0);
      expect(await repository.apply('decrement')).toBe(-1);
    } finally {
      await client.close();
    }
  });
});
