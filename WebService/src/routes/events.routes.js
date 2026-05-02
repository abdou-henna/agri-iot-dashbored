import express from 'express';
import { getEvents } from '../controllers/status.controller.js';

const router = express.Router();

// GET /api/v1/events
router.get('/', getEvents);

export default router;
