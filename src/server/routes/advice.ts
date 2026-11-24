/**
 * Advice route handler.
 *
 * POST /api/advice
 * Accepts user context and location, returns personalized air quality advice.
 */

import { adviceRequestSchema } from '@shared/schemas.js';
import type { ApiResponse, PersonalizedAdvice } from '@shared/types.js';
import { Router, type Request, type Response } from 'express';

import { ValidationError } from '../errors/app-errors.js';
import { fetchAqiData } from '../services/aqi.service.js';
import { personalizeAdvice } from '../services/gemini.service.js';
import { generateAdvice } from '../services/rules-engine.js';

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

  router.post('/', (req, res, next) => {
    void (async (): Promise<void> => {
      try {
        await handleAdviceRequest(req, res, env);
      } catch (error) {
        next(error);
      }
    })();
  });

  return router;
}

/**
 * Handles advice generation request.
 * @param req - Express request.
 * @param res - Express response.
 * @param env - Environment configuration.
 */
async function handleAdviceRequest(req: Request, res: Response, env: AdviceEnv): Promise<void> {
  const parsed = adviceRequestSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues.map((i) => i.message).join('; '));
  }

  const { latitude, longitude, context } = parsed.data;
  const aqiData = await fetchAqiData(latitude, longitude);
  const rulesOutput = generateAdvice(aqiData, context);
  const personalizedAdvice = await personalizeAdvice({
    rulesOutput,
    aqiData,
    context,
    apiKey: env.apiKey,
    modelName: env.modelName,
  });

  const response: ApiResponse<PersonalizedAdvice> = {
    success: true,
    data: personalizedAdvice,
  };
  res.json(response);
}
