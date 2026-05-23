import { statusService } from '../services/status.service.js';

function parseLimit(raw) {
  const n = parseInt(raw);
  if (!Number.isFinite(n) || n < 1) return 50;
  return Math.min(n, 1000);
}

function parseOffset(raw) {
  const n = parseInt(raw);
  if (!Number.isFinite(n) || n < 0) return 0;
  return n;
}

export async function getEvents(req, res, next) {
  try {
    const {
      gateway_id,
      node_id,
      severity,
      event_type,
      error_code,
      upload_id,
      from,
      to,
      start,
      end,
      limit,
      offset,
    } = req.query;

    const result = await statusService.getEvents({
      gatewayId: gateway_id,
      nodeId: node_id,
      severity,
      eventType: event_type,
      errorCode: error_code,
      uploadId: upload_id,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
      start: start ? new Date(start) : undefined,
      end: end ? new Date(end) : undefined,
      limit: parseLimit(limit),
      offset: parseOffset(offset),
    });

    res.json({
      events: result.events,
      count: result.events.length,
      total_count: result.total_count,
      limit: result.limit,
      offset: result.offset,
    });
  } catch (error) {
    next(error);
  }
}

export async function getEventsAggregate(req, res, next) {
  try {
    const { from, to, node_id, gateway_id, bucket = 'day', group_by = 'severity' } = req.query;
    const points = await statusService.getEventsAggregate({
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
      nodeId: node_id,
      gatewayId: gateway_id,
      bucket,
      groupBy: group_by,
    });
    res.json({ points });
  } catch (error) {
    next(error);
  }
}

export async function getStatus(req, res, next) {
  try {
    const status = await statusService.getSystemStatus();

    res.json(status);
  } catch (error) {
    next(error);
  }
}
