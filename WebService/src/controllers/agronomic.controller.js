import { agronomicService, CATEGORY_VALUES, CONFIDENCE_VALUES, TARGET_SCOPE_VALUES } from '../services/agronomic.service.js';

function isValidEndedAt(started_at, ended_at) {
  if (!ended_at) return true;
  return new Date(ended_at) > new Date(started_at);
}

export async function getAgronomicEvents(req, res, next) {
  try {
    const { event_category, event_type, target_scope, from, to, limit = 100, offset = 0 } = req.query;
    const events = await agronomicService.getEvents({
      event_category,
      event_type,
      target_scope,
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

export async function createAgronomicEvent(req, res, next) {
  try {
    const { event_category, event_type, target_scope, started_at, ended_at, confidence, details, notes, entered_by, gateway_id } = req.body ?? {};
    if (!event_category || !event_type || !target_scope || !started_at || !confidence) {
      res.status(400).json({ error: 'event_category, event_type, target_scope, started_at, confidence are required' });
      return;
    }
    if (!CATEGORY_VALUES.includes(event_category) || !TARGET_SCOPE_VALUES.includes(target_scope) || !CONFIDENCE_VALUES.includes(confidence)) {
      res.status(400).json({ error: 'Invalid event_category, target_scope, or confidence value' });
      return;
    }
    if (!isValidEndedAt(started_at, ended_at)) {
      res.status(400).json({ error: 'ended_at must be after started_at' });
      return;
    }

    const row = await agronomicService.createEvent({
      event_category,
      event_type,
      target_scope,
      started_at,
      ended_at,
      confidence,
      details,
      notes,
      entered_by,
      gateway_id,
    });
    res.status(201).json(row);
  } catch (error) {
    next(error);
  }
}

export async function updateAgronomicEvent(req, res, next) {
  try {
    const { agro_event_id } = req.params;
    const row = await agronomicService.updateEvent(agro_event_id, req.body ?? {});
    if (!row) {
      res.status(404).json({ error: 'Agronomic event not found' });
      return;
    }
    res.json(row);
  } catch (error) {
    if ((error?.message ?? '').includes('ended_at must be after started_at')) {
      res.status(400).json({ error: 'ended_at must be after started_at' });
      return;
    }
    next(error);
  }
}

export async function deleteAgronomicEvent(req, res, next) {
  try {
    const { agro_event_id } = req.params;
    const deleted = await agronomicService.deleteEvent(agro_event_id);
    if (!deleted) {
      res.status(404).json({ error: 'Agronomic event not found' });
      return;
    }
    res.json({ success: true, agro_event_id });
  } catch (error) {
    next(error);
  }
}

export async function startIrrigation(req, res, next) {
  try {
    const active = await agronomicService.getActiveIrrigationSession();
    if (active) {
      res.status(409).json({ error: 'Active irrigation session already exists', active_session: active });
      return;
    }

    const { target_scope = 'both_pivots', started_at = new Date().toISOString(), confidence = 'exact', notes = null, details = {} } = req.body ?? {};
    if (!TARGET_SCOPE_VALUES.includes(target_scope) || !CONFIDENCE_VALUES.includes(confidence)) {
      res.status(400).json({ error: 'Invalid target_scope or confidence value' });
      return;
    }

    const row = await agronomicService.createEvent({
      event_category: 'irrigation',
      event_type: 'irrigation_session',
      target_scope,
      started_at,
      ended_at: null,
      confidence,
      notes,
      details: { ...details, status: 'active' },
    });

    res.status(201).json(row);
  } catch (error) {
    next(error);
  }
}

export async function endIrrigation(req, res, next) {
  try {
    const { agro_event_id } = req.params;
    const result = await agronomicService.endIrrigationSession(agro_event_id, req.body ?? {});

    if (result.status === 'not_found') {
      res.status(404).json({ error: 'Irrigation session not found' });
      return;
    }
    if (result.status === 'invalid_type') {
      res.status(400).json({ error: 'Event is not an irrigation_session' });
      return;
    }
    if (result.status === 'already_ended') {
      res.status(409).json({ error: 'Irrigation session already ended', session: result.session });
      return;
    }
    if (result.status === 'invalid_time') {
      res.status(400).json({ error: 'ended_at must be after started_at' });
      return;
    }

    res.json(result.session);
  } catch (error) {
    next(error);
  }
}

export async function getAgronomicAggregate(req, res, next) {
  try {
    const { from, to, target_scope, bucket = 'day' } = req.query;
    const points = await agronomicService.getAggregate({
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
      target_scope,
      bucket: bucket === 'hour' ? 'hour' : 'day',
    });
    res.json({ points });
  } catch (error) {
    next(error);
  }
}
