/**
 * Security middleware configuration.
 *
 * Sets up helmet (CSP), CORS, rate limiting, and body size limits.
 */

import compression from 'compression';
import cors, { type CorsOptions } from 'cors';
import express, { type Express } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

import {
  ADVICE_RATE_LIMIT_MAX,
  BODY_SIZE_LIMIT,
  CORS_MAX_AGE_SECONDS,
  RATE_LIMIT_MAX,
  RATE_LIMIT_WINDOW_MS,
} from '../../shared/constants.js';

/** Default allowed localhost origins for local development and automated tests. */
const DEFAULT_ALLOWED_ORIGINS: readonly string[] = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
] as const;

/** Options for security middleware configuration. */
export interface SecurityOptions {
  readonly allowedOrigins?: readonly string[];
}

/**
 * Checks whether an origin is allowed by the CORS policy.
 * Localhost development origins are allowed outside production unless explicitly configured.
 * @param origin - Request origin header value or undefined.
 * @param customOrigins - App-specific allowed origins.
 * @param isProduction - Whether production origin strictness is enforced.
 * @returns True if origin is allowed, false otherwise.
 */
export function isAllowedOrigin(
  origin: string | undefined,
  customOrigins: readonly string[] = [],
  isProduction = process.env['NODE_ENV'] === 'production',
): boolean {
  if (!origin) {
    return true;
  }

  if (customOrigins.includes(origin)) {
    return true;
  }

  return !isProduction && DEFAULT_ALLOWED_ORIGINS.includes(origin);
}

/**
 * Applies all security middleware to the Express app.
 * @param app - Express application instance.
 * @param options - Optional security configuration options.
 */
export function applySecurityMiddleware(app: Express, options: SecurityOptions = {}): void {
  applyHelmet(app);
  applyPermissionsPolicy(app);
  applyCors(app, options.allowedOrigins ?? []);
  applyRateLimit(app);
  applyBodyParsing(app);
  applyCompression(app);
}

/** Configures helmet with strict Content-Security-Policy, HSTS preload, and DENY framing. */
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
      frameguard: { action: 'deny' },
      referrerPolicy: { policy: 'no-referrer' },
      hsts: { maxAge: 63_072_000, includeSubDomains: true, preload: true },
      crossOriginEmbedderPolicy: false,
    }),
  );
}

/** Restricts browser device features cleanly while permitting same-origin geolocation. */
function applyPermissionsPolicy(app: Express): void {
  app.use((_req, res, next) => {
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');
    next();
  });
}

/**
 * Configures restrictive CORS with an explicit origin allowlist.
 * @param app - Express application instance.
 * @param allowedOrigins - App-specific allowed origin URLs.
 */
function applyCors(app: Express, allowedOrigins: readonly string[]): void {
  const options: CorsOptions = {
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin, allowedOrigins)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    maxAge: CORS_MAX_AGE_SECONDS,
  };
  app.use(cors(options));
}

/**
 * Configures global API rate limiting plus stricter quota protection on `/api/advice`.
 * @param app - Express application instance.
 */
function applyRateLimit(app: Express): void {
  const rateLimitMessage = {
    success: false,
    error: 'Too many requests, please try again later.',
  };

  app.use(
    '/api',
    rateLimit({
      windowMs: RATE_LIMIT_WINDOW_MS,
      limit: RATE_LIMIT_MAX,
      standardHeaders: true,
      legacyHeaders: false,
      message: rateLimitMessage,
    }),
  );

  app.use(
    '/api/advice',
    rateLimit({
      windowMs: RATE_LIMIT_WINDOW_MS,
      limit: ADVICE_RATE_LIMIT_MAX,
      standardHeaders: true,
      legacyHeaders: false,
      message: rateLimitMessage,
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
