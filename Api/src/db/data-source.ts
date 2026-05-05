import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { register } from 'tsconfig-paths';
import { resolve } from 'path';

// Register src/ path alias for TypeORM CLI
register({
  baseUrl: resolve(__dirname, '../..'), // resolves to project root
  paths: { 'src/*': ['src/*'] },
});

config({ path: process.env.NODE_ENV === 'production' ? '.env' : '.env.dev' });

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [__dirname + '/../**/*.entity.{ts,js}'],
  migrations: [__dirname + '/migrations/*.{ts,js}'],
  synchronize: false,
  logging: false,
});
