import type { EventSeverity } from './common';
import type { AnalyticsSnapshot, QcFlag, ReliabilityScore, AlertEvaluation } from './analytics';

export type ProcessedDataDomain = 'sensor' | 'system' | 'agronomic' | 'upload';
export type ProcessedDataStatus = 'accepted' | 'downgraded' | 'excluded' | 'missing' | 'derived_only';

export interface ProcessedDataTimestampSet {
  measured_at?: string | null;
  event_time?: string | null;
  started_at?: string | null;
  ended_at?: string | null;
  upload_received_at?: string | null;
}

export interface ProcessedDataQcFlag {
  code: string;
  severity: EventSeverity;
  message: string;
  domain: ProcessedDataDomain;
}

export interface ProcessedDataReliability {
  score: number | null;
  level: ReliabilityScore['level'] | 'unknown';
  reasons: string[];
}

export interface ProcessedDataAlertRef {
  alert_id: string;
  title: string;
  severity: EventSeverity;
  alert_type: string;
}

export interface ProcessedDataViewerRow {
  id: string;
  domain: ProcessedDataDomain;
  source_label: string;
  metric: string;
  raw_value: number | string | null;
  cleaned_value: number | string | null;
  processed_value: number | string | null;
  unit: string | null;
  processing_status: ProcessedDataStatus;
  qc_flags: ProcessedDataQcFlag[];
  reliability: ProcessedDataReliability;
  deterministic_alerts: ProcessedDataAlertRef[];
  timestamps: ProcessedDataTimestampSet;
  limitations: string[];
}

export interface ProcessedDataViewerSnapshotMeta {
  snapshot_id: string;
  domain: AnalyticsSnapshot['identity']['domain'];
  node_id?: string;
  metric?: string;
  window_start: string;
  window_end: string;
  bucket: AnalyticsSnapshot['identity']['bucket'];
  analytics_version: string;
  qc_version: string;
  context_label?: string;
}

export interface ProcessedDataViewerModel {
  snapshot_meta: ProcessedDataViewerSnapshotMeta;
  rows: ProcessedDataViewerRow[];
  snapshot_qc_flags: QcFlag[];
  snapshot_alerts: AlertEvaluation[];
  snapshot_reliability: ProcessedDataReliability;
  limitations: string[];
}

export interface ProcessedDataViewerFilters {
  domain: ProcessedDataDomain | 'all';
  status: ProcessedDataStatus | 'all';
  reliability_band: 'all' | 'high' | 'medium' | 'low' | 'invalid' | 'unknown';
  qc_severity: 'all' | EventSeverity;
  alert_severity: 'all' | EventSeverity;
  search: string;
}
