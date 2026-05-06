export default () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',

  db_url: process.env.DB_URL,
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

export type cloudinaryAccessType = {
  cloud_name: string;
  api_key: string;
  api_secret: string;
};
