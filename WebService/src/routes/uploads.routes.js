import express from 'express';
import { getUploads } from '../controllers/uploads.controller.js';

const router = express.Router();

// GET /api/v1/uploads
router.get('/', getUploads);

export default router;
