import type { AgronomicEvent } from './agronomy';
import type { EventSeverity, NodeId } from './common';
import type { SystemEvent } from './events';
import type { SensorReading, SensorReading as Reading } from './readings';

export interface AnalyticsTimeRange {
  from: string;
  to: string;
}

export type AnalyticsNodeId = NodeId;

export type AnalyticsMetricName =
  | 'soil_moisture_percent'
  | 'soil_temperature_c'
  | 'soil_ec_us_cm'
  | 'air_temperature_c'
  | 'air_humidity_percent'
  | 'air_pressure_hpa'
  | 'rssi'
  | 'snr';

export interface CleanedReading extends SensorReading {
  qc_excluded?: boolean;
}

export interface DuplicateReadingMeta {
  key: string;
  count: number;
  conflict: boolean;
  record_ids: string[];
}

export interface QcFlag {
  code: string;
  severity: EventSeverity;
  domain: 'sensor' | 'system' | 'upload' | 'agronomy';
  node_id?: AnalyticsNodeId;
  start_time: string;
  end_time?: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface QcResult {
  flags: QcFlag[];
  missing_pct: number;
  valid_count: number;
  expected_count: number;
}

export interface AggregatePoint {
  bucket_start: string;
  avg: number | null;
  min: number | null;
  max: number | null;
  count: number;
  missing_count: number;
}

export interface ReliabilityScore {
  score: number;
  level: 'high' | 'medium' | 'low' | 'invalid';
  reasons: string[];
}

export interface AlertEvaluation {
  alert_id: string;
  alert_type: string;
  domain: 'agronomic' | 'operational';
  severity: EventSeverity;
  confidence: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  triggered_at: string;
  evidence: Record<string, unknown>;
  limitations: string[];
}

export interface IrrigationResponseMetric {
  irrigation_event: Pick<AgronomicEvent, 'agro_event_id' | 'started_at' | 'ended_at' | 'target_scope' | 'confidence'>;
  pre_value: number | null;
  post_value: number | null;
  delta: number | null;
  lag_minutes: number | null;
}

export interface VpdPoint {
  measured_at: string;
  air_temperature_c: number;
  air_humidity_percent: number;
  vpd_kpa: number;
}

export type MetricReading = Pick<Reading, 'record_id' | 'node_id' | 'measured_at'> & Partial<Record<AnalyticsMetricName, number | null>>;
export type NodeEvent = Pick<SystemEvent, 'node_id' | 'severity' | 'event_time'>;
