/**
 * Environment configuration with Zod validation.
 *
 * Validates required environment variables at startup and provides
 * typed access to configuration values.
 */

import { DEFAULT_PORT } from '@shared/constants.js';
import { z } from 'zod';

/** Schema for environment variable validation. */
const envSchema = z.object({
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required'),
  GEMINI_MODEL: z.string().min(1).default('gemini-2.0-flash'),
  PORT: z.coerce.number().int().positive().default(DEFAULT_PORT),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

/** Validated environment configuration type. */
export type EnvConfig = z.infer<typeof envSchema>;

/**
 * Validates and returns the environment configuration.
 * Throws a descriptive error if required variables are missing.
 * @returns Validated environment configuration object.
 */
export function loadEnvConfig(): EnvConfig {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const issues = result.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`);
    throw new Error(`Environment validation failed:\n${issues.join('\n')}`);
  }

  return result.data;
}
