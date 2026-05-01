import express from 'express';
import { apiKeyAuth } from '../middleware/apiKeyAuth.js';
import { uploadData } from '../controllers/upload.controller.js';

const router = express.Router();

// POST /api/v1/upload
router.post('/', apiKeyAuth, uploadData);

export default router;