export type NodeId = 'MAIN' | 'N2' | 'N3';
export type NodeType = 'soil' | 'weather' | 'main';
export type ReadingStatus = 'ok' | 'partial' | 'missing' | 'error' | 'duplicate';
export type EventSeverity = 'info' | 'warning' | 'error' | 'critical';
export type AgroCategory =
  | 'season_setup'
  | 'irrigation'
  | 'cutting'
  | 'fertilization'
  | 'yield'
  | 'field_note';
export type TargetScope = 'farm' | 'pivot_1' | 'pivot_2' | 'both_pivots' | 'unknown';
export type TimeConfidence = 'exact' | 'estimated' | 'unknown';

export interface DateRange {
  from: string;
  to: string;
}

export type MetricKey =
  | 'soil_temperature_c'
  | 'soil_moisture_percent'
  | 'soil_ec_us_cm'
  | 'air_temperature_c'
  | 'air_humidity_percent'
  | 'air_pressure_hpa'
  | 'rssi'
  | 'snr';

export type Bucket = '10min' | '1hour' | '1day';

