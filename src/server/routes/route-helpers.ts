/**
 * Shared Express route helpers for validation, async error forwarding, and JSON responses.
 */

import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { z } from 'zod';

import type { ApiResponse } from '../../shared/types.js';
import { ValidationError } from '../errors/app-errors.js';

/**
 * Wraps an async Express route handler so rejected promises are forwarded to {@link NextFunction}.
 * @param handler - Async request handler function.
 * @returns Standard Express middleware compatible with synchronous router signatures.
 */
export function asyncRoute(
  handler: (req: Request, res: Response) => Promise<void>,
): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    void handler(req, res).catch(next);
  };
}

/**
 * Parses and validates unknown input against a Zod schema, throwing {@link ValidationError} on failure.
 * @param schema - Zod schema to apply.
 * @param input - Untrusted request data (query, params, or body).
 * @returns Validated, strongly typed data.
 */
export function parseWithSchema<T>(schema: z.ZodType<T>, input: unknown): T {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues.map((issue) => issue.message).join('; '));
  }
  return parsed.data;
}

/**
 * Sends a typed successful JSON response envelope.
 * @param res - Express response object.
 * @param data - Response payload to serialize.
 */
export function sendApiSuccess(res: Response, data: unknown): void {
  if (res.headersSent) {
    return;
  }
  const response: ApiResponse<unknown> = { success: true, data };
  res.json(response);
}
