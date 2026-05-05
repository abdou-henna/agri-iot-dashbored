import express from 'express';
import { postGeminiInsight } from '../controllers/gemini.controller.js';

const router = express.Router();

router.post('/insight', postGeminiInsight);

export default router;
