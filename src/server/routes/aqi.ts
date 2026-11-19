/**
 * AQI route handler.
 *
 * GET /api/aqi?lat=<latitude>&lon=<longitude>
 * Returns current air quality data for the given coordinates.
 */

import { aqiQuerySchema } from '@shared/schemas.js';
import type { ApiResponse, AqiData } from '@shared/types.js';
import { Router } from 'express';

import { ValidationError } from '../errors/app-errors.js';
import { fetchAqiData } from '../services/aqi.service.js';

/** AQI router instance. */
export const aqiRouter = Router();

/**
 * GET /api/aqi
 * Fetches current AQI data for the given coordinates.
 */
aqiRouter.get('/', (req, res, next) => {
  void (async (): Promise<void> => {
    try {
      const parsed = aqiQuerySchema.safeParse(req.query);

      if (!parsed.success) {
        throw new ValidationError(parsed.error.issues.map((i) => i.message).join('; '));
      }

      const aqiData = await fetchAqiData(parsed.data.lat, parsed.data.lon);

      const response: ApiResponse<AqiData> = {
        success: true,
        data: aqiData,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  })();
});
