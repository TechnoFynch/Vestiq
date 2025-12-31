import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

const isDev = process.env.NODE_ENV !== 'production';

export const logger = WinstonModule.createLogger({
  level: isDev ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, context }) => {
      return `${timestamp} [${level}]${context ? ' [' + context + ']' : ''} ${message}`;
    }),
  ),
  transports: [
    ...(isDev
      ? [
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.colorize(),
              winston.format.timestamp({ format: 'HH:mm:ss' }),
              winston.format.printf(
                ({ timestamp, level, message, context }) =>
                  `${timestamp} ${level}${context ? ' [' + context + ']' : ''} ${message}`,
              ),
            ),
          }),
        ]
      : []),

    new winston.transports.File({
      filename: 'logs/app.log',
      level: 'info',
    }),

    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
  ],
});
