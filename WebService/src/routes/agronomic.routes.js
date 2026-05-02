import express from 'express';
import {
  createAgronomicEvent,
  deleteAgronomicEvent,
  endIrrigation,
  getAgronomicAggregate,
  getAgronomicEvents,
  startIrrigation,
  updateAgronomicEvent,
} from '../controllers/agronomic.controller.js';

const router = express.Router();

router.get('/', getAgronomicEvents);
router.post('/', createAgronomicEvent);
router.patch('/:agro_event_id', updateAgronomicEvent);
router.delete('/:agro_event_id', deleteAgronomicEvent);
router.post('/irrigation/start', startIrrigation);
router.post('/irrigation/:agro_event_id/end', endIrrigation);
router.get('/aggregate', getAgronomicAggregate);

export default router;
