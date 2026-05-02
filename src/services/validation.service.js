import { CONFIG } from '../config.js';

class ValidationService {
  _err(msg) {
    const e = new Error(msg);
    e.statusCode = 400;
    return e;
  }

  validateUploadPayload(payload) {
    if (!payload || typeof payload !== 'object') {
      throw this._err('Invalid payload: must be an object');
    }

    // Only readings and events are required; envelope fields are optional
    this.validateRequired(payload, ['readings', 'events']);

    // Validate optional envelope fields only when present
    if (payload.upload_id !== undefined && typeof payload.upload_id !== 'string') {
      throw this._err('Invalid upload_id: must be a string');
    }

    if (payload.gateway !== undefined) {
      this.validateGateway(payload.gateway);
    }

    if (payload.upload !== undefined) {
      this.validateUploadMetadata(payload.upload);
    }

    // Validate readings array
    if (!Array.isArray(payload.readings)) {
      throw this._err('Invalid readings: must be an array');
    }
    if (payload.readings.length > CONFIG.MAX_READINGS_PER_UPLOAD) {
      throw this._err(`Too many readings: maximum ${CONFIG.MAX_READINGS_PER_UPLOAD} allowed`);
    }

    // Validate events array
    if (!Array.isArray(payload.events)) {
      throw this._err('Invalid events: must be an array');
    }
    if (payload.events.length > CONFIG.MAX_EVENTS_PER_UPLOAD) {
      throw this._err(`Too many events: maximum ${CONFIG.MAX_EVENTS_PER_UPLOAD} allowed`);
    }

    // Validate each reading
    for (const reading of payload.readings) {
      this.validateReading(reading);
    }

    // Validate each event
    for (const event of payload.events) {
      this.validateEvent(event);
    }

    // NPK fields are not permitted in readings
    this.checkForNPKFields(payload.readings);
  }

  validateGateway(gateway) {
    if (!gateway || typeof gateway !== 'object') {
      throw this._err('Invalid gateway: must be an object');
    }

    if (!gateway.gateway_id || typeof gateway.gateway_id !== 'string') {
      throw this._err('Invalid gateway.gateway_id: must be a non-empty string');
    }
  }

  validateUploadMetadata(upload) {
    if (!upload || typeof upload !== 'object') {
      throw this._err('Invalid upload: must be an object');
    }

    if (upload.started_at !== undefined) {
      this.validateTimestamp(upload.started_at);
    }

    if (upload.finished_at) {
      this.validateTimestamp(upload.finished_at);
    }
  }

  validateReading(reading) {
    this.validateRequired(reading, ['record_id', 'node_id', 'node_type', 'measured_at']);

    if (typeof reading.record_id !== 'string') {
      throw this._err('Invalid reading.record_id: must be a string');
    }

    if (typeof reading.node_id !== 'string') {
      throw this._err('Invalid reading.node_id: must be a string');
    }

    if (!CONFIG.NODE_TYPES.includes(reading.node_type)) {
      throw this._err(`Invalid reading.node_type: must be one of ${CONFIG.NODE_TYPES.join(', ')}`);
    }

    this.validateTimestamp(reading.measured_at);

    // Validate battery status
    if (reading.battery_status && !CONFIG.BATTERY_STATUSES.includes(reading.battery_status)) {
      throw this._err(`Invalid reading.battery_status: must be one of ${CONFIG.BATTERY_STATUSES.join(', ')}`);
    }

    // Validate node-specific fields
    if (reading.node_type === 'soil') {
      if (reading.air_temperature_c !== undefined || reading.air_humidity_percent !== undefined || reading.air_pressure_hpa !== undefined) {
        throw this._err('Soil reading cannot contain weather fields');
      }
    } else if (reading.node_type === 'weather') {
      const soilFields = ['soil_temperature_c', 'soil_moisture_percent', 'soil_ec_us_cm', 'soil_ph', 'soil_salinity'];
      for (const field of soilFields) {
        if (reading[field] !== undefined) {
          throw this._err(`Weather reading cannot contain soil field: ${field}`);
        }
      }
    }
  }

  validateEvent(event) {
    this.validateRequired(event, ['event_id', 'event_type', 'severity', 'event_time']);

    if (typeof event.event_id !== 'string') {
      throw this._err('Invalid event.event_id: must be a string');
    }

    if (typeof event.event_type !== 'string') {
      throw this._err('Invalid event.event_type: must be a string');
    }

    if (!CONFIG.EVENT_SEVERITIES.includes(event.severity)) {
      throw this._err(`Invalid event.severity: must be one of ${CONFIG.EVENT_SEVERITIES.join(', ')}`);
    }

    this.validateTimestamp(event.event_time);
  }

  validateTimestamp(timestamp) {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      throw this._err(`Invalid timestamp: ${timestamp}`);
    }

    const diffMinutes = Math.abs(Date.now() - date.getTime()) / 60000;
    if (diffMinutes > CONFIG.MAX_CLOCK_DRIFT_MINUTES) {
      console.warn(`[upload] clock drift: ${timestamp} is ${Math.round(diffMinutes)} min from server time`);
    }
  }

  checkForNPKFields(readings) {
    const npkFields = ['nitrogen', 'phosphorus', 'potassium', 'n', 'p', 'k', 'npk'];
    for (const reading of readings) {
      for (const key of Object.keys(reading)) {
        if (npkFields.includes(key.toLowerCase())) {
          throw this._err(`NPK field not allowed in reading: ${key}`);
        }
      }
    }
  }

  validateRequired(obj, requiredFields) {
    for (const field of requiredFields) {
      if (!(field in obj)) {
        throw this._err(`Missing required field: ${field}`);
      }
    }
  }
}

export const validationService = new ValidationService();
