/**
 * Vercel serverless entry point.
 *
 * Builds the Express application from validated environment configuration and
 * exports it as the default handler. Vercel routes every `/api/*` request here
 * (see vercel.json); the static front end is served separately from the CDN.
 */

import { createApp } from '../src/server/app.js';
import { loadEnvConfig } from '../src/server/config/env.js';

const env = loadEnvConfig();

const app = createApp({
  geminiApiKey: env.GEMINI_API_KEY,
  geminiModel: env.GEMINI_MODEL,
  allowedOrigins: env.ALLOWED_ORIGINS,
});

export default app;
