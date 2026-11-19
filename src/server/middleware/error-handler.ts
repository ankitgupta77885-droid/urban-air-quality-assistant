/**
 * Global error handler middleware.
 *
 * Catches all errors from route handlers and returns consistent
 * JSON error responses with appropriate HTTP status codes.
 */

import type { NextFunction, Request, Response } from 'express';

import { AppError } from '../errors/app-errors.js';
import { createLogger } from '../services/logger.js';

const logger = createLogger('error-handler');

/**
 * Express error-handling middleware. Must have 4 parameters.
 * @param err - The thrown error.
 * @param _req - Express request object.
 * @param res - Express response object.
 * @param _next - Next middleware function.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
      code: err.code,
    });
    return;
  }

  /* Handle Express built-in errors (e.g., PayloadTooLargeError). */
  if ('status' in err && typeof (err as Record<string, unknown>).status === 'number') {
    const status = (err as Record<string, unknown>).status as number;
    res.status(status).json({
      success: false,
      error: err.message,
      code: 'REQUEST_ERROR',
    });
    return;
  }

  logger.error('Unhandled error:', err.message);

  res.status(500).json({
    success: false,
    error: 'An unexpected error occurred.',
    code: 'INTERNAL_ERROR',
  });
}
