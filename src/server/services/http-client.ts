/**
 * Shared upstream HTTP client for fetching and schema-validating external JSON APIs.
 */

import type { z } from 'zod';

import { OUTBOUND_TIMEOUT_MS } from '../../shared/constants.js';
import { UpstreamApiError } from '../errors/app-errors.js';

/**
 * Fetches JSON from an upstream service with a fixed timeout and Zod validation.
 * @param url - Fully qualified request URL.
 * @param schema - Zod schema used to validate the JSON response body.
 * @param serviceName - Human-readable upstream name included in error messages.
 * @returns Validated payload.
 * @throws UpstreamApiError if the status is non-OK or the payload fails validation.
 */
export async function fetchValidatedJson<T>(
  url: string,
  schema: z.ZodType<T>,
  serviceName: string,
): Promise<T> {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(OUTBOUND_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new UpstreamApiError(`${serviceName} returned status ${response.status}`);
  }

  const rawJson: unknown = await response.json();
  const parsed = schema.safeParse(rawJson);

  if (!parsed.success) {
    throw new UpstreamApiError(`${serviceName} returned invalid data`);
  }

  return parsed.data;
}
