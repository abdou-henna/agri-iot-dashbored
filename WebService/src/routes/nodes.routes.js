import express from 'express';
import { getNodes } from '../controllers/nodes.controller.js';

const router = express.Router();

// GET /api/v1/nodes
router.get('/', getNodes);

export default router;
