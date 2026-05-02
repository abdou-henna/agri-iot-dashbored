CREATE TABLE IF NOT EXISTS agronomic_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  node_id TEXT NULL,
  type TEXT NOT NULL CHECK (type IN ('irrigation_start', 'irrigation_stop', 'fertilization', 'manual_note')),
  value DOUBLE PRECISION NULL,
  unit TEXT NULL,
  metadata JSONB NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by TEXT NULL
);

CREATE INDEX IF NOT EXISTS idx_agronomic_events_node_created_at
  ON agronomic_events (node_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_agronomic_events_type
  ON agronomic_events (type);

