/**
 * Unit tests for requestTimeout middleware.
 *
 * Tests the 408 timeout path using fake timers and the headersSent guard.
 */

import { IncomingMessage, ServerResponse } from 'node:http';
import { Socket } from 'node:net';

import { REQUEST_TIMEOUT_MS } from '@shared/constants.js';
import type { NextFunction, Request, Response } from 'express';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { requestTimeout } from '../../src/server/middleware/timeout.js';

function createMockRequest(): Request {
  const socket = new Socket();
  return new IncomingMessage(socket) as unknown as Request;
}

interface MockResponseResult {
  res: Response;
  statusSpy: ReturnType<typeof vi.fn>;
  jsonSpy: ReturnType<typeof vi.fn>;
}

function createMockResponse(headersSent = false): MockResponseResult {
  const socket = new Socket();
  const req = new IncomingMessage(socket);
  const res = new ServerResponse(req);
  Object.defineProperty(res, 'headersSent', { value: headersSent, writable: true });

  const expressRes = res as unknown as Response;
  const statusSpy = vi.fn().mockReturnValue(expressRes);
  const jsonSpy = vi.fn().mockReturnValue(expressRes);

  expressRes.status = statusSpy;
  expressRes.json = jsonSpy;

  return { res: expressRes, statusSpy, jsonSpy };
}

describe('requestTimeout middleware', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('calls next() immediately and clears timer when response finishes', () => {
    const req = createMockRequest();
    const { res, statusSpy } = createMockResponse();
    const next: NextFunction = vi.fn();

    requestTimeout(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);

    res.emit('finish');

    vi.advanceTimersByTime(REQUEST_TIMEOUT_MS + 100);
    expect(statusSpy).not.toHaveBeenCalled();
  });

  it('returns 408 when request exceeds timeout and headers are not yet sent', () => {
    const req = createMockRequest();
    const { res, statusSpy, jsonSpy } = createMockResponse();
    const next: NextFunction = vi.fn();

    requestTimeout(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(REQUEST_TIMEOUT_MS);

    expect(statusSpy).toHaveBeenCalledWith(408);
    expect(jsonSpy).toHaveBeenCalledWith({
      success: false,
      error: 'Request timed out.',
      code: 'REQUEST_TIMEOUT',
    });
  });

  it('does not send 408 when headers have already been sent before timeout', () => {
    const req = createMockRequest();
    const { res, statusSpy, jsonSpy } = createMockResponse(true);
    const next: NextFunction = vi.fn();

    requestTimeout(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(REQUEST_TIMEOUT_MS);

    expect(statusSpy).not.toHaveBeenCalled();
    expect(jsonSpy).not.toHaveBeenCalled();
  });
});
