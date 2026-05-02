import { getPool } from '../db.js';

class UploadsService {
  async getUploads(filters) {
    const pool = getPool();
    let query = `
      SELECT
        upload_id,
        gateway_id,
        started_at,
        finished_at,
        received_at,
        source,
        records_count,
        events_count,
        status,
        notes,
        raw_summary
      FROM uploads
      WHERE 1=1
    `;
    const values = [];
    let paramIndex = 1;

    if (filters.gatewayId) {
      query += ` AND gateway_id = $${paramIndex}`;
      values.push(filters.gatewayId);
      paramIndex++;
    }

    if (filters.status) {
      query += ` AND status = $${paramIndex}`;
      values.push(filters.status);
      paramIndex++;
    }

    if (filters.from) {
      query += ` AND received_at >= $${paramIndex}`;
      values.push(filters.from);
      paramIndex++;
    }

    if (filters.to) {
      query += ` AND received_at <= $${paramIndex}`;
      values.push(filters.to);
      paramIndex++;
    }

    query += ` ORDER BY received_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    values.push(filters.limit, filters.offset);

    const result = await pool.query(query, values);
    return result.rows;
  }
}

export const uploadsService = new UploadsService();
