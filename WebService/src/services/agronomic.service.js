import { getPool } from '../db.js';

class AgronomicService {
  async createEvent({ nodeId, type, value, unit, metadata, createdBy }) {
    const pool = getPool();
    const query = `
      INSERT INTO agronomic_events (node_id, type, value, unit, metadata, created_by)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const result = await pool.query(query, [nodeId ?? null, type, value ?? null, unit ?? null, metadata ?? null, createdBy ?? null]);
    return result.rows[0];
  }

  async getEvents({ nodeId, type, from, to, limit = 100, offset = 0 }) {
    const pool = getPool();
    let query = `
      SELECT *
      FROM agronomic_events
      WHERE 1=1
    `;
    const values = [];
    let idx = 1;
    if (nodeId) {
      query += ` AND node_id = $${idx++}`;
      values.push(nodeId);
    }
    if (type) {
      query += ` AND type = $${idx++}`;
      values.push(type);
    }
    if (from) {
      query += ` AND created_at >= $${idx++}`;
      values.push(from);
    }
    if (to) {
      query += ` AND created_at <= $${idx++}`;
      values.push(to);
    }
    query += ` ORDER BY created_at DESC LIMIT $${idx++} OFFSET $${idx++}`;
    values.push(limit, offset);
    const result = await pool.query(query, values);
    return result.rows;
  }

  async getAggregate({ nodeId, from, to, bucket = 'day' }) {
    const pool = getPool();
    const bucketExpr = bucket === 'hour' ? "date_trunc('hour', created_at)" : "date_trunc('day', created_at)";
    let query = `
      WITH base AS (
        SELECT
          id,
          node_id,
          type,
          value,
          created_at,
          LEAD(type) OVER (PARTITION BY node_id ORDER BY created_at) AS next_type,
          LEAD(created_at) OVER (PARTITION BY node_id ORDER BY created_at) AS next_created_at
        FROM agronomic_events
        WHERE 1=1
    `;
    const values = [];
    let idx = 1;
    if (nodeId) {
      query += ` AND node_id = $${idx++}`;
      values.push(nodeId);
    }
    if (from) {
      query += ` AND created_at >= $${idx++}`;
      values.push(from);
    }
    if (to) {
      query += ` AND created_at <= $${idx++}`;
      values.push(to);
    }
    query += `
      )
      SELECT
        ${bucketExpr} AS bucket_start,
        SUM(
          CASE
            WHEN type = 'irrigation_start' AND next_type = 'irrigation_stop' THEN GREATEST(EXTRACT(EPOCH FROM (next_created_at - created_at)) / 60.0, 0)
            WHEN type = 'irrigation_stop' AND value IS NOT NULL THEN value
            ELSE 0
          END
        )::float AS irrigation_minutes_total
      FROM base
      GROUP BY bucket_start
      ORDER BY bucket_start ASC
    `;
    const result = await pool.query(query, values);
    return result.rows;
  }
}

export const agronomicService = new AgronomicService();

