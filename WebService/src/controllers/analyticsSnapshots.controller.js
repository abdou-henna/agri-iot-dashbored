import { analyticsSnapshotsService } from '../services/analyticsSnapshots.service.js';

const ALLOWED_DOMAINS = new Set(['sensor_readings', 'system_events', 'agronomic_events', 'uploads']);
const ALLOWED_BUCKETS = new Set(['10min', 'hour', 'day', 'event_window', 'none']);
const ALLOWED_INVALIDATION_REASONS = new Set([
  'analytics_version_changed',
  'qc_version_changed',
  'metric_definition_changed',
  'timestamp_semantics_changed',
  'query_filters_changed',
  'calibration_metadata_changed',
  'manual_event_changed',
  'source_window_changed',
]);

function badRequest(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

function parseDateInput(value, fieldName) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw badRequest(`${fieldName} must be a valid date string`);
  }
  return date;
}

function parseOptionalInteger(value, defaultValue, min, max, fieldName) {
  if (value == null || value === '') return defaultValue;
  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
    throw badRequest(`${fieldName} must be an integer between ${min} and ${max}`);
  }
  return parsed;
}

function validateIdentityInput(input) {
  const required = ['domain', 'window_start', 'window_end', 'bucket', 'analytics_version', 'qc_version', 'filters_hash'];
  for (const field of required) {
    if (!Object.prototype.hasOwnProperty.call(input, field)) {
      throw badRequest(`Missing required snapshot field: ${field}`);
    }
  }

  if (!ALLOWED_DOMAINS.has(input.domain)) throw badRequest('domain is not allowed');
  if (!ALLOWED_BUCKETS.has(input.bucket)) throw badRequest('bucket is not allowed');

  if (typeof input.analytics_version !== 'string' || input.analytics_version.trim() === '') {
    throw badRequest('analytics_version must be a non-empty string');
  }
  if (typeof input.qc_version !== 'string' || input.qc_version.trim() === '') {
    throw badRequest('qc_version must be a non-empty string');
  }
  if (typeof input.filters_hash !== 'string' || input.filters_hash.trim() === '') {
    throw badRequest('filters_hash must be a non-empty string');
  }

  const windowStart = parseDateInput(input.window_start, 'window_start');
  const windowEnd = parseDateInput(input.window_end, 'window_end');
  if (windowEnd <= windowStart) {
    throw badRequest('window_end must be greater than window_start');
  }

  if (input.invalidation_reason != null && !ALLOWED_INVALIDATION_REASONS.has(input.invalidation_reason)) {
    throw badRequest('invalidation_reason is not allowed');
  }
}

export async function listAnalyticsSnapshots(req, res, next) {
  try {
    const { domain, node_id, metric, window_start, window_end, invalidated } = req.query;
    const limit = parseOptionalInteger(req.query.limit, 50, 1, 200, 'limit');
    const offset = parseOptionalInteger(req.query.offset, 0, 0, 1000000, 'offset');

    if (domain && !ALLOWED_DOMAINS.has(domain)) throw badRequest('domain is not allowed');
    if (window_start) parseDateInput(window_start, 'window_start');
    if (window_end) parseDateInput(window_end, 'window_end');

    let invalidatedFilter;
    if (invalidated !== undefined) {
      if (invalidated !== 'true' && invalidated !== 'false') {
        throw badRequest('invalidated must be true or false');
      }
      invalidatedFilter = invalidated === 'true';
    }

    const snapshots = await analyticsSnapshotsService.list({
      domain,
      node_id,
      metric,
      window_start,
      window_end,
      invalidated: invalidatedFilter,
      limit,
      offset,
    });

    res.json({ snapshots, count: snapshots.length, limit, offset });
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
    validateIdentityInput(input);

    const snapshot = await analyticsSnapshotsService.upsert(snapshotId, input);
    res.json(snapshot);
  } catch (error) {
    next(error);
  }
}

export async function invalidateAnalyticsSnapshot(req, res, next) {
  try {
    const { reason } = req.body ?? {};
    if (reason != null && !ALLOWED_INVALIDATION_REASONS.has(reason)) {
      throw badRequest('invalidation_reason is not allowed');
    }
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
