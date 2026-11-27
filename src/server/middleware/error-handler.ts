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

const SAFE_STATUS_MESSAGES: Readonly<Record<number, string>> = {
  413: 'Request payload too large.',
  400: 'Invalid request payload.',
};

/**
 * Express error-handling middleware. Must have 4 parameters.
 * @param err - The thrown error.
 * @param _req - Express request object.
 * @param res - Express response object.
 * @param next - Next middleware function.
 */
export function errorHandler(err: Error, _req: Request, res: Response, next: NextFunction): void {
  if (res.headersSent) {
    next(err);
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
      code: err.code,
    });
    return;
  }

  if (handleExpressBuiltIn(err, res)) {
    return;
  }

  logger.error('Unhandled error:', err.message);
  res.status(500).json({
    success: false,
    error: 'An unexpected error occurred.',
    code: 'INTERNAL_ERROR',
  });
}

/**
 * Type guard to check if an unknown error has a numeric status property.
 * @param value - Unknown error value.
 * @returns True if value is an object with a numeric status property.
 */
function hasStatusProperty(value: unknown): value is { status: number } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'status' in value &&
    typeof value.status === 'number'
  );
}

/**
 * Handles Express built-in errors (e.g., PayloadTooLargeError, SyntaxError).
 * Logs internal details to server log and returns a safe generic message to clients.
 * @param err - Error instance.
 * @param res - Express response.
 * @returns True if handled.
 */
function handleExpressBuiltIn(err: Error, res: Response): boolean {
  if (hasStatusProperty(err)) {
    const status = err.status;
    logger.warn('Express request error:', err.message);

    res.status(status).json({
      success: false,
      error: getSafeErrorMessage(status),
      code: 'REQUEST_ERROR',
    });
    return true;
  }
  return false;
}

/**
 * Returns safe generic error messages for HTTP status codes.
 * @param status - HTTP status code.
 * @returns Sanitized error message.
 */
function getSafeErrorMessage(status: number): string {
  return SAFE_STATUS_MESSAGES[status] ?? 'Request error.';
}
