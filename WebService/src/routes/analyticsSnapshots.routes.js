import express from 'express';
import {
  getAnalyticsSnapshot,
  invalidateAnalyticsSnapshot,
  listAnalyticsSnapshots,
  upsertAnalyticsSnapshot,
} from '../controllers/analyticsSnapshots.controller.js';

const router = express.Router();

router.get('/', listAnalyticsSnapshots);
router.get('/:snapshot_id', getAnalyticsSnapshot);
router.put('/:snapshot_id', upsertAnalyticsSnapshot);
router.post('/:snapshot_id/invalidate', invalidateAnalyticsSnapshot);

export default router;
