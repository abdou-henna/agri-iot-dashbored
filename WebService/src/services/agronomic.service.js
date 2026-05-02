import { getPool } from '../db.js';

const CATEGORY_VALUES = ['season_setup', 'irrigation', 'cutting', 'fertilization', 'yield', 'field_note'];
const TARGET_SCOPE_VALUES = ['farm', 'pivot_1', 'pivot_2', 'both_pivots', 'unknown'];
const CONFIDENCE_VALUES = ['exact', 'estimated', 'unknown'];

function buildAgroEventId() {
  return `AGRO-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

class AgronomicService {
  async getActiveIrrigationSession() {
    const pool = getPool();
    const { rows } = await pool.query(
      `SELECT * FROM agronomic_events
       WHERE event_category='irrigation' AND event_type='irrigation_session' AND ended_at IS NULL
       ORDER BY started_at DESC
       LIMIT 1`
    );
    return rows[0] ?? null;
  }

  async createEvent(input) {
    const pool = getPool();
    const query = `
      INSERT INTO agronomic_events (
        agro_event_id, gateway_id, event_category, event_type, target_scope,
        started_at, ended_at, source, confidence, details, notes, entered_by
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,'manual',$8,$9,$10,$11)
      RETURNING *
    `;
    const values = [
      buildAgroEventId(),
      input.gateway_id ?? 'GW01',
      input.event_category,
      input.event_type,
      input.target_scope,
      input.started_at,
      input.ended_at ?? null,
      input.confidence,
      input.details ?? {},
      input.notes ?? null,
      input.entered_by ?? null,
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  async getEvents({ event_category, event_type, target_scope, from, to, limit = 100, offset = 0 }) {
    const pool = getPool();
    let query = 'SELECT * FROM agronomic_events WHERE 1=1';
    const values = [];
    let idx = 1;

    if (event_category) { query += ` AND event_category = $${idx++}`; values.push(event_category); }
    if (event_type) { query += ` AND event_type = $${idx++}`; values.push(event_type); }
    if (target_scope) { query += ` AND target_scope = $${idx++}`; values.push(target_scope); }
    if (from) { query += ` AND started_at >= $${idx++}`; values.push(from); }
    if (to) { query += ` AND started_at <= $${idx++}`; values.push(to); }

    query += ` ORDER BY started_at DESC LIMIT $${idx++} OFFSET $${idx++}`;
    values.push(limit, offset);

    const { rows } = await pool.query(query, values);
    return rows;
  }

  async getEventByAgroEventId(agro_event_id) {
    const pool = getPool();
    const { rows } = await pool.query('SELECT * FROM agronomic_events WHERE agro_event_id = $1 LIMIT 1', [agro_event_id]);
    return rows[0] ?? null;
  }

  async updateEvent(agro_event_id, input) {
    const pool = getPool();
    const current = await this.getEventByAgroEventId(agro_event_id);
    if (!current) return null;

    const nextStartedAt = input.started_at ?? current.started_at;
    const nextEndedAt = Object.prototype.hasOwnProperty.call(input, 'ended_at') ? input.ended_at : current.ended_at;
    if (nextEndedAt && new Date(nextEndedAt) <= new Date(nextStartedAt)) {
      throw new Error('ended_at must be after started_at');
    }

    const { rows } = await pool.query(
      `UPDATE agronomic_events
       SET event_type = COALESCE($2, event_type),
           target_scope = COALESCE($3, target_scope),
           started_at = COALESCE($4, started_at),
           ended_at = $5,
           confidence = COALESCE($6, confidence),
           details = COALESCE($7, details),
           notes = $8,
           entered_by = COALESCE($9, entered_by),
           updated_at = NOW()
       WHERE agro_event_id = $1
       RETURNING *`,
      [
        agro_event_id,
        input.event_type ?? null,
        input.target_scope ?? null,
        input.started_at ?? null,
        nextEndedAt,
        input.confidence ?? null,
        input.details ?? null,
        Object.prototype.hasOwnProperty.call(input, 'notes') ? input.notes : current.notes,
        input.entered_by ?? null,
      ]
    );

    return rows[0] ?? null;
  }

  async deleteEvent(agro_event_id) {
    const pool = getPool();
    const result = await pool.query('DELETE FROM agronomic_events WHERE agro_event_id = $1', [agro_event_id]);
    return result.rowCount > 0;
  }

  async endIrrigationSession(agro_event_id, { ended_at, confidence, notes, details }) {
    const current = await this.getEventByAgroEventId(agro_event_id);
    if (!current) return { status: 'not_found' };
    if (current.event_category !== 'irrigation' || current.event_type !== 'irrigation_session') return { status: 'invalid_type' };
    if (current.ended_at) return { status: 'already_ended', session: current };

    const endAt = ended_at ?? new Date().toISOString();
    if (new Date(endAt) <= new Date(current.started_at)) return { status: 'invalid_time' };

    const durationMin = Math.max(0, Math.round((new Date(endAt).getTime() - new Date(current.started_at).getTime()) / 60000));
    const mergedDetails = {
      ...(current.details ?? {}),
      ...(details ?? {}),
      status: 'completed',
      duration_min: durationMin,
    };

    const session = await this.updateEvent(agro_event_id, {
      ended_at: endAt,
      confidence: confidence ?? current.confidence,
      notes: notes ?? current.notes,
      details: mergedDetails,
    });

    return { status: 'ok', session };
  }

  async getAggregate({ from, to, target_scope, bucket = 'day' }) {
    const pool = getPool();
    const bucketExpr = bucket === 'hour' ? "date_trunc('hour', started_at)" : "date_trunc('day', started_at)";

    let query = `
      SELECT
        ${bucketExpr} AS bucket_start,
        SUM(EXTRACT(EPOCH FROM (ended_at - started_at)) / 60.0)::float AS irrigation_minutes_total,
        COUNT(*)::int AS sessions_count
      FROM agronomic_events
      WHERE event_category='irrigation'
        AND event_type='irrigation_session'
        AND ended_at IS NOT NULL
    `;

    const values = [];
    let idx = 1;
    if (target_scope) { query += ` AND target_scope = $${idx++}`; values.push(target_scope); }
    if (from) { query += ` AND started_at >= $${idx++}`; values.push(from); }
    if (to) { query += ` AND started_at <= $${idx++}`; values.push(to); }

    query += ' GROUP BY bucket_start ORDER BY bucket_start ASC';
    const { rows } = await pool.query(query, values);
    return rows;
  }
}

export { CATEGORY_VALUES, TARGET_SCOPE_VALUES, CONFIDENCE_VALUES };
export const agronomicService = new AgronomicService();
