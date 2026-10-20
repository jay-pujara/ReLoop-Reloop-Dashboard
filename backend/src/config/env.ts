import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(5000),
  MONGODB_URI: z.string().default('mongodb://localhost:27017/circular_packaging_exchange'),
  MONGODB_DB_NAME: z.string().optional(),
  JWT_ACCESS_SECRET: z.string().min(16).default('development_insecure_access_secret_only_for_dev_32char'),
  JWT_REFRESH_SECRET: z.string().min(16).default('development_insecure_refresh_secret_only_for_dev_32char'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  CORS_ORIGINS: z.string().default('http://localhost:5173,http://localhost:5174'),
  SENTRY_DSN: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  IMPACT_PRIVATE_KEY: z.string().optional(),
  // PostgreSQL configuration
  POSTGRES_URL: z.string().default('postgres://localhost:5432/circular_packaging_exchange'),
  POSTGRES_DB: z.string().optional(),
  POSTGRES_USER: z.string().optional(),
  POSTGRES_PASS: z.string().optional(),
});

const parseEnv = () => {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('Invalid backend environment configuration:', result.error.format());
    process.exit(1);
  }
  return result.data;
};

export const env = parseEnv();
