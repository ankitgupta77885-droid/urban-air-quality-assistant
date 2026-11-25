/**
 * Gemini AI service for personalizing air quality advice.
 *
 * Takes structured rules-engine output and user context, sends them
 * to Gemini for personalized phrasing, validates the response against
 * a Zod schema, and falls back to rules-engine output on failure.
 */

import { GoogleGenAI } from '@google/genai';
import { GEMINI_TIMEOUT_MS } from '@shared/constants.js';
import { geminiResponseSchema } from '@shared/schemas.js';
import type { AqiData, PersonalizedAdvice, RulesEngineOutput, UserContext } from '@shared/types.js';

import { GeminiError } from '../errors/app-errors.js';

import { buildPrompt } from './gemini-prompt.js';
import { createLogger } from './logger.js';

const logger = createLogger('gemini');

/** Options for personalizing advice via the Gemini service. */
export interface PersonalizeAdviceOptions {
  /** Structured output from the deterministic rules engine. */
  readonly rulesOutput: RulesEngineOutput;
  /** Current air quality data. */
  readonly aqiData: AqiData;
  /** User's household and lifestyle context. */
  readonly context: UserContext;
  /** Gemini API key. */
  readonly apiKey: string;
  /** Gemini model identifier from environment. */
  readonly modelName: string;
}

/**
 * Personalizes rules-engine advice using the Gemini API.
 * Falls back to raw rules-engine output on any failure.
 * @param options - Advice personalization parameters.
 * @returns Personalized advice, with isBasicMode flag indicating fallback.
 */
export async function personalizeAdvice(
  options: PersonalizeAdviceOptions,
): Promise<PersonalizedAdvice> {
  try {
    return await callGemini(options);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.warn('Gemini personalization failed, using basic mode:', message);
    return buildFallbackAdvice(options.rulesOutput);
  }
}

/**
 * Calls the Gemini API to personalize advice.
 * @param options - Advice personalization parameters.
 * @returns Validated personalized advice from Gemini.
 */
async function callGemini(options: PersonalizeAdviceOptions): Promise<PersonalizedAdvice> {
  const { rulesOutput, aqiData, context, apiKey, modelName } = options;
  const ai = new GoogleGenAI({ apiKey, apiVersion: 'v1beta' });

  const prompt = buildPrompt(rulesOutput, aqiData, context);

  const result = await Promise.race([
    ai.models.generateContent({ model: modelName, contents: prompt }),
    rejectAfterTimeout(GEMINI_TIMEOUT_MS),
  ]);

  const responseText = result.text ?? '';
  const parsed = parseGeminiResponse(responseText);

  return {
    ...parsed,
    isBasicMode: false,
    personalization: 'ai',
  };
}

/**
 * Parses and validates the Gemini response text against the Zod schema.
 * @param responseText - Raw text response from Gemini.
 * @returns Validated response data.
 * @throws GeminiError if parsing or validation fails.
 */
function parseGeminiResponse(responseText: string): {
  riskLevel: PersonalizedAdvice['riskLevel'];
  riskSummary: string;
  actions: PersonalizedAdvice['actions'];
} {
  const cleaned = cleanJsonResponse(responseText);

  let jsonData: unknown;
  try {
    jsonData = JSON.parse(cleaned);
  } catch {
    throw new GeminiError(`Failed to parse Gemini response as JSON: ${cleaned.slice(0, 200)}`);
  }

  const result = geminiResponseSchema.safeParse(jsonData);

  if (!result.success) {
    const issues = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    throw new GeminiError(`Gemini response validation failed: ${issues}`);
  }

  return result.data;
}

/**
 * Strips markdown code fences and extra whitespace from the response.
 * @param text - Raw response text.
 * @returns Cleaned JSON string.
 */
function cleanJsonResponse(text: string): string {
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
 * Creates a promise that rejects after the given timeout.
 * @param ms - Timeout in milliseconds.
 * @returns A promise that always rejects with a GeminiError.
 */
export function rejectAfterTimeout(ms: number): Promise<never> {
  return new Promise((_resolve, reject) => {
    setTimeout(() => {
      reject(new GeminiError(`Gemini API timed out after ${ms}ms`));
    }, ms);
  });
}

/**
 * Converts rules-engine output to fallback personalized advice.
 * @param rulesOutput - Original rules engine output.
 * @returns Advice in PersonalizedAdvice format with isBasicMode=true.
 */
function buildFallbackAdvice(rulesOutput: RulesEngineOutput): PersonalizedAdvice {
  return {
    riskLevel: rulesOutput.riskLevel,
    riskSummary: rulesOutput.riskSummary,
    actions: rulesOutput.actions.map((action) => ({
      category: action.category,
      title: action.title,
      description: action.description,
      impact: action.impact,
      benefit: action.benefit,
      icon: action.icon,
    })),
    isBasicMode: true,
    personalization: 'basic',
  };
}

// Re-export for testing
export { buildFallbackAdvice, buildPrompt, cleanJsonResponse, parseGeminiResponse };
