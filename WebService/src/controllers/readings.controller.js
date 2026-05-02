import { readingsService } from '../services/readings.service.js';

const allowedMetrics = new Set([
  'soil_temperature_c',
  'soil_moisture_percent',
  'soil_ec_us_cm',
  'air_temperature_c',
  'air_humidity_percent',
  'air_pressure_hpa',
  'rssi',
  'snr'
]);

const allowedBuckets = new Set(['10min', '1hour', '1day']);
const allowedNodes = new Set(['MAIN', 'N2', 'N3']);
const MAX_RANGE_DAYS = 31;

function badRequest(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

function parseRequiredDate(value, name) {
  if (!value) {
    throw badRequest(`${name} is required`);
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw badRequest(`${name} must be a valid ISO timestamp`);
  }

  return date;
}

export async function getReadings(req, res, next) {
  try {
    const {
      gateway_id,
      node_id,
      node_type,
      status,
      upload_id,
      from,
      to,
      limit = 100
    } = req.query;

    const readings = await readingsService.getReadings({
      gatewayId: gateway_id,
      nodeId: node_id,
      nodeType: node_type,
      status,
      uploadId: upload_id,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
      limit: Math.min(parseInt(limit) || 100, 1000)
    });

    res.json({
      readings,
      count: readings.length
    });
  } catch (error) {
    next(error);
  }
}

export async function getReadingAggregate(req, res, next) {
  try {
    const { node_id, metric, from, to, bucket } = req.query;

    if (!allowedNodes.has(node_id)) {
      throw badRequest('node_id must be one of MAIN, N2, N3');
    }

    if (!allowedMetrics.has(metric)) {
      throw badRequest('metric is not allowed');
    }

    if (!allowedBuckets.has(bucket)) {
      throw badRequest('bucket must be one of 10min, 1hour, 1day');
    }

    const fromDate = parseRequiredDate(from, 'from');
    const toDate = parseRequiredDate(to, 'to');

    if (fromDate >= toDate) {
      throw badRequest('from must be before to');
    }

    const rangeDays = (toDate.getTime() - fromDate.getTime()) / 86400000;
    if (rangeDays > MAX_RANGE_DAYS) {
      throw badRequest(`date range must not exceed ${MAX_RANGE_DAYS} days`);
    }

    const points = await readingsService.getReadingAggregate({
      nodeId: node_id,
      metric,
      from: fromDate,
      to: toDate,
      bucket
    });

    res.json({
      node_id,
      metric,
      bucket,
      from: fromDate.toISOString(),
      to: toDate.toISOString(),
      points
    });
  } catch (error) {
    next(error);
  }
}

export async function getReadingByRecordId(req, res, next) {
  try {
    const { record_id } = req.params;
    const reading = await readingsService.getReadingByRecordId(record_id);
    if (!reading) {
      res.status(404).json({ error: 'Reading not found' });
      return;
    }
    res.json(reading);
  } catch (error) {
    next(error);
  }
}
