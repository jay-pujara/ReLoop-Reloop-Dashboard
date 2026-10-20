import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from './logger.js';

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI, env.MONGODB_DB_NAME ? { dbName: env.MONGODB_DB_NAME } : undefined);
    logger.info(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error('Failed to connect to MongoDB', { error });
    process.exit(1);
  }
};

export const checkDBReady = (): boolean => {
  return mongoose.connection.readyState === 1;
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
};
