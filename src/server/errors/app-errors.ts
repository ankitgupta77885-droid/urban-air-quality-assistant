/** Custom application errors with typed codes. */

/** Base application error with a typed error code and HTTP status. */
export class AppError extends Error {
  /** HTTP status code for this error. */
  public readonly statusCode: number;
  /** Machine-readable error code. */
  public readonly code: string;

  constructor(message: string, statusCode: number, code: string) {
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

/** Thrown when an external API call fails. */
export class ExternalApiError extends AppError {
  constructor(message: string, statusCode = 502) {
    super(message, statusCode, 'EXTERNAL_API_ERROR');
    this.name = 'ExternalApiError';
  }
}

/** Thrown when the Gemini API times out or returns invalid data. */
export class GeminiError extends AppError {
  constructor(message: string) {
    super(message, 502, 'GEMINI_ERROR');
    this.name = 'GeminiError';
  }
}

/** Thrown when a requested resource is not found. */
export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}
