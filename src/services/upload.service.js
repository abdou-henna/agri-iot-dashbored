import { getPool } from '../db.js';
import { validationService } from './validation.service.js';

class UploadService {
  async processUpload(payload) {
    validationService.validateUploadPayload(payload);

    // Derive identifiers before acquiring a DB connection so we can fail fast.
    const uploadId = payload.upload_id ||
      `SRV-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    const gatewayEnv = payload.gateway || null;
    const gatewayIdFromReadings = payload.readings.length > 0
      ? (payload.readings[0].gateway_id || null)
      : null;
    const gatewayId = (gatewayEnv && gatewayEnv.gateway_id) || gatewayIdFromReadings;

    // Reject only when there is nothing to store — if readings or events exist, the schema's
    // NOT NULL constraint on gateway_id will enforce correctness at the DB level.
    if (!gatewayId && payload.readings.length === 0 && payload.events.length === 0) {
      const err = new Error('Missing gateway_id: cannot be determined from envelope or readings');
      err.statusCode = 400;
      throw err;
    }

    const pool = getPool();
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Skip upload metadata when gateway is unknown (uploads.gateway_id is NOT NULL)
      if (gatewayId) {
        await this.insertUpload(client, payload, uploadId, gatewayId);
      }

      // Upsert gateway and nodes only when gateway info is available
      if (gatewayId) {
        await this.upsertGateway(client, gatewayEnv || { gateway_id: gatewayId });
        await this.upsertNodes(client, gatewayId, payload.readings);
      }

      // Insert readings
      const readingsResult = await this.insertReadings(client, uploadId, gatewayId, payload.readings);

      // Insert events
      const eventsResult = await this.insertEvents(client, uploadId, gatewayId, payload.events);

      // Update gateway activity
      if (gatewayId) {
        await this.updateGatewayActivity(client, gatewayId, uploadId);
      }

      await client.query('COMMIT');

      return {
        uploadId,
        receivedRecords: payload.readings.length,
        insertedRecords: readingsResult.inserted,
        duplicateRecords: readingsResult.duplicates,
        receivedEvents: payload.events.length,
        insertedEvents: eventsResult.inserted,
        duplicateEvents: eventsResult.duplicates
      };

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async insertUpload(client, payload, uploadId, gatewayId) {
    const uploadMeta = payload.upload || {};
    const query = `
      INSERT INTO uploads (
        upload_id, gateway_id, started_at, finished_at, source, notes, raw_summary
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (upload_id) DO NOTHING
      RETURNING id
    `;

    const values = [
      uploadId,
      gatewayId,
      uploadMeta.started_at || new Date().toISOString(),
      uploadMeta.finished_at || null,
      uploadMeta.source || 'esp32',
      uploadMeta.notes || null,
      JSON.stringify({
        readings_count: payload.readings.length,
        events_count: payload.events.length
      })
    ];

    const result = await client.query(query, values);
    return result.rows[0];
  }

  async upsertGateway(client, gateway) {
    const query = `
      INSERT INTO gateways (
        gateway_id, firmware_version, last_seen_at
      ) VALUES ($1, $2, NOW())
      ON CONFLICT (gateway_id) DO UPDATE SET
        firmware_version = EXCLUDED.firmware_version,
        last_seen_at = NOW()
    `;

    await client.query(query, [gateway.gateway_id, gateway.firmware_version || null]);
  }

  async upsertNodes(client, gatewayId, readings) {
    const nodes = new Map();

    for (const reading of readings) {
      if (!nodes.has(reading.node_id)) {
        nodes.set(reading.node_id, {
          node_id: reading.node_id,
          node_type: reading.node_type
        });
      }
    }

    for (const node of nodes.values()) {
      const query = `
        INSERT INTO nodes (
          node_id, node_type, gateway_id, last_seen_at
        ) VALUES ($1, $2, $3, NOW())
        ON CONFLICT (node_id) DO UPDATE SET
          last_seen_at = NOW()
      `;

      await client.query(query, [node.node_id, node.node_type, gatewayId]);
    }
  }

  async insertReadings(client, uploadId, gatewayId, readings) {
    let inserted = 0;
    let duplicates = 0;

    for (const reading of readings) {
      try {
        const query = `
          INSERT INTO sensor_readings (
            record_id, upload_id, gateway_id, node_id, node_type, node_seq,
            frame_id, measured_at, rssi, snr,
            battery_mv, battery_percent, battery_status,
            soil_temperature_c, soil_moisture_percent, soil_ec_us_cm, soil_ph, soil_salinity,
            air_temperature_c, air_humidity_percent, air_pressure_hpa,
            status, raw_payload, error_code
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
            $11, $12, $13, $14, $15, $16, $17, $18,
            $19, $20, $21, $22, $23, $24
          )
          ON CONFLICT (record_id) DO NOTHING
        `;

        const values = [
          reading.record_id,
          uploadId,
          gatewayId,
          reading.node_id,
          reading.node_type,
          reading.node_seq,
          reading.frame_id,
          reading.measured_at,
          reading.rssi,
          reading.snr,
          reading.battery_mv,
          reading.battery_percent,
          reading.battery_status || 'not_measured',
          reading.soil_temperature_c,
          reading.soil_moisture_percent,
          reading.soil_ec_us_cm,
          reading.soil_ph,
          reading.soil_salinity,
          reading.air_temperature_c,
          reading.air_humidity_percent,
          reading.air_pressure_hpa,
          reading.status || 'ok',
          JSON.stringify(reading),
          reading.error_code || null
        ];

        const result = await client.query(query, values);
        if (result.rowCount > 0) {
          inserted++;
        } else {
          duplicates++;
        }

        if (reading.node_seq) {
          await client.query(
            'UPDATE nodes SET last_seq = $1 WHERE node_id = $2 AND ($3 > last_seq OR last_seq IS NULL)',
            [reading.node_seq, reading.node_id, reading.node_seq]
          );
        }

      } catch (error) {
        console.error('Error inserting reading:', reading.record_id, error);
        throw error;
      }
    }

    return { inserted, duplicates };
  }

  async insertEvents(client, uploadId, gatewayId, events) {
    let inserted = 0;
    let duplicates = 0;

    for (const event of events) {
      try {
        const query = `
          INSERT INTO system_events (
            event_id, upload_id, gateway_id, node_id, event_type, severity,
            event_time, message, details, error_code
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          ON CONFLICT (event_id) DO NOTHING
        `;

        // Firmware saveEvent() serializes details as a JSON string (ArduinoJson string field).
        // Pass string values directly so pg parses them as JSON; stringify objects normally.
        const rawDetails = event.details;
        const detailsValue = typeof rawDetails === 'string'
          ? rawDetails
          : JSON.stringify(rawDetails || {});

        const values = [
          event.event_id,
          uploadId,
          gatewayId,
          event.node_id,
          event.event_type,
          event.severity,
          event.event_time,
          event.message,
          detailsValue,
          event.error_code || null
        ];

        const result = await client.query(query, values);
        if (result.rowCount > 0) {
          inserted++;
        } else {
          duplicates++;
        }

      } catch (error) {
        console.error('Error inserting event:', event.event_id, error);
        throw error;
      }
    }

    return { inserted, duplicates };
  }

  async updateGatewayActivity(client, gatewayId, uploadId) {
    const query = `
      UPDATE gateways
      SET last_upload_at = NOW(), last_upload_id = $2
      WHERE gateway_id = $1
    `;

    await client.query(query, [gatewayId, uploadId]);
  }
}

export const uploadService = new UploadService();
