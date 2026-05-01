import { statusService } from '../services/status.service.js';

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
      limit = 100,
      offset = 0
    } = req.query;

    const events = await statusService.getEvents({
      gatewayId: gateway_id,
      nodeId: node_id,
      severity,
      eventType: event_type,
      errorCode: error_code,
      uploadId: upload_id,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
      limit: Math.min(parseInt(limit) || 100, 1000),
      offset: parseInt(offset) || 0
    });

    res.json({
      events,
      count: events.length
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
