-- Smart Farm IoT Dashboard
-- Validation queries for migration 003.
--
-- Expected result: every issue_count should be 0.

-- Schema: uploads.created_at exists, is NOT NULL, defaults to now().
SELECT
  'uploads.created_at schema' AS check_name,
  COUNT(*) FILTER (
    WHERE column_name = 'created_at'
      AND is_nullable = 'NO'
      AND column_default ILIKE '%now%'
  ) = 1 AS passed,
  CASE
    WHEN COUNT(*) FILTER (
      WHERE column_name = 'created_at'
        AND is_nullable = 'NO'
        AND column_default ILIKE '%now%'
    ) = 1 THEN 0
    ELSE 1
  END AS issue_count
FROM information_schema.columns
WHERE table_name = 'uploads';

-- Critical timestamps are non-null.
SELECT 'sensor_readings.measured_at nulls' AS check_name, COUNT(*) = 0 AS passed, COUNT(*) AS issue_count
FROM sensor_readings
WHERE measured_at IS NULL
UNION ALL
SELECT 'sensor_readings.received_at nulls', COUNT(*) = 0, COUNT(*)
FROM sensor_readings
WHERE received_at IS NULL
UNION ALL
SELECT 'system_events.event_time nulls', COUNT(*) = 0, COUNT(*)
FROM system_events
WHERE event_time IS NULL
UNION ALL
SELECT 'system_events.received_at nulls', COUNT(*) = 0, COUNT(*)
FROM system_events
WHERE received_at IS NULL
UNION ALL
SELECT 'uploads.started_at nulls', COUNT(*) = 0, COUNT(*)
FROM uploads
WHERE started_at IS NULL
UNION ALL
SELECT 'uploads.received_at nulls', COUNT(*) = 0, COUNT(*)
FROM uploads
WHERE received_at IS NULL
UNION ALL
SELECT 'uploads.created_at nulls', COUNT(*) = 0, COUNT(*)
FROM uploads
WHERE created_at IS NULL;

-- UTC storage verification for TIMESTAMPTZ columns.
-- PostgreSQL stores TIMESTAMPTZ in UTC internally; this verifies the columns
-- are actually timestamptz and not timestamp without time zone.
SELECT
  table_name || '.' || column_name || ' type' AS check_name,
  data_type = 'timestamp with time zone' AS passed,
  CASE WHEN data_type = 'timestamp with time zone' THEN 0 ELSE 1 END AS issue_count
FROM information_schema.columns
WHERE (table_name, column_name) IN (
  ('sensor_readings', 'measured_at'),
  ('sensor_readings', 'received_at'),
  ('system_events', 'event_time'),
  ('system_events', 'received_at'),
  ('uploads', 'started_at'),
  ('uploads', 'finished_at'),
  ('uploads', 'received_at'),
  ('uploads', 'created_at')
);

-- Ordering consistency.
SELECT 'readings measured_at after received_at' AS check_name, COUNT(*) = 0 AS passed, COUNT(*) AS issue_count
FROM sensor_readings
WHERE measured_at > received_at
UNION ALL
SELECT 'events event_time after received_at', COUNT(*) = 0, COUNT(*)
FROM system_events
WHERE event_time > received_at
UNION ALL
SELECT 'uploads received_at before started_at', COUNT(*) = 0, COUNT(*)
FROM uploads
WHERE received_at < started_at
UNION ALL
SELECT 'uploads finished_at before started_at', COUNT(*) = 0, COUNT(*)
FROM uploads
WHERE finished_at IS NOT NULL
  AND finished_at < started_at;

-- Upload linkage / orphan checks.
SELECT 'readings without upload_id' AS check_name, COUNT(*) = 0 AS passed, COUNT(*) AS issue_count
FROM sensor_readings
WHERE upload_id IS NULL
UNION ALL
SELECT 'readings orphan upload_id', COUNT(*) = 0, COUNT(*)
FROM sensor_readings sr
LEFT JOIN uploads u ON u.upload_id = sr.upload_id
WHERE u.upload_id IS NULL
UNION ALL
SELECT 'events orphan upload_id', COUNT(*) = 0, COUNT(*)
FROM system_events se
LEFT JOIN uploads u ON u.upload_id = se.upload_id
WHERE se.upload_id IS NOT NULL
  AND u.upload_id IS NULL;

-- Required index presence.
SELECT
  expected.index_name AS check_name,
  idx.indexname IS NOT NULL AS passed,
  CASE WHEN idx.indexname IS NOT NULL THEN 0 ELSE 1 END AS issue_count
FROM (
  VALUES
    ('idx_sensor_readings_measured_at'),
    ('idx_sensor_readings_node_measured_at'),
    ('idx_sensor_readings_upload_id'),
    ('idx_sensor_readings_node_id'),
    ('idx_system_events_event_time'),
    ('idx_system_events_node_event_time'),
    ('idx_system_events_upload_id'),
    ('idx_system_events_node_id'),
    ('idx_uploads_started_at'),
    ('idx_uploads_received_at'),
    ('idx_uploads_gateway_received_at')
) AS expected(index_name)
LEFT JOIN pg_indexes idx
  ON idx.schemaname = current_schema()
 AND idx.indexname = expected.index_name;

