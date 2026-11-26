/**
 * Gemini AI service for personalizing air quality advice.
 *
 * Takes structured rules-engine output and user context, sends them
 * to Gemini for personalized phrasing, validates the response against
 * a Zod schema, and falls back to rules-engine output on failure.
 */

import { GoogleGenAI } from '@google/genai';

import { AQI_CACHE_TTL_MS, GEMINI_TIMEOUT_MS } from '../../shared/constants.js';
import { geminiResponseSchema } from '../../shared/schemas.js';
import type {
  AqiData,
  PersonalizedAdvice,
  RulesEngineOutput,
  UserContext,
} from '../../shared/types.js';
import { GeminiError } from '../errors/app-errors.js';

import { TtlCache } from './cache.js';
import { buildPrompt } from './gemini-prompt.js';
import { createLogger } from './logger.js';

const logger = createLogger('gemini');
const adviceCache = new TtlCache<PersonalizedAdvice>(AQI_CACHE_TTL_MS);
const genAiClients = new Map<string, GoogleGenAI>();
const GEMINI_REQUEST_CONFIG = { responseMimeType: 'application/json', temperature: 0.4 } as const;

/** Options for personalizing advice via the Gemini service. */
export interface PersonalizeAdviceOptions {
  readonly rulesOutput: RulesEngineOutput;
  readonly aqiData: AqiData;
  readonly context: UserContext;
  readonly apiKey: string;
  readonly modelName: string;
}

/**
 * Personalizes rules-engine advice using the Gemini API.
 * Returns cached AI advice on repeat requests and falls back to rules-engine output on failure.
 * @param options - Advice personalization parameters.
 * @returns Personalized advice, with isBasicMode flag indicating fallback.
 */
export async function personalizeAdvice(
  options: PersonalizeAdviceOptions,
): Promise<PersonalizedAdvice> {
  const cacheKey = buildAdviceCacheKey(options);
  const cached = adviceCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const advice = await callGemini(options);
    adviceCache.set(cacheKey, advice);
    return advice;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.warn('Gemini personalization failed, using basic mode:', message);
    return buildFallbackAdvice(options.rulesOutput);
  }
}

/** Builds a deterministic cache key for personalized AI advice. */
function buildAdviceCacheKey({ modelName, aqiData, context }: PersonalizeAdviceOptions): string {
  return `${modelName}:${aqiData.aqi}:${aqiData.timestamp}:${JSON.stringify(context)}`;
}

/** Returns a cached GoogleGenAI client instance for the given API key. */
function getGenAiClient(apiKey: string): GoogleGenAI {
  const existing = genAiClients.get(apiKey);
  if (existing) {
    return existing;
  }
  const client = new GoogleGenAI({ apiKey, apiVersion: 'v1beta' });
  genAiClients.set(apiKey, client);
  return client;
}

/** Calls generateContent with JSON output config and a single retry on transient failure. */
async function generateWithRetry(
  ai: GoogleGenAI,
  model: string,
  contents: string,
): Promise<{ text?: string | null }> {
  const request = { model, contents, config: GEMINI_REQUEST_CONFIG };
  try {
    return await ai.models.generateContent(request);
  } catch (err: unknown) {
    logger.warn(`Initial call to ${model} failed, retrying once:`, err);
    return await ai.models.generateContent(request);
  }
}

/** Calls the Gemini API to personalize advice. */
async function callGemini(options: PersonalizeAdviceOptions): Promise<PersonalizedAdvice> {
  const { rulesOutput, aqiData, context, apiKey, modelName } = options;
  const ai = getGenAiClient(apiKey);
  const prompt = buildPrompt(rulesOutput, aqiData, context);

  const result = await Promise.race([
    generateWithRetry(ai, modelName, prompt),
    rejectAfterTimeout(GEMINI_TIMEOUT_MS),
  ]);

  const parsed = parseGeminiResponse(result.text ?? '');
  return { ...parsed, isBasicMode: false, personalization: 'ai' };
}

/** Parses and validates the Gemini response text against the Zod schema. */
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

/** Strips markdown code fences and extra whitespace from the response. */
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

/** Creates a promise that rejects with a GeminiError after the given timeout. */
export function rejectAfterTimeout(ms: number): Promise<never> {
  return new Promise((_resolve, reject) => {
    setTimeout(() => {
      reject(new GeminiError(`Gemini API timed out after ${ms}ms`));
    }, ms);
  });
}

/** Converts rules-engine output to fallback personalized advice. */
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

/** Clears cached Gemini advice responses and clients (for testing). */
export function clearGeminiCache(): void {
  adviceCache.clear();
  genAiClients.clear();
}

// Re-export for testing
export { buildFallbackAdvice, buildPrompt, cleanJsonResponse, parseGeminiResponse };
