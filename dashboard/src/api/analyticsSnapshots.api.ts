import { apiGet, apiPost, apiPut } from './client';
import type { AnalyticsSnapshot, SnapshotBucket, SnapshotDomain } from '../types/analytics';

export interface AnalyticsSnapshotRecord {
  snapshot_id: string;
  domain: string;
  node_id: string | null;
  metric: string | null;
  window_start: string;
  window_end: string;
  bucket: string;
  analytics_version: string;
  qc_version: string;
  calibration_version: string | null;
  filters_hash: string;
  cursor_json: Record<string, unknown>;
  payload_json: Record<string, unknown>;
  quality_json: Record<string, unknown>;
  invalidated: boolean;
  invalidation_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface ListAnalyticsSnapshotFilters extends Record<string, unknown> {
  domain?: string;
  node_id?: string;
  metric?: string;
  window_start?: string;
  window_end?: string;
  invalidated?: boolean;
}

export function listAnalyticsSnapshots(filters: ListAnalyticsSnapshotFilters = {}) {
  return apiGet<{ snapshots: AnalyticsSnapshotRecord[]; count: number }>('/api/v1/analytics-snapshots', filters);
}

export function getAnalyticsSnapshot(snapshotId: string) {
  return apiGet<AnalyticsSnapshotRecord>(`/api/v1/analytics-snapshots/${snapshotId}`);
}

export function upsertAnalyticsSnapshot(snapshot: AnalyticsSnapshot) {
  return apiPut<AnalyticsSnapshotRecord>(`/api/v1/analytics-snapshots/${snapshot.snapshot_id}`, {
    domain: snapshot.identity.domain,
    node_id: snapshot.identity.node_id,
    metric: snapshot.identity.metric,
    window_start: snapshot.identity.window_start,
    window_end: snapshot.identity.window_end,
    bucket: snapshot.identity.bucket,
    analytics_version: snapshot.identity.analytics_version,
    qc_version: snapshot.identity.qc_version,
    calibration_version: snapshot.identity.calibration_version,
    filters_hash: snapshot.identity.filters_hash,
    cursor_json: snapshot.cursor,
    payload_json: snapshot.payload,
    quality_json: snapshot.quality,
    invalidated: snapshot.invalidated,
    invalidation_reason: snapshot.invalidation_reason ?? null,
  });
}

export function invalidateAnalyticsSnapshot(snapshotId: string, reason: string) {
  return apiPost<AnalyticsSnapshotRecord>(`/api/v1/analytics-snapshots/${snapshotId}/invalidate`, { reason });
}

export interface LatestAnalyticsSnapshotFilters extends Record<string, unknown> {
  domain: SnapshotDomain;
  bucket: SnapshotBucket;
  analytics_version: string;
  qc_version: string;
  filters_hash: string;
  node_id?: string;
  metric?: string;
  calibration_version?: string;
}

export function getLatestAnalyticsSnapshot(filters: LatestAnalyticsSnapshotFilters) {
  return apiGet<AnalyticsSnapshotRecord>('/api/v1/analytics-snapshots/latest', filters);
}
