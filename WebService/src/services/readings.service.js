import { getPool } from '../db.js';

class ReadingsService {
  async getReadings(filters) {
    const pool = getPool();
    let query = `
      SELECT
        record_id,
        upload_id,
        gateway_id,
        node_id,
        node_type,
        node_seq,
        frame_id,
        measured_at,
        received_at,
        rssi,
        snr,
        battery_mv,
        battery_percent,
        battery_status,
        soil_temperature_c,
        soil_moisture_percent,
        soil_ec_us_cm,
        soil_ph,
        soil_salinity,
        air_temperature_c,
        air_humidity_percent,
        air_pressure_hpa,
        status,
        error_code,
        created_at
      FROM sensor_readings
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

    if (filters.nodeType) {
      query += ` AND node_type = $${paramIndex}`;
      values.push(filters.nodeType);
      paramIndex++;
    }

    if (filters.status) {
      query += ` AND status = $${paramIndex}`;
      values.push(filters.status);
      paramIndex++;
    }

    if (filters.uploadId) {
      query += ` AND upload_id = $${paramIndex}`;
      values.push(filters.uploadId);
      paramIndex++;
    }

    if (filters.from) {
      query += ` AND measured_at >= $${paramIndex}`;
      values.push(filters.from);
      paramIndex++;
    }

    if (filters.to) {
      query += ` AND measured_at <= $${paramIndex}`;
      values.push(filters.to);
      paramIndex++;
    }

    query += ` ORDER BY measured_at DESC LIMIT $${paramIndex}`;
    values.push(filters.limit);

    const result = await pool.query(query, values);
    return result.rows;
  }

  async getReadingAggregate({ nodeId, metric, from, to, bucket }) {
    const pool = getPool();
    const bucketExpression = {
      '10min': "to_timestamp(floor(extract(epoch from measured_at) / 600) * 600)",
      '1hour': "date_trunc('hour', measured_at)",
      '1day': "date_trunc('day', measured_at)"
    }[bucket];

    const query = `
      SELECT
        ${bucketExpression} AS bucket_start,
        AVG(${metric})::float AS avg,
        MIN(${metric})::float AS min,
        MAX(${metric})::float AS max,
        COUNT(*)::int AS count,
        COUNT(*) FILTER (WHERE status = 'missing')::int AS missing_count
      FROM sensor_readings
      WHERE node_id = $1
        AND measured_at >= $2
        AND measured_at <= $3
      GROUP BY bucket_start
      ORDER BY bucket_start ASC
    `;

    const result = await pool.query(query, [nodeId, from, to]);
    return result.rows;
  }
}

export const readingsService = new ReadingsService();
