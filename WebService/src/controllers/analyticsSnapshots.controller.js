import { analyticsSnapshotsService } from '../services/analyticsSnapshots.service.js';

function badRequest(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

export async function listAnalyticsSnapshots(req, res, next) {
  try {
    const { domain, node_id, metric, window_start, window_end, invalidated } = req.query;
    const snapshots = await analyticsSnapshotsService.list({
      domain,
      node_id,
      metric,
      window_start,
      window_end,
      invalidated: invalidated === undefined ? undefined : invalidated === 'true',
    });
    res.json({ snapshots, count: snapshots.length });
  } catch (error) {
    next(error);
  }
}

export async function getAnalyticsSnapshot(req, res, next) {
  try {
    const snapshot = await analyticsSnapshotsService.getBySnapshotId(req.params.snapshot_id);
    if (!snapshot) {
      res.status(404).json({ error: 'Analytics snapshot not found' });
      return;
    }
    res.json(snapshot);
  } catch (error) {
    next(error);
  }
}

export async function upsertAnalyticsSnapshot(req, res, next) {
  try {
    const { snapshot_id: snapshotId } = req.params;
    const input = req.body ?? {};
    if (!input.domain || !input.window_start || !input.window_end || !input.bucket || !input.analytics_version || !input.qc_version || !input.filters_hash) {
      throw badRequest('Missing required snapshot fields');
    }

    const snapshot = await analyticsSnapshotsService.upsert(snapshotId, input);
    res.json(snapshot);
  } catch (error) {
    next(error);
  }
}

export async function invalidateAnalyticsSnapshot(req, res, next) {
  try {
    const { reason } = req.body ?? {};
    const snapshot = await analyticsSnapshotsService.invalidate(req.params.snapshot_id, reason ?? null);
    if (!snapshot) {
      res.status(404).json({ error: 'Analytics snapshot not found' });
      return;
    }
    res.json(snapshot);
  } catch (error) {
    next(error);
  }
}
