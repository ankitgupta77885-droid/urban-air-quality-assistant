/* v8 ignore start -- top JSDoc anchors TypeScript ESM preamble sourcemaps */
/**
 * Shared error classes for BreatheWell.
 *
 * Base and typed application errors used across both server and client.
 */
/* v8 ignore stop */

/** Base application error with a typed error code and HTTP status. */
export class AppError extends Error {
  /** HTTP status code for this error. */
  public readonly statusCode: number;
  /** Machine-readable error code. */
  public readonly code: string;

  constructor(message: string, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

/** Thrown when input validation fails. */
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

/** Thrown when upstream services (e.g. Open-Meteo) fail or return malformed data. */
export class UpstreamApiError extends AppError {
  constructor(message = 'Upstream service returned an invalid response', statusCode = 502) {
    super(message, statusCode, 'UPSTREAM_API_ERROR');
    this.name = 'UpstreamApiError';
  }
}

/** Thrown when frontend API client receives an error or invalid response shape. */
export class ApiClientError extends AppError {
  constructor(message: string, statusCode = 500, code = 'API_CLIENT_ERROR') {
    super(message, statusCode, code);
    this.name = 'ApiClientError';
  }
}
