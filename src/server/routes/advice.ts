/**
 * Advice route handler.
 *
 * POST /api/advice
 * Accepts user context and location, returns personalized air quality advice.
 */

import { Router, type Request, type Response } from 'express';

import { adviceRequestSchema } from '../../shared/schemas.js';
import { fetchAqiData } from '../services/aqi.service.js';
import { personalizeAdvice } from '../services/gemini.service.js';
import { generateAdvice } from '../services/rules-engine.js';

import { asyncRoute, parseWithSchema, sendApiSuccess } from './route-helpers.js';

/** Environment variables needed at runtime. */
interface AdviceEnv {
  readonly apiKey: string;
  readonly modelName: string;
}

/**
 * Creates the advice route with injected environment config.
 * @param env - Object containing the Gemini API key and model name.
 * @returns Configured advice router.
 */
export function createAdviceRouter(env: AdviceEnv): Router {
  const router = Router();

  router.post(
    '/',
    asyncRoute(async (req, res) => {
      await handleAdviceRequest(req, res, env);
    }),
  );

  return router;
}

/**
 * Handles advice generation request.
 * @param req - Express request.
 * @param res - Express response.
 * @param env - Environment configuration.
 */
async function handleAdviceRequest(req: Request, res: Response, env: AdviceEnv): Promise<void> {
  const { latitude, longitude, context } = parseWithSchema(adviceRequestSchema, req.body);
  const aqiData = await fetchAqiData(latitude, longitude);
  const rulesOutput = generateAdvice(aqiData, context);
  const personalizedAdvice = await personalizeAdvice({
    rulesOutput,
    aqiData,
    context,
    apiKey: env.apiKey,
    modelName: env.modelName,
  });

  sendApiSuccess(res, personalizedAdvice);
}
