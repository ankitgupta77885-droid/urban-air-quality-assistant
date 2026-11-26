/**
 * AQI route handler.
 *
 * GET /api/aqi?lat=<latitude>&lon=<longitude>
 * Returns current air quality data for the given coordinates.
 */

import { Router } from 'express';

import { aqiQuerySchema } from '../../shared/schemas.js';
import { fetchAqiData } from '../services/aqi.service.js';

import { asyncRoute, parseWithSchema, sendApiSuccess } from './route-helpers.js';

/** AQI router instance. */
export const aqiRouter = Router();

/**
 * GET /api/aqi
 * Fetches current AQI data for the given coordinates.
 */
aqiRouter.get(
  '/',
  asyncRoute(async (req, res) => {
    const { lat, lon } = parseWithSchema(aqiQuerySchema, req.query);
    const aqiData = await fetchAqiData(lat, lon);
    sendApiSuccess(res, aqiData);
  }),
);
