import { getPool } from '../db.js';

class StatusService {
  async getEvents(filters) {
    const pool = getPool();
    let query = `
      SELECT
        event_id,
        upload_id,
        gateway_id,
        node_id,
        event_type,
        severity,
        event_time,
        received_at,
        message,
        details,
        error_code
      FROM system_events
      WHERE 1=1
    `;
    const values = [];
    let paramIndex = 1;

    if (filters.gatewayId) {
      query += ` AND gateway_id = $${paramIndex}`;
      values.push(filters.gatewayId);
      paramIndex++;
    }

    if (filters.nodeId) {
      query += ` AND node_id = $${paramIndex}`;
      values.push(filters.nodeId);
      paramIndex++;
    }

    if (filters.severity) {
      query += ` AND severity = $${paramIndex}`;
      values.push(filters.severity);
      paramIndex++;
    }

    if (filters.eventType) {
      query += ` AND event_type = $${paramIndex}`;
      values.push(filters.eventType);
      paramIndex++;
    }

    if (filters.errorCode) {
      query += ` AND error_code = $${paramIndex}`;
      values.push(filters.errorCode);
      paramIndex++;
    }

    if (filters.uploadId) {
      query += ` AND upload_id = $${paramIndex}`;
      values.push(filters.uploadId);
      paramIndex++;
    }

    if (filters.from) {
      query += ` AND event_time >= $${paramIndex}`;
      values.push(filters.from);
      paramIndex++;
    }

    if (filters.to) {
      query += ` AND event_time <= $${paramIndex}`;
      values.push(filters.to);
      paramIndex++;
    }

    query += ` ORDER BY event_time DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    values.push(filters.limit, filters.offset);

    const result = await pool.query(query, values);
    return result.rows;
  }

  async getSystemStatus() {
    const pool = getPool();

    // Get gateway summary
    const gatewaysQuery = `
      SELECT
        gateway_id,
        name,
        last_seen_at,
        last_upload_at,
        last_upload_id,
        firmware_version
      FROM gateways
      ORDER BY last_seen_at DESC
    `;
    const gatewaysResult = await pool.query(gatewaysQuery);

    // Get recent warnings/errors
    const recentEventsQuery = `
      SELECT
        event_id,
        gateway_id,
        node_id,
        event_type,
        severity,
        event_time,
        message
      FROM system_events
      WHERE severity IN ('warning', 'error', 'critical')
      AND event_time > NOW() - INTERVAL '24 hours'
      ORDER BY event_time DESC
      LIMIT 10
    `;
    const eventsResult = await pool.query(recentEventsQuery);

    // Get latest reading per node
    const latestReadingsQuery = `
      SELECT DISTINCT ON (node_id)
        node_id,
        node_type,
        measured_at,
        status,
        battery_status
      FROM sensor_readings
      ORDER BY node_id, measured_at DESC
    `;
    const readingsResult = await pool.query(latestReadingsQuery);

    return {
      gateways: gatewaysResult.rows,
      latest_readings: readingsResult.rows,
      recent_warnings_errors: eventsResult.rows,
      server_time: new Date().toISOString()
    };
  }

  async getEventsAggregate({ from, to, nodeId, gatewayId, bucket = 'day', groupBy = 'severity' }) {
    const pool = getPool();
    const bucketExpr = bucket === 'hour' ? "date_trunc('hour', event_time)" : "date_trunc('day', event_time)";
    const groupField = groupBy === 'event_type' ? 'event_type' : 'severity';
    let query = `
      SELECT
        ${bucketExpr} AS bucket_start,
        ${groupField} AS group_key,
        COUNT(*)::int AS count
      FROM system_events
      WHERE 1=1
    `;
    const values = [];
    let idx = 1;

    if (gatewayId) {
      query += ` AND gateway_id = $${idx++}`;
      values.push(gatewayId);
    }
    if (nodeId) {
      query += ` AND node_id = $${idx++}`;
      values.push(nodeId);
    }
    if (from) {
      query += ` AND event_time >= $${idx++}`;
      values.push(from);
    }
    if (to) {
      query += ` AND event_time <= $${idx++}`;
      values.push(to);
    }

    query += ` GROUP BY bucket_start, group_key ORDER BY bucket_start ASC, group_key ASC`;
    const result = await pool.query(query, values);
    return result.rows;
  }
}

export const statusService = new StatusService();
