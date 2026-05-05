import { useMutation, useQuery } from '@tanstack/react-query';
import { getLatestAnalyticsSnapshot, upsertAnalyticsSnapshot, type AnalyticsSnapshotRecord, type LatestAnalyticsSnapshotFilters } from '../api/analyticsSnapshots.api';
import type { Bucket, MetricKey, NodeId } from '../types/common';
import type { AnalyticsSnapshot, SnapshotInvalidationReason } from '../types/analytics';
import type { AnalyticsMetricName, SnapshotBucket, SnapshotDomain } from '../types/analytics';
import { buildSensorSnapshotIdentityFromParams, getDeltaTimeRangeFromCursor, getSnapshotDeltaCursor, isSnapshotReusable, mergeSnapshots } from '../utils/analytics/snapshots';
import { useAnalyticsSnapshot } from './useAnalyticsSnapshot';

interface UseIncrementalAnalyticsSnapshotParams {
  node_id: NodeId;
  metric: MetricKey;
  from: string;
  to: string;
  bucket: Bucket;
  includeReliability?: boolean;
  includeAlerts?: boolean;
}

export function useIncrementalAnalyticsSnapshot({ node_id, metric, from, to, bucket, includeReliability = true, includeAlerts = true }: UseIncrementalAnalyticsSnapshotParams) {
  const toAnalyticsSnapshot = (record: AnalyticsSnapshotRecord): AnalyticsSnapshot => ({
    snapshot_id: record.snapshot_id,
    identity: {
      domain: record.domain as SnapshotDomain,
      node_id: record.node_id as NodeId | undefined,
      metric: record.metric as AnalyticsMetricName | undefined,
      window_start: record.window_start,
      window_end: record.window_end,
      bucket: record.bucket as SnapshotBucket,
      analytics_version: record.analytics_version,
      qc_version: record.qc_version,
      calibration_version: record.calibration_version ?? undefined,
      filters_hash: record.filters_hash,
    },
    cursor: record.cursor_json,
    payload: record.payload_json,
    quality: record.quality_json as unknown as AnalyticsSnapshot['quality'],
    invalidated: record.invalidated,
    invalidation_reason: (record.invalidation_reason ?? undefined) as SnapshotInvalidationReason | undefined,
    created_at: record.created_at,
    updated_at: record.updated_at,
  });

  const identity = buildSensorSnapshotIdentityFromParams({
    node_id,
    metric,
    from,
    to,
    bucket,
  });

  const latestPersistedQuery = useQuery({
    queryKey: ['analyticsSnapshots', 'latest', identity],
    queryFn: () => {
      const filters: LatestAnalyticsSnapshotFilters = {
        domain: identity.domain,
        node_id: identity.node_id,
        metric: identity.metric,
        bucket: identity.bucket,
        analytics_version: identity.analytics_version,
        qc_version: identity.qc_version,
        calibration_version: identity.calibration_version,
        filters_hash: identity.filters_hash,
      };
      return getLatestAnalyticsSnapshot(filters);
    },
    retry: false,
  });

  const latestPersistedSnapshot = latestPersistedQuery.data ? toAnalyticsSnapshot(latestPersistedQuery.data) : null;
  const canReuse = isSnapshotReusable(latestPersistedSnapshot, identity);
  const reusableSnapshot = canReuse ? latestPersistedSnapshot : null;
  const deltaCursor = getSnapshotDeltaCursor(reusableSnapshot);
  const deltaRange = reusableSnapshot
    ? getDeltaTimeRangeFromCursor(deltaCursor, from, to)
    : { from, to, reason: 'no_reusable_snapshot', usedCursor: false };
  const usedDelta = reusableSnapshot ? deltaRange.usedCursor && deltaRange.from !== from : false;
  const aggregateMode: 'api' | 'derived' = reusableSnapshot && usedDelta ? 'derived' : 'api';

  const analyticsSnapshotQuery = useAnalyticsSnapshot({
    node_id,
    metric,
    from,
    to,
    bucket,
    effectiveFrom: reusableSnapshot ? deltaRange.from : undefined,
    aggregateMode,
    includeReliability,
    includeAlerts,
  });
  const currentSnapshot = analyticsSnapshotQuery.snapshot;

  const mergedPreviewSnapshot = reusableSnapshot
    ? mergeSnapshots(reusableSnapshot, currentSnapshot).new_snapshot
    : currentSnapshot;

  const saveMutation = useMutation({
    mutationFn: () => upsertAnalyticsSnapshot(mergedPreviewSnapshot),
  });

  const reuseReason = canReuse
    ? `Identity compatible; using ${usedDelta ? `cursor delta from ${deltaRange.from}` : 'full logical window due to cursor boundary'}`
    : latestPersistedSnapshot
      ? 'Identity incompatible'
      : 'No persisted snapshot found';

  return {
    currentSnapshot,
    latestPersistedSnapshot,
    reusableSnapshot,
    mergedPreviewSnapshot,
    deltaRange,
    usedDelta,
    deltaCursor,
    canReuse,
    reuseReason,
    isLoading: analyticsSnapshotQuery.isLoading || latestPersistedQuery.isLoading,
    isError: analyticsSnapshotQuery.isError || (latestPersistedQuery.isError && (latestPersistedQuery.error as { status?: number } | undefined)?.status !== 404),
    error: analyticsSnapshotQuery.error ?? latestPersistedQuery.error,
    saveMergedSnapshot: saveMutation.mutateAsync,
    saveStatus: saveMutation.status,
  };
}
