/**
 * Express application factory.
 *
 * Creates and configures the Express app with all middleware and routes.
 * Separated from server startup for testability.
 */

import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import express, { type Express } from 'express';

import { errorHandler } from './middleware/error-handler.js';
import { applySecurityMiddleware } from './middleware/security.js';
import { requestTimeout } from './middleware/timeout.js';
import { createAdviceRouter } from './routes/advice.js';
import { aqiRouter } from './routes/aqi.js';
import { geocodingRouter } from './routes/geocoding.js';

/** Configuration for creating the Express app. */
export interface AppConfig {
  readonly geminiApiKey: string;
  readonly geminiModel: string;
  readonly allowedOrigins?: readonly string[];
}

/**
 * Creates a fully configured Express application.
 * @param config - Application configuration with API keys and model name.
 * @returns Configured Express application instance.
 */
export function createApp(config: AppConfig): Express {
  const app = express();

  applySecurityMiddleware(app, { allowedOrigins: config.allowedOrigins });
  app.use('/api', requestTimeout);

  app.use('/api/geocoding', geocodingRouter);
  app.use('/api/aqi', aqiRouter);
  app.use(
    '/api/advice',
    createAdviceRouter({
      apiKey: config.geminiApiKey,
      modelName: config.geminiModel,
    }),
  );

  const clientDist = resolve(process.cwd(), 'dist/web');
  if (existsSync(clientDist)) {
    app.use(express.static(clientDist));
  }

  app.use(errorHandler);

  return app;
}
