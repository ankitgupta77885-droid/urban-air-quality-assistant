/**
 * Unit tests for errorHandler and route-helpers headersSent guards.
 */

import { IncomingMessage, ServerResponse } from 'node:http';
import { Socket } from 'node:net';

import type { NextFunction, Request, Response } from 'express';
import { describe, expect, it, vi } from 'vitest';

import { errorHandler } from '../../src/server/middleware/error-handler.js';
import { sendApiSuccess } from '../../src/server/routes/route-helpers.js';

function createMockRes(headersSent: boolean): {
  res: Response;
  jsonSpy: ReturnType<typeof vi.fn>;
  statusSpy: ReturnType<typeof vi.fn>;
} {
  const req = new IncomingMessage(new Socket());
  const rawRes = new ServerResponse(req);
  Object.defineProperty(rawRes, 'headersSent', { value: headersSent, writable: true });
  const res = rawRes as unknown as Response;
  const jsonSpy = vi.fn().mockReturnValue(res);
  const statusSpy = vi.fn().mockReturnValue({ json: jsonSpy });
  res.status = statusSpy;
  res.json = jsonSpy;
  return { res, jsonSpy, statusSpy };
}

describe('Response headersSent guards', () => {
  it('delegates to next(err) when headers are already sent in errorHandler', () => {
    const err = new Error('late failure');
    const req = new IncomingMessage(new Socket()) as unknown as Request;
    const { res, statusSpy } = createMockRes(true);
    const next = vi.fn() as unknown as NextFunction;

    errorHandler(err, req, res, next);

    expect(next).toHaveBeenCalledWith(err);
    expect(statusSpy).not.toHaveBeenCalled();
  });

  it('skips res.json in sendApiSuccess when headers are already sent', () => {
    const { res, jsonSpy } = createMockRes(true);

    sendApiSuccess(res, { ok: true });

    expect(jsonSpy).not.toHaveBeenCalled();
  });
});
