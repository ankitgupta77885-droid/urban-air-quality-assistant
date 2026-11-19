/**
 * Security middleware configuration.
 *
 * Sets up helmet (CSP), CORS, rate limiting, and body size limits.
 */

import { BODY_SIZE_LIMIT, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS } from '@shared/constants.js';
import compression from 'compression';
import cors from 'cors';
import express, { type Express } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

/**
 * Applies all security middleware to the Express app.
 * @param app - Express application instance.
 */
export function applySecurityMiddleware(app: Express): void {
  applyHelmet(app);
  applyCors(app);
  applyRateLimit(app);
  applyBodyParsing(app);
  applyCompression(app);
}

/**
 * Configures helmet with a strict Content-Security-Policy.
 * @param app - Express application instance.
 */
function applyHelmet(app: Express): void {
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:'],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          frameAncestors: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
        },
      },
      crossOriginEmbedderPolicy: false,
    }),
  );
}

/**
 * Configures restrictive CORS.
 * @param app - Express application instance.
 */
function applyCors(app: Express): void {
  app.use(
    cors({
      origin: process.env['NODE_ENV'] === 'production' ? false : true,
      methods: ['GET', 'POST'],
      allowedHeaders: ['Content-Type'],
      maxAge: 600,
    }),
  );
}

/**
 * Configures rate limiting.
 * @param app - Express application instance.
 */
function applyRateLimit(app: Express): void {
  app.use(
    '/api',
    rateLimit({
      windowMs: RATE_LIMIT_WINDOW_MS,
      max: RATE_LIMIT_MAX,
      standardHeaders: true,
      legacyHeaders: false,
      message: { success: false, error: 'Too many requests, please try again later.' },
    }),
  );
}

/**
 * Configures JSON body parsing with size limits.
 * @param app - Express application instance.
 */
function applyBodyParsing(app: Express): void {
  app.use(express.json({ limit: BODY_SIZE_LIMIT }));
}

/**
 * Applies compression middleware for responses.
 * @param app - Express application instance.
 */
function applyCompression(app: Express): void {
  app.use(compression());
}
