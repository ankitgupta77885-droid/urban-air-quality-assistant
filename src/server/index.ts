/**
 * Server entry point.
 *
 * Loads environment configuration and starts the Express server.
 */

import { createApp } from './app.js';
import { loadEnvConfig } from './config/env.js';
import { createLogger } from './services/logger.js';

const logger = createLogger('server');

/**
 * Starts the HTTP server.
 */
function start(): void {
  const env = loadEnvConfig();

  const app = createApp({
    geminiApiKey: env.GEMINI_API_KEY,
    geminiModel: env.GEMINI_MODEL,
  });

  app.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
  });
}

start();
