import express from 'express';
import { getReadings, getReadingAggregate } from '../controllers/readings.controller.js';

const router = express.Router();

// GET /api/v1/readings/aggregate
router.get('/aggregate', getReadingAggregate);

// GET /api/v1/readings
router.get('/', getReadings);

export default router;
