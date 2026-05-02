-- Migration 002 — patch schema to match firmware data contract
-- Safe to run on existing data: only adds nullable columns and relaxes constraints.

-- Add error_code to sensor_readings (nullable; firmware only sets when status != ok)
ALTER TABLE sensor_readings
  ADD COLUMN IF NOT EXISTS error_code TEXT;

-- Add error_code to system_events (nullable; firmware only sets when relevant)
ALTER TABLE system_events
  ADD COLUMN IF NOT EXISTS error_code TEXT;

-- Relax sensor_readings.upload_id to nullable.
-- Firmware always supplies it via the envelope upload_id, but the endpoint spec
-- only requires readings/events arrays, so server-generated IDs must be allowed.
ALTER TABLE sensor_readings
  ALTER COLUMN upload_id DROP NOT NULL;

-- Ensure unique constraints exist (idempotent with IF NOT EXISTS index names).
-- record_id already has UNIQUE in 001_init.sql; guard in case of schema drift.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'sensor_readings'::regclass
      AND contype = 'u'
      AND conname = 'sensor_readings_record_id_key'
  ) THEN
    ALTER TABLE sensor_readings ADD CONSTRAINT sensor_readings_record_id_key UNIQUE (record_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'system_events'::regclass
      AND contype = 'u'
      AND conname = 'system_events_event_id_key'
  ) THEN
    ALTER TABLE system_events ADD CONSTRAINT system_events_event_id_key UNIQUE (event_id);
  END IF;
END
$$;
