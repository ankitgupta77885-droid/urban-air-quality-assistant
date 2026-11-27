/**
 * Request timeout middleware.
 *
 * Aborts requests that exceed the configured timeout threshold.
 */

import type { NextFunction, Request, Response } from 'express';

import { REQUEST_TIMEOUT_MS } from '../../shared/constants.js';

/**
 * Middleware that sets a timeout on each request.
 * Returns 408 if the request takes too long.
 * @param _req - Express request object.
 * @param res - Express response object.
 * @param next - Next middleware function.
 */
export function requestTimeout(_req: Request, res: Response, next: NextFunction): void {
  const timer = setTimeout(() => {
    if (!res.headersSent) {
      res.status(408).json({
        success: false,
        error: 'Request timed out.',
        code: 'REQUEST_TIMEOUT',
      });
    }
  }, REQUEST_TIMEOUT_MS);

  const cancelTimer = (): void => {
    clearTimeout(timer);
    res.off('finish', cancelTimer);
    res.off('close', cancelTimer);
  };

  res.on('finish', cancelTimer);
  res.on('close', cancelTimer);

  next();
}
