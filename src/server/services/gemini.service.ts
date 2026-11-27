/**
 * Gemini AI service for personalizing air quality advice.
 *
 * Coordinates response caching, SDK client reuse, retry/timeout handling,
 * and automatic fallback to deterministic rules-engine output on failure.
 */

import { GoogleGenAI } from '@google/genai';

import { TtlCache } from '../../shared/cache.js';
import {
  AQI_CACHE_TTL_MS,
  GEMINI_TIMEOUT_MS,
  PM25_ELEVATED_THRESHOLD,
} from '../../shared/constants.js';
import type {
  AqiData,
  PersonalizedAdvice,
  RulesEngineOutput,
  UserContext,
} from '../../shared/types.js';
import { GeminiError } from '../errors/app-errors.js';

import { buildPrompt } from './gemini-prompt.js';
import { buildFallbackAdvice, parseGeminiResponse } from './gemini-response.js';
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
  const normalizedContext = {
    ...context,
    healthConditions: [...context.healthConditions].sort(),
  };
  const elevatedPm25 = aqiData.pollutants.some(
    (p) => p.name === 'pm2_5' && p.value > PM25_ELEVATED_THRESHOLD,
  );
  return `${modelName}:${aqiData.aqi}:${aqiData.dominantPollutant}:${elevatedPm25}:${aqiData.timestamp}:${JSON.stringify(normalizedContext)}`;
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

/** Calls the Gemini API with guaranteed timeout cleanup on completion or error. */
async function callGemini(options: PersonalizeAdviceOptions): Promise<PersonalizedAdvice> {
  const { rulesOutput, aqiData, context, apiKey, modelName } = options;
  const ai = getGenAiClient(apiKey);
  const prompt = buildPrompt(rulesOutput, aqiData, context);
  const timeout = createTimeoutGuard(GEMINI_TIMEOUT_MS);

  try {
    const result = await Promise.race([generateWithRetry(ai, modelName, prompt), timeout.promise]);
    const parsed = parseGeminiResponse(result.text ?? '');
    return { ...parsed, isBasicMode: false, personalization: 'ai' };
  } finally {
    timeout.cancel();
  }
}

/** Creates a cancellable timeout guard so settled promises never leak open timers. */
function createTimeoutGuard(ms: number): { promise: Promise<never>; cancel: () => void } {
  let timerId: ReturnType<typeof setTimeout>;
  const promise = new Promise<never>((_resolve, reject) => {
    timerId = setTimeout(() => {
      reject(new GeminiError(`Gemini API timed out after ${ms}ms`));
    }, ms);
  });

  return {
    promise,
    cancel: () => {
      clearTimeout(timerId);
    },
  };
}

/** Creates a promise that rejects with a GeminiError after the given timeout. */
export function rejectAfterTimeout(ms: number): Promise<never> {
  return createTimeoutGuard(ms).promise;
}

/** Clears cached Gemini advice responses and clients (for testing). */
export function clearGeminiCache(): void {
  adviceCache.clear();
  genAiClients.clear();
}
