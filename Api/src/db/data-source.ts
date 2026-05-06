import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { register } from 'tsconfig-paths';
import { resolve, join } from 'path';

// Register src/ path alias for TypeORM CLI
register({
  baseUrl: resolve(__dirname, '../..'), // resolves to project root
  paths: { 'src/*': ['src/*'] },
});

config({ path: process.env.NODE_ENV === 'production' ? '.env' : '.env.dev' });

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DB_URL,
  entities: [__dirname + '/../**/*.entity.{ts,js}'],
  migrations: [join(process.cwd(), 'src/db/migrations/*{.ts,.js}')],
  synchronize: false,
  logging: false,
});
