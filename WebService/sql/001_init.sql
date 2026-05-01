-- IoT Agricultural Monitoring Database Schema
-- Version: 1.0.0

-- Create gateways table
CREATE TABLE IF NOT EXISTS gateways (
    id SERIAL PRIMARY KEY,
    gateway_id TEXT UNIQUE NOT NULL,
    name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ,
    last_upload_at TIMESTAMPTZ,
    last_upload_id TEXT,
    firmware_version TEXT
);

-- Create nodes table
CREATE TABLE IF NOT EXISTS nodes (
    id SERIAL PRIMARY KEY,
    node_id TEXT UNIQUE NOT NULL,
    node_type TEXT NOT NULL CHECK (node_type IN ('soil', 'weather', 'main')),
    name TEXT,
    gateway_id TEXT REFERENCES gateways(gateway_id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ,
    last_seq INTEGER
);

-- Create sensor_readings table
CREATE TABLE IF NOT EXISTS sensor_readings (
    id BIGSERIAL PRIMARY KEY,
    record_id TEXT UNIQUE NOT NULL,
    upload_id TEXT NOT NULL,
    gateway_id TEXT NOT NULL,
    node_id TEXT NOT NULL,
    node_type TEXT NOT NULL,
    node_seq INTEGER,
    frame_id BIGINT,
    measured_at TIMESTAMPTZ NOT NULL,
    received_at TIMESTAMPTZ DEFAULT NOW(),

    -- Communication quality
    rssi INTEGER,
    snr REAL,

    -- Battery (nullable, not measured yet)
    battery_mv INTEGER NULL,
    battery_percent REAL NULL,
    battery_status TEXT DEFAULT 'not_measured',

    -- Soil values (no NPK)
    soil_temperature_c REAL NULL,
    soil_moisture_percent REAL NULL,
    soil_ec_us_cm REAL NULL,
    soil_ph REAL NULL,
    soil_salinity REAL NULL,

    -- Weather values
    air_temperature_c REAL NULL,
    air_humidity_percent REAL NULL,
    air_pressure_hpa REAL NULL,

    -- System
    status TEXT DEFAULT 'ok',
    raw_payload JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create system_events table
CREATE TABLE IF NOT EXISTS system_events (
    id BIGSERIAL PRIMARY KEY,
    event_id TEXT UNIQUE NOT NULL,
    upload_id TEXT,
    gateway_id TEXT NOT NULL,
    node_id TEXT NULL,
    event_type TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'error', 'critical')),
    event_time TIMESTAMPTZ NOT NULL,
    received_at TIMESTAMPTZ DEFAULT NOW(),
    message TEXT,
    details JSONB
);

-- Create uploads table
CREATE TABLE IF NOT EXISTS uploads (
    id BIGSERIAL PRIMARY KEY,
    upload_id TEXT UNIQUE NOT NULL,
    gateway_id TEXT NOT NULL,
    started_at TIMESTAMPTZ NOT NULL,
    finished_at TIMESTAMPTZ,
    received_at TIMESTAMPTZ DEFAULT NOW(),
    source TEXT DEFAULT 'esp32',
    records_count INTEGER DEFAULT 0,
    events_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'received',
    notes TEXT,
    raw_summary JSONB
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sensor_readings_gateway_id ON sensor_readings(gateway_id);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_node_id ON sensor_readings(node_id);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_measured_at ON sensor_readings(measured_at);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_upload_id ON sensor_readings(upload_id);

CREATE INDEX IF NOT EXISTS idx_system_events_gateway_id ON system_events(gateway_id);
CREATE INDEX IF NOT EXISTS idx_system_events_event_time ON system_events(event_time);
CREATE INDEX IF NOT EXISTS idx_system_events_severity ON system_events(severity);
CREATE INDEX IF NOT EXISTS idx_system_events_upload_id ON system_events(upload_id);

CREATE INDEX IF NOT EXISTS idx_uploads_gateway_id ON uploads(gateway_id);
CREATE INDEX IF NOT EXISTS idx_uploads_received_at ON uploads(received_at);

-- Insert sample gateway (optional, for testing)
-- INSERT INTO gateways (gateway_id, name) VALUES ('GW01', 'Main Gateway') ON CONFLICT (gateway_id) DO NOTHING;