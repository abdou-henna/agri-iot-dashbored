import type {
  AggregatePoint,
  AnalyticsSnapshot,
  CleanedReading,
  QcFlag,
  SnapshotCursor,
  SnapshotIdentity,
  SnapshotInvalidationReason,
  SnapshotMergeResult,
  SnapshotPayload,
  SnapshotQualitySummary,
} from '../../types/analytics';

export function buildSnapshotIdentity(identity: SnapshotIdentity): SnapshotIdentity {
  return { ...identity };
}

export function buildSnapshotId(identity: SnapshotIdentity): string {
  return [identity.domain, identity.node_id ?? 'all', identity.metric ?? 'all', identity.window_start, identity.window_end, identity.bucket, identity.analytics_version, identity.qc_version, identity.calibration_version ?? 'none', identity.filters_hash].join(':');
}

export function isSnapshotIdentityCompatible(a: SnapshotIdentity, b: SnapshotIdentity): boolean {
  return a.domain === b.domain && a.node_id === b.node_id && a.metric === b.metric && a.bucket === b.bucket && a.analytics_version === b.analytics_version && a.qc_version === b.qc_version && a.calibration_version === b.calibration_version && a.filters_hash === b.filters_hash;
}

export function createEmptySnapshot(identity: SnapshotIdentity, nowIso: string): AnalyticsSnapshot {
  const snapshotId = buildSnapshotId(identity);
  const quality: SnapshotQualitySummary = { processed_count: 0, valid_count: 0, missing_count: 0, duplicate_count: 0, conflict_count: 0, qc_flag_count: 0 };
  const payload: SnapshotPayload = { aggregates: [], qc_flags: [], quality, cursor: {} };
  return { snapshot_id: snapshotId, identity: buildSnapshotIdentity(identity), cursor: {}, payload, quality, invalidated: false, created_at: nowIso, updated_at: nowIso };
}

export function getSensorCursorFromReadings(readings: ReadonlyArray<Pick<CleanedReading, 'measured_at' | 'record_id'>>): SnapshotCursor {
  const sorted = [...readings].sort((a, b) => Date.parse(a.measured_at) - Date.parse(b.measured_at) || a.record_id.localeCompare(b.record_id));
  const latest = sorted[sorted.length - 1];
  return latest ? { last_measured_at: latest.measured_at, last_record_id: latest.record_id } : {};
}

export function getEventCursorFromEvents<T extends { event_time: string; event_id?: string }>(events: ReadonlyArray<T>): SnapshotCursor {
  const sorted = [...events].sort((a, b) => Date.parse(a.event_time) - Date.parse(b.event_time));
  const latest = sorted[sorted.length - 1];
  return latest ? { last_event_time: latest.event_time, last_event_id: latest.event_id } : {};
}

export function mergeAggregatePoints(prev: ReadonlyArray<AggregatePoint> = [], next: ReadonlyArray<AggregatePoint> = []): AggregatePoint[] {
  const byBucket = new Map<string, AggregatePoint>();
  for (const point of prev) byBucket.set(point.bucket_start, { ...point });
  for (const point of next) byBucket.set(point.bucket_start, { ...point });
  return [...byBucket.values()].sort((a, b) => Date.parse(a.bucket_start) - Date.parse(b.bucket_start));
}

export function mergeQcFlags(prev: ReadonlyArray<QcFlag> = [], next: ReadonlyArray<QcFlag> = []): QcFlag[] {
  const merged = [...prev, ...next];
  const seen = new Set<string>();
  return merged.filter((flag) => {
    const key = `${flag.code}|${flag.start_time}|${flag.end_time ?? ''}|${flag.node_id ?? ''}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function invalidateSnapshot(snapshot: AnalyticsSnapshot, reason: SnapshotInvalidationReason, nowIso = new Date().toISOString()): AnalyticsSnapshot {
  return { ...snapshot, invalidated: true, invalidation_reason: reason, updated_at: nowIso };
}

export function mergeSnapshots(prev: AnalyticsSnapshot, delta: AnalyticsSnapshot, nowIso = new Date().toISOString()): SnapshotMergeResult {
  if (!isSnapshotIdentityCompatible(prev.identity, delta.identity)) {
    return { previous_snapshot_id: prev.snapshot_id, new_snapshot: { ...delta, updated_at: nowIso }, processed_new_records: delta.quality.processed_count, skipped_duplicate_records: delta.quality.duplicate_count, conflict_count: delta.quality.conflict_count, invalidated_previous: true, invalidation_reason: 'query_filters_changed' };
  }
  const mergedAggregates = mergeAggregatePoints(prev.payload.aggregates, delta.payload.aggregates);
  const mergedQcFlags = mergeQcFlags(prev.payload.qc_flags, delta.payload.qc_flags);
  const quality: SnapshotQualitySummary = {
    ...delta.quality,
    processed_count: prev.quality.processed_count + delta.quality.processed_count,
    valid_count: prev.quality.valid_count + delta.quality.valid_count,
    missing_count: prev.quality.missing_count + delta.quality.missing_count,
    duplicate_count: prev.quality.duplicate_count + delta.quality.duplicate_count,
    conflict_count: prev.quality.conflict_count + delta.quality.conflict_count,
    qc_flag_count: mergedQcFlags.length,
  };
  const newSnapshot: AnalyticsSnapshot = {
    ...delta,
    payload: { ...delta.payload, aggregates: mergedAggregates, qc_flags: mergedQcFlags, quality },
    quality,
    created_at: prev.created_at,
    updated_at: nowIso,
  };
  return { previous_snapshot_id: prev.snapshot_id, new_snapshot: newSnapshot, processed_new_records: delta.quality.processed_count, skipped_duplicate_records: delta.quality.duplicate_count, conflict_count: delta.quality.conflict_count, invalidated_previous: false };
}
