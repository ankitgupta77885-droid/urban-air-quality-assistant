/**
 * Shared upstream HTTP client for fetching and schema-validating external JSON APIs.
 *
 * Enforces HTTPS and an explicit hostname allowlist to guard against SSRF.
 */

import type { z } from 'zod';

import {
  AIR_QUALITY_API_URL,
  GEOCODING_API_URL,
  OUTBOUND_TIMEOUT_MS,
} from '../../shared/constants.js';
import { UpstreamApiError } from '../errors/app-errors.js';

const ALLOWED_UPSTREAM_HOSTS = new Set<string>([
  new URL(AIR_QUALITY_API_URL).hostname,
  new URL(GEOCODING_API_URL).hostname,
]);

/**
 * Verifies an outbound request URL uses HTTPS and targets an allowlisted upstream host.
 * @param url - Outbound request URL string.
 * @returns Parsed safe URL instance.
 * @throws UpstreamApiError if the URL is malformed, insecure, or non-allowlisted.
 */
export function assertAllowedUpstreamUrl(url: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new UpstreamApiError('Invalid upstream service URL');
  }

  if (parsed.protocol !== 'https:' || !ALLOWED_UPSTREAM_HOSTS.has(parsed.hostname)) {
    throw new UpstreamApiError('Disallowed upstream service host');
  }

  return parsed;
}

/**
 * Fetches JSON from an allowlisted upstream service with a fixed timeout and Zod validation.
 * @param url - Fully qualified allowlisted request URL.
 * @param schema - Zod schema used to validate the JSON response body.
 * @param serviceName - Human-readable upstream name included in error messages.
 * @returns Validated payload.
 * @throws UpstreamApiError if the URL is disallowed, status is non-OK, JSON is malformed, or schema fails.
 */
export async function fetchValidatedJson<T>(
  url: string,
  schema: z.ZodType<T>,
  serviceName: string,
): Promise<T> {
  const safeUrl = assertAllowedUpstreamUrl(url);
  const response = await fetch(safeUrl.toString(), {
    signal: AbortSignal.timeout(OUTBOUND_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new UpstreamApiError(`${serviceName} returned status ${response.status}`);
  }

  let rawJson: unknown;
  try {
    rawJson = await response.json();
  } catch {
    throw new UpstreamApiError(`${serviceName} returned malformed JSON`);
  }

  const parsed = schema.safeParse(rawJson);
  if (!parsed.success) {
    throw new UpstreamApiError(`${serviceName} returned invalid data`);
  }

  return parsed.data;
}
