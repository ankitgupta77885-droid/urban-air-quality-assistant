/**
 * Custom application errors with typed codes.
 */

import { AppError } from '../../shared/errors.js';

export {
  ApiClientError,
  AppError,
  UpstreamApiError,
  ValidationError,
} from '../../shared/errors.js';

/** Thrown when the Gemini API times out or returns invalid data. */
export class GeminiError extends AppError {
  constructor(message: string) {
    super(message, 502, 'GEMINI_ERROR');
    this.name = 'GeminiError';
  }
}
