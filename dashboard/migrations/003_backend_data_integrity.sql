-- Smart Farm IoT Dashboard
-- Migration 003: backend data integrity hardening
--
-- Safe to run more than once.
-- Does not rename fields, redesign tables, or change existing API-facing column names.

BEGIN;

-- 1. uploads.created_at audit column
ALTER TABLE uploads
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ;

UPDATE uploads
SET created_at = COALESCE(received_at, started_at, now())
WHERE created_at IS NULL;

ALTER TABLE uploads
  ALTER COLUMN created_at SET DEFAULT now(),
  ALTER COLUMN created_at SET NOT NULL;

-- 2. Critical timestamp defaults for new rows.
-- Existing non-null data is preserved. These defaults prevent future ingest rows
-- from missing server-side receipt/audit timestamps.
ALTER TABLE sensor_readings
  ALTER COLUMN received_at SET DEFAULT now();

ALTER TABLE system_events
  ALTER COLUMN received_at SET DEFAULT now();

ALTER TABLE uploads
  ALTER COLUMN received_at SET DEFAULT now();

-- 3. Critical timestamp null guards.
-- These are intentionally added only after existing data is validated/backfilled.
ALTER TABLE sensor_readings
  ALTER COLUMN measured_at SET NOT NULL,
  ALTER COLUMN received_at SET NOT NULL;

ALTER TABLE system_events
  ALTER COLUMN event_time SET NOT NULL,
  ALTER COLUMN received_at SET NOT NULL;

ALTER TABLE uploads
  ALTER COLUMN started_at SET NOT NULL,
  ALTER COLUMN received_at SET NOT NULL;

-- 4. Upload linkage for readings.
-- The dashboard contract requires sensor readings to link to upload sessions.
ALTER TABLE sensor_readings
  ALTER COLUMN upload_id SET NOT NULL;

-- 5. Referential integrity where upload_id is present.
-- system_events.upload_id stays nullable because gateway-level or locally generated
-- events may exist outside an upload session. When present, it must be valid.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'sensor_readings_upload_id_fkey'
      AND conrelid = 'sensor_readings'::regclass
  ) THEN
    ALTER TABLE sensor_readings
      ADD CONSTRAINT sensor_readings_upload_id_fkey
      FOREIGN KEY (upload_id)
      REFERENCES uploads(upload_id)
      ON UPDATE CASCADE
      ON DELETE RESTRICT
      NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'system_events_upload_id_fkey'
      AND conrelid = 'system_events'::regclass
  ) THEN
    ALTER TABLE system_events
      ADD CONSTRAINT system_events_upload_id_fkey
      FOREIGN KEY (upload_id)
      REFERENCES uploads(upload_id)
      ON UPDATE CASCADE
      ON DELETE RESTRICT
      NOT VALID;
  END IF;
END $$;

ALTER TABLE sensor_readings VALIDATE CONSTRAINT sensor_readings_upload_id_fkey;
ALTER TABLE system_events VALIDATE CONSTRAINT system_events_upload_id_fkey;

-- 6. Timestamp ordering guards.
-- Allow RTC drift tolerance by not rejecting old field times, but reject impossible
-- server ordering where server receipt precedes upload start for upload rows.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uploads_received_at_after_started_at_check'
  ) THEN
    ALTER TABLE uploads
      ADD CONSTRAINT uploads_received_at_after_started_at_check
      CHECK (received_at >= started_at)
      NOT VALID;
  END IF;
END $$;

ALTER TABLE uploads VALIDATE CONSTRAINT uploads_received_at_after_started_at_check;

-- 7. Indexes for dashboard query paths.
CREATE INDEX IF NOT EXISTS idx_sensor_readings_measured_at
  ON sensor_readings (measured_at DESC);

CREATE INDEX IF NOT EXISTS idx_sensor_readings_node_measured_at
  ON sensor_readings (node_id, measured_at DESC);

CREATE INDEX IF NOT EXISTS idx_sensor_readings_upload_id
  ON sensor_readings (upload_id);

CREATE INDEX IF NOT EXISTS idx_sensor_readings_node_id
  ON sensor_readings (node_id);

CREATE INDEX IF NOT EXISTS idx_system_events_event_time
  ON system_events (event_time DESC);

CREATE INDEX IF NOT EXISTS idx_system_events_node_event_time
  ON system_events (node_id, event_time DESC);

CREATE INDEX IF NOT EXISTS idx_system_events_upload_id
  ON system_events (upload_id);

CREATE INDEX IF NOT EXISTS idx_system_events_node_id
  ON system_events (node_id);

CREATE INDEX IF NOT EXISTS idx_uploads_started_at
  ON uploads (started_at DESC);

CREATE INDEX IF NOT EXISTS idx_uploads_received_at
  ON uploads (received_at DESC);

CREATE INDEX IF NOT EXISTS idx_uploads_gateway_received_at
  ON uploads (gateway_id, received_at DESC);

COMMIT;

