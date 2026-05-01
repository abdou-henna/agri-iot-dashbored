import type { Bucket, MetricKey, NodeId, NodeType, ReadingStatus } from './common';

export interface SensorReading {
  record_id: string;
  upload_id: string | null;
  gateway_id: string;
  node_id: NodeId;
  node_type: NodeType;
  node_seq: number | null;
  frame_id: number | null;
  measured_at: string;
  received_at: string | null;
  rssi: number | null;
  snr: number | null;
  battery_mv: number | null;
  battery_percent: number | null;
  battery_status: 'not_measured';
  soil_temperature_c: number | null;
  soil_moisture_percent: number | null;
  soil_ec_us_cm: number | null;
  air_temperature_c: number | null;
  air_humidity_percent: number | null;
  air_pressure_hpa: number | null;
  status: ReadingStatus;
  error_code: string | null;
}

export interface ReadingsResponse {
  readings: SensorReading[];
  count?: number;
}

export interface ReadingsFilters {
  node_id?: NodeId;
  node_type?: NodeType;
  status?: ReadingStatus;
  upload_id?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}

export interface AggregatePoint {
  bucket_start: string;
  avg: number | null;
  min: number | null;
  max: number | null;
  count: number;
  missing_count: number;
}

export interface ReadingAggregateResponse {
  node_id: NodeId;
  metric: MetricKey;
  bucket: Bucket;
  from: string;
  to: string;
  points: AggregatePoint[];
}

export interface TimeSeriesPoint {
  ts: string;
  displayTime: string;
  value: number | null;
  status?: ReadingStatus;
  node_id?: NodeId;
  missingCount?: number;
}

