import express from 'express';
import { getEvents, getEventsAggregate } from '../controllers/status.controller.js';

const router = express.Router();

// GET /api/v1/events
router.get('/', getEvents);
router.get('/aggregate', getEventsAggregate);

export default router;
