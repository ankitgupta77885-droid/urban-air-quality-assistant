/**
 * Environment configuration with Zod validation.
 *
 * Validates required environment variables at startup and provides
 * typed access to configuration values.
 */

import { z } from 'zod';

import { DEFAULT_PORT } from '../../shared/constants.js';
import { setLogLevel } from '../services/logger.js';

/** Schema for environment variable validation. */
const envSchema = z.object({
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required'),
  GEMINI_MODEL: z.string().min(1).default('gemini-flash-lite-latest'),
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

/** Normalizes an optional Vercel hostname into an https:// origin URL. */
function toHttpsOrigin(host: string | undefined): string | null {
  const trimmed = host?.trim();
  if (!trimmed) {
    return null;
  }
  const cleanHost = trimmed.replace(/^https?:\/\//, '');
  return cleanHost ? `https://${cleanHost}` : null;
}

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

  const vercelOrigins = [
    toHttpsOrigin(process.env['VERCEL_URL']),
    toHttpsOrigin(process.env['VERCEL_PROJECT_PRODUCTION_URL']),
  ].filter((origin): origin is string => origin !== null);

  setLogLevel(result.data.LOG_LEVEL);
  return {
    ...result.data,
    ALLOWED_ORIGINS: Array.from(new Set([...result.data.ALLOWED_ORIGINS, ...vercelOrigins])),
  };
}
