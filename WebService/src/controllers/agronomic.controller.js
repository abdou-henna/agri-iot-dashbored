import { agronomicService } from '../services/agronomic.service.js';

const allowedTypes = new Set(['irrigation_start', 'irrigation_stop', 'fertilization', 'manual_note']);

export async function createAgronomicEvent(req, res, next) {
  try {
    const { node_id, type, value, unit, metadata, created_by } = req.body ?? {};
    if (!type || !allowedTypes.has(type)) {
      res.status(400).json({ error: 'type is required and must be a supported agronomic type' });
      return;
    }
    const row = await agronomicService.createEvent({
      nodeId: node_id,
      type,
      value,
      unit,
      metadata,
      createdBy: created_by,
    });
    res.status(201).json(row);
  } catch (error) {
    next(error);
  }
}

export async function getAgronomicEvents(req, res, next) {
  try {
    const { node_id, type, from, to, limit = 100, offset = 0 } = req.query;
    const events = await agronomicService.getEvents({
      nodeId: node_id,
      type,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
      limit: Math.min(parseInt(limit, 10) || 100, 1000),
      offset: parseInt(offset, 10) || 0,
    });
    res.json({ events, count: events.length });
  } catch (error) {
    next(error);
  }
}

export async function getAgronomicAggregate(req, res, next) {
  try {
    const { node_id, from, to, bucket = 'day' } = req.query;
    const points = await agronomicService.getAggregate({
      nodeId: node_id,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
      bucket: bucket === 'hour' ? 'hour' : 'day',
    });
    res.json({ points });
  } catch (error) {
    next(error);
  }
}

