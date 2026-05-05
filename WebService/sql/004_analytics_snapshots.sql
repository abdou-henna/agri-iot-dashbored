CREATE TABLE IF NOT EXISTS analytics_snapshots (
  snapshot_id TEXT PRIMARY KEY,
  domain TEXT NOT NULL,
  node_id TEXT NULL,
  metric TEXT NULL,
  window_start TIMESTAMPTZ NOT NULL,
  window_end TIMESTAMPTZ NOT NULL,
  bucket TEXT NOT NULL,
  analytics_version TEXT NOT NULL,
  qc_version TEXT NOT NULL,
  calibration_version TEXT NULL,
  filters_hash TEXT NOT NULL,
  cursor_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  payload_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  quality_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  invalidated BOOLEAN NOT NULL DEFAULT FALSE,
  invalidation_reason TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_snapshots_domain_node_metric
  ON analytics_snapshots(domain, node_id, metric);

CREATE INDEX IF NOT EXISTS idx_analytics_snapshots_window
  ON analytics_snapshots(window_start, window_end);

CREATE INDEX IF NOT EXISTS idx_analytics_snapshots_invalidated
  ON analytics_snapshots(invalidated);

CREATE INDEX IF NOT EXISTS idx_analytics_snapshots_versions
  ON analytics_snapshots(analytics_version, qc_version);
