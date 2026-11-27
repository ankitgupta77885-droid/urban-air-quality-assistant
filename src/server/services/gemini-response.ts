/**
 * Gemini response cleaning, Zod schema validation, and rules-engine fallback builder.
 */

import { ERROR_PREVIEW_MAX_LENGTH } from '../../shared/constants.js';
import { geminiResponseSchema } from '../../shared/schemas.js';
import type { PersonalizedAdvice, RulesEngineOutput } from '../../shared/types.js';
import { GeminiError } from '../errors/app-errors.js';

/** Validated core payload extracted from a Gemini JSON response. */
export interface ParsedGeminiPayload {
  readonly riskLevel: PersonalizedAdvice['riskLevel'];
  readonly riskSummary: string;
  readonly actions: PersonalizedAdvice['actions'];
}

/**
 * Strips optional markdown code fences and outer whitespace from a model reply.
 * @param text - Raw text returned by Gemini.
 */
export function cleanJsonResponse(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
}

/**
 * Parses and validates the Gemini response text against {@link geminiResponseSchema}.
 * @param responseText - Raw response text returned by the model.
 * @throws GeminiError if JSON parsing or Zod schema validation fails.
 */
export function parseGeminiResponse(responseText: string): ParsedGeminiPayload {
  const cleaned = cleanJsonResponse(responseText);

  let jsonData: unknown;
  try {
    jsonData = JSON.parse(cleaned);
  } catch {
    throw new GeminiError(
      `Failed to parse Gemini response as JSON: ${cleaned.slice(0, ERROR_PREVIEW_MAX_LENGTH)}`,
    );
  }

  const result = geminiResponseSchema.safeParse(jsonData);
  if (!result.success) {
    const issues = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    throw new GeminiError(`Gemini response validation failed: ${issues}`);
  }

  return result.data;
}

/**
 * Converts deterministic rules-engine output into basic-mode fallback advice.
 * @param rulesOutput - Deterministic rules-engine output.
 */
export function buildFallbackAdvice(rulesOutput: RulesEngineOutput): PersonalizedAdvice {
  return {
    riskLevel: rulesOutput.riskLevel,
    riskSummary: rulesOutput.riskSummary,
    actions: rulesOutput.actions.map((action) => ({ ...action })),
    isBasicMode: true,
    personalization: 'basic',
  };
}
