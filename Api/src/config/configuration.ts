export default () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',

  db: {
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10), // ✅ Postgres
    username: process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME ?? '',
  },
  secret: process.env.JWT_SECRET,
  expiry: process.env.JWT_EXPIRY,

  synchronize: process.env.DB_SYNC === 'true', // ✅ boolean
  logLevel: process.env.LOG_LEVEL ?? 'info',

  cloudinary: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_APIKEY,
    api_secret: process.env.CLOUDINARY_SECRET,
  },
});

export type dbType = {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
};

export type cloudinaryAccessType = {
  cloud_name: string;
  api_key: string;
  api_secret: string;
};
