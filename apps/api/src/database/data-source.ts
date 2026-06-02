import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { ALL_ENTITIES } from './entities';

/**
 * Standalone DataSource for the TypeORM CLI (migration generate/run/revert).
 * The runtime app configures its own connection in app.module.ts.
 */
const url = process.env.DATABASE_URL;

export default new DataSource({
  type: 'postgres',
  ...(url
    ? { url }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        username: process.env.DB_USERNAME || 'atlas',
        password: process.env.DB_PASSWORD || 'atlas',
        database: process.env.DB_NAME || 'atlas_bank',
      }),
  entities: ALL_ENTITIES,
  migrations: [__dirname + '/migrations/*.{js,ts}'],
  synchronize: false,
});
