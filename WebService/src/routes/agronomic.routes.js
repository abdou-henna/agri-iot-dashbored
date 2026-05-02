import express from 'express';
import { createAgronomicEvent, getAgronomicAggregate, getAgronomicEvents } from '../controllers/agronomic.controller.js';

const router = express.Router();

router.post('/', createAgronomicEvent);
router.get('/', getAgronomicEvents);
router.get('/aggregate', getAgronomicAggregate);

export default router;

