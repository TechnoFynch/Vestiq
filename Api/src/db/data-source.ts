import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config({ path: '.env.dev' });

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/db/migrations/*.js'],

  synchronize: false, // 🚫 NEVER true in prod
  logging: false,
});
