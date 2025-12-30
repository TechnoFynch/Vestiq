export default () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',

  db: {
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10), // ✅ Postgres
    username: process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME ?? '',
  },

  synchronize: process.env.DB_SYNC === 'true', // ✅ boolean
  logLevel: process.env.LOG_LEVEL ?? 'info',
});

export type dbType = {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
};
