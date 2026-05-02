import express from 'express';
import { getStatus } from '../controllers/status.controller.js';

const router = express.Router();

// GET /api/v1/status
router.get('/', getStatus);

export default router;