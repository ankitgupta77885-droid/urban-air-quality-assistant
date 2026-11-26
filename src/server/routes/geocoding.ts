/**
 * Geocoding route handler.
 *
 * GET /api/geocoding/search?q=<query>
 * Returns matching city results from the Open-Meteo Geocoding API.
 */

import { Router } from 'express';

import { geocodingQuerySchema } from '../../shared/schemas.js';
import { searchCities } from '../services/geocoding.service.js';

import { asyncRoute, parseWithSchema, sendApiSuccess } from './route-helpers.js';

/** Geocoding router instance. */
export const geocodingRouter = Router();

/**
 * GET /api/geocoding/search
 * Searches for cities matching the query parameter.
 */
geocodingRouter.get(
  '/search',
  asyncRoute(async (req, res) => {
    const { q } = parseWithSchema(geocodingQuerySchema, req.query);
    const results = await searchCities(q);
    res.setHeader(
      'Cache-Control',
      'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400',
    );
    sendApiSuccess(res, results);
  }),
);
