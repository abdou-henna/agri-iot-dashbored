import { getPool } from '../db.js';

function badRequest(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

function validateJsonObject(value, fieldName) {
  if (value == null || Array.isArray(value) || typeof value !== 'object') {
    throw badRequest(`${fieldName} must be a JSON object`);
  }
}

class AnalyticsSnapshotsService {
  async getBySnapshotId(snapshotId) {
    const pool = getPool();
    const { rows } = await pool.query('SELECT * FROM analytics_snapshots WHERE snapshot_id = $1 LIMIT 1', [snapshotId]);
    return rows[0] ?? null;
  }

  async upsert(snapshotId, input) {
    validateJsonObject(input.payload_json ?? {}, 'payload_json');
    validateJsonObject(input.cursor_json ?? {}, 'cursor_json');
    validateJsonObject(input.quality_json ?? {}, 'quality_json');

    const pool = getPool();
    const query = `
      INSERT INTO analytics_snapshots (
        snapshot_id, domain, node_id, metric, window_start, window_end, bucket,
        analytics_version, qc_version, calibration_version, filters_hash,
        cursor_json, payload_json, quality_json, invalidated, invalidation_reason
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,COALESCE($15, FALSE),$16
      )
      ON CONFLICT (snapshot_id)
      DO UPDATE SET
        domain = EXCLUDED.domain,
        node_id = EXCLUDED.node_id,
        metric = EXCLUDED.metric,
        window_start = EXCLUDED.window_start,
        window_end = EXCLUDED.window_end,
        bucket = EXCLUDED.bucket,
        analytics_version = EXCLUDED.analytics_version,
        qc_version = EXCLUDED.qc_version,
        calibration_version = EXCLUDED.calibration_version,
        filters_hash = EXCLUDED.filters_hash,
        cursor_json = EXCLUDED.cursor_json,
        payload_json = EXCLUDED.payload_json,
        quality_json = EXCLUDED.quality_json,
        invalidated = EXCLUDED.invalidated,
        invalidation_reason = EXCLUDED.invalidation_reason,
        updated_at = NOW()
      RETURNING *
    `;

    const values = [
      snapshotId,
      input.domain,
      input.node_id ?? null,
      input.metric ?? null,
      input.window_start,
      input.window_end,
      input.bucket,
      input.analytics_version,
      input.qc_version,
      input.calibration_version ?? null,
      input.filters_hash,
      input.cursor_json ?? {},
      input.payload_json ?? {},
      input.quality_json ?? {},
      input.invalidated ?? false,
      input.invalidation_reason ?? null,
    ];

    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  async list(filters = {}) {
    const pool = getPool();
    let query = 'SELECT * FROM analytics_snapshots WHERE 1=1';
    const values = [];
    let idx = 1;

    if (filters.domain) { query += ` AND domain = $${idx++}`; values.push(filters.domain); }
    if (filters.node_id) { query += ` AND node_id = $${idx++}`; values.push(filters.node_id); }
    if (filters.metric) { query += ` AND metric = $${idx++}`; values.push(filters.metric); }
    if (filters.window_start) { query += ` AND window_start >= $${idx++}`; values.push(filters.window_start); }
    if (filters.window_end) { query += ` AND window_end <= $${idx++}`; values.push(filters.window_end); }
    if (typeof filters.invalidated === 'boolean') { query += ` AND invalidated = $${idx++}`; values.push(filters.invalidated); }

    query += ` ORDER BY window_start DESC, created_at DESC LIMIT $${idx++} OFFSET $${idx++}`;
    values.push(filters.limit ?? 50, filters.offset ?? 0);
    const { rows } = await pool.query(query, values);
    return rows;
  }

  async getLatest(filters) {
    const pool = getPool();
    const query = `
      SELECT *
      FROM analytics_snapshots
      WHERE domain = $1
        AND bucket = $2
        AND analytics_version = $3
        AND qc_version = $4
        AND filters_hash = $5
        AND invalidated = FALSE
        AND ($6::text IS NULL OR node_id = $6)
        AND ($7::text IS NULL OR metric = $7)
        AND ($8::text IS NULL OR calibration_version = $8)
      ORDER BY window_end DESC, updated_at DESC
      LIMIT 1
    `;
    const values = [
      filters.domain,
      filters.bucket,
      filters.analytics_version,
      filters.qc_version,
      filters.filters_hash,
      filters.node_id ?? null,
      filters.metric ?? null,
      filters.calibration_version ?? null,
    ];
    const { rows } = await pool.query(query, values);
    return rows[0] ?? null;
  }

  async invalidate(snapshotId, reason) {
    const pool = getPool();
    const { rows } = await pool.query(
      `UPDATE analytics_snapshots
       SET invalidated = TRUE,
           invalidation_reason = $2,
           updated_at = NOW()
       WHERE snapshot_id = $1
       RETURNING *`,
      [snapshotId, reason ?? null]
    );
    return rows[0] ?? null;
  }
}

export const analyticsSnapshotsService = new AnalyticsSnapshotsService();
