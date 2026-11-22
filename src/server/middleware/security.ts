/**
 * Security middleware configuration.
 *
 * Sets up helmet (CSP), CORS, rate limiting, and body size limits.
 */

import { BODY_SIZE_LIMIT, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS } from '@shared/constants.js';
import compression from 'compression';
import cors, { type CorsOptions } from 'cors';
import express, { type Express } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

/** Default allowed origins for CORS. */
const DEFAULT_ALLOWED_ORIGINS: readonly string[] = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
] as const;

/**
 * Checks whether an origin is allowed by the CORS policy.
 * @param origin - Request origin header value or undefined.
 * @returns True if origin is allowed, false otherwise.
 */
export function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) {
    return true;
  }

  const customOrigins = process.env['ALLOWED_ORIGINS']
    ? process.env['ALLOWED_ORIGINS'].split(',').map((o) => o.trim())
    : [];
  const allowlist = [...DEFAULT_ALLOWED_ORIGINS, ...customOrigins];
  return allowlist.includes(origin);
}

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
          styleSrc: ["'self'"],
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
 * Configures restrictive CORS with an explicit origin allowlist.
 * @param app - Express application instance.
 */
function applyCors(app: Express): void {
  const options: CorsOptions = {
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    maxAge: 600,
  };
  app.use(cors(options));
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
      limit: RATE_LIMIT_MAX,
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
