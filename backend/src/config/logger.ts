import winston from 'winston';
import { env } from './env.js';

export const logger = winston.createLogger({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'circular-packaging-backend' },
  transports: [
    new winston.transports.Console({
      format:
        env.NODE_ENV === 'production'
          ? winston.format.json()
          : winston.format.combine(
              winston.format.colorize(),
              winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
                const metaString = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
                return `[${timestamp}] ${level}: ${message}${stack ? `\n${stack}` : ''}${metaString}`;
              })
            ),
    }),
  ],
});
