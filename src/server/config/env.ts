/**
 * Environment configuration with Zod validation.
 *
 * Validates required environment variables at startup and provides
 * typed access to configuration values.
 */

import { DEFAULT_PORT } from '@shared/constants.js';
import { z } from 'zod';

import { setLogLevel } from '../services/logger.js';

/** Schema for environment variable validation. */
const envSchema = z.object({
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required'),
  GEMINI_MODEL: z.string().min(1).default('gemini-3.6-flash'),
  PORT: z.coerce.number().int().positive().default(DEFAULT_PORT),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  ALLOWED_ORIGINS: z
    .string()
    .default('')
    .transform((val) =>
      val
        ? val
            .split(',')
            .map((o) => o.trim())
            .filter(Boolean)
        : [],
    ),
});

/** Validated environment configuration type. */
export type EnvConfig = z.infer<typeof envSchema>;

/**
 * Validates and returns the environment configuration.
 * Throws a descriptive error if required variables are missing.
 * @returns Validated environment configuration object.
 */
export function loadEnvConfig(): EnvConfig {
  try {
    process.loadEnvFile();
  } catch {
    // Gracefully ignore missing or inaccessible .env file
  }

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const issues = result.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`);
    throw new Error(`Environment validation failed:\n${issues.join('\n')}`);
  }

  setLogLevel(result.data.LOG_LEVEL);
  return result.data;
}
