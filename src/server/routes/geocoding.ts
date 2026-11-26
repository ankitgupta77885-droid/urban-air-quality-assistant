/**
 * Geocoding route handler.
 *
 * GET /api/geocoding/search?q=<query>
 * Returns matching city results from the Open-Meteo Geocoding API.
 */

import { Router } from 'express';

import { geocodingQuerySchema } from '../../shared/schemas.js';
import type { ApiResponse, GeocodingResult } from '../../shared/types.js';
import { ValidationError } from '../errors/app-errors.js';
import { searchCities } from '../services/geocoding.service.js';

/** Geocoding router instance. */
export const geocodingRouter = Router();

/**
 * GET /api/geocoding/search
 * Searches for cities matching the query parameter.
 */
geocodingRouter.get('/search', (req, res, next) => {
  void (async (): Promise<void> => {
    try {
      const parsed = geocodingQuerySchema.safeParse(req.query);

      if (!parsed.success) {
        throw new ValidationError(parsed.error.issues.map((i) => i.message).join('; '));
      }

      const results = await searchCities(parsed.data.q);

      const response: ApiResponse<GeocodingResult[]> = {
        success: true,
        data: results,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  })();
});
