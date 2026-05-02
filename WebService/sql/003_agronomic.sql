CREATE TABLE IF NOT EXISTS agronomic_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);

ALTER TABLE agronomic_events ADD COLUMN IF NOT EXISTS agro_event_id TEXT;
ALTER TABLE agronomic_events ADD COLUMN IF NOT EXISTS gateway_id TEXT NOT NULL DEFAULT 'GW01';
ALTER TABLE agronomic_events ADD COLUMN IF NOT EXISTS event_category TEXT;
ALTER TABLE agronomic_events ADD COLUMN IF NOT EXISTS event_type TEXT;
ALTER TABLE agronomic_events ADD COLUMN IF NOT EXISTS target_scope TEXT;
ALTER TABLE agronomic_events ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ;
ALTER TABLE agronomic_events ADD COLUMN IF NOT EXISTS ended_at TIMESTAMPTZ NULL;
ALTER TABLE agronomic_events ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'manual';
ALTER TABLE agronomic_events ADD COLUMN IF NOT EXISTS confidence TEXT;
ALTER TABLE agronomic_events ADD COLUMN IF NOT EXISTS details JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE agronomic_events ADD COLUMN IF NOT EXISTS notes TEXT NULL;
ALTER TABLE agronomic_events ADD COLUMN IF NOT EXISTS entered_by TEXT NULL;
ALTER TABLE agronomic_events ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE agronomic_events ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NULL;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='agronomic_events' AND column_name='type'
  ) THEN
    -- Base canonical defaults for all legacy rows.
    UPDATE agronomic_events
    SET
      event_category = COALESCE(event_category, CASE WHEN type = 'manual_note' THEN 'field_note' ELSE 'field_note' END),
      event_type = COALESCE(event_type, CASE WHEN type = 'manual_note' THEN 'manual_note' ELSE 'manual_note' END),
      target_scope = COALESCE(target_scope, 'unknown'),
      started_at = COALESCE(started_at, created_at),
      confidence = COALESCE(confidence, 'unknown'),
      source = COALESCE(source, 'manual'),
      details = COALESCE(details, '{}'::jsonb),
      agro_event_id = COALESCE(agro_event_id, 'AGRO-' || to_char(created_at, 'YYYYMMDD-HH24MISS') || '-' || substr(md5(id::text), 1, 6));

    -- Legacy irrigation_stop rows with duration in minutes become completed sessions.
    UPDATE agronomic_events
    SET
      event_category = 'irrigation',
      event_type = 'irrigation_session',
      started_at = COALESCE(started_at, created_at),
      ended_at = COALESCE(
        ended_at,
        COALESCE(started_at, created_at) + ((COALESCE(value, 0)::text || ' minutes')::interval)
      ),
      details = COALESCE(details, '{}'::jsonb)
        || jsonb_build_object(
          'status', 'completed',
          'duration_min', GREATEST(COALESCE(value, 0), 0),
          'legacy_source', 'irrigation_stop'
        )
    WHERE type = 'irrigation_stop';

    -- Legacy irrigation_start rows are not canonical sessions; map as non-irrigation note.
    UPDATE agronomic_events
    SET
      event_category = 'field_note',
      event_type = 'manual_note',
      ended_at = COALESCE(ended_at, started_at + INTERVAL '1 second'),
      details = COALESCE(details, '{}'::jsonb)
        || jsonb_build_object(
          'status', 'legacy_unpaired',
          'legacy_source', 'irrigation_start'
        )
    WHERE type = 'irrigation_start';

    -- One-time cleanup for already-migrated legacy rows that incorrectly remained active.
    UPDATE agronomic_events
    SET
      ended_at = COALESCE(
        ended_at,
        CASE
          WHEN type = 'irrigation_stop' AND COALESCE(value, 0) > 0 THEN COALESCE(started_at, created_at) + ((value::text || ' minutes')::interval)
          ELSE COALESCE(started_at, created_at) + INTERVAL '1 second'
        END
      ),
      details = COALESCE(details, '{}'::jsonb)
        || jsonb_build_object(
          'status', CASE WHEN type = 'irrigation_stop' THEN 'completed' ELSE 'legacy_unpaired' END,
          'duration_min', CASE WHEN type = 'irrigation_stop' THEN GREATEST(COALESCE(value, 0), 0) ELSE 0 END,
          'legacy_cleanup', true
        )
    WHERE type IN ('irrigation_start', 'irrigation_stop')
      AND event_category = 'irrigation'
      AND event_type = 'irrigation_session'
      AND ended_at IS NULL;
  ELSE
    UPDATE agronomic_events
    SET
      event_category = COALESCE(event_category, 'field_note'),
      event_type = COALESCE(event_type, 'manual_note'),
      target_scope = COALESCE(target_scope, 'unknown'),
      started_at = COALESCE(started_at, created_at),
      confidence = COALESCE(confidence, 'unknown'),
      source = COALESCE(source, 'manual'),
      details = COALESCE(details, '{}'::jsonb),
      agro_event_id = COALESCE(agro_event_id, 'AGRO-' || to_char(created_at, 'YYYYMMDD-HH24MISS') || '-' || substr(md5(id::text), 1, 6));
  END IF;
END $$;

ALTER TABLE agronomic_events ALTER COLUMN agro_event_id SET NOT NULL;
ALTER TABLE agronomic_events ALTER COLUMN event_category SET NOT NULL;
ALTER TABLE agronomic_events ALTER COLUMN event_type SET NOT NULL;
ALTER TABLE agronomic_events ALTER COLUMN target_scope SET NOT NULL;
ALTER TABLE agronomic_events ALTER COLUMN started_at SET NOT NULL;
ALTER TABLE agronomic_events ALTER COLUMN confidence SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS agronomic_events_agro_event_id_unique
ON agronomic_events (agro_event_id);
DO $$ BEGIN
  ALTER TABLE agronomic_events ADD CONSTRAINT agronomic_events_category_check CHECK (event_category IN ('season_setup','irrigation','cutting','fertilization','yield','field_note'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE agronomic_events ADD CONSTRAINT agronomic_events_scope_check CHECK (target_scope IN ('farm','pivot_1','pivot_2','both_pivots','unknown'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE agronomic_events ADD CONSTRAINT agronomic_events_confidence_check CHECK (confidence IN ('exact','estimated','unknown'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE agronomic_events ADD CONSTRAINT agronomic_events_time_check CHECK (ended_at IS NULL OR ended_at > started_at);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_agro_gateway_category_started_at ON agronomic_events (gateway_id, event_category, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_agro_category_type ON agronomic_events (event_category, event_type);
CREATE INDEX IF NOT EXISTS idx_agro_scope_started_at ON agronomic_events (target_scope, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_agro_active_irrigation ON agronomic_events (started_at DESC)
WHERE event_category='irrigation' AND event_type='irrigation_session' AND ended_at IS NULL;
