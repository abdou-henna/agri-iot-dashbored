import { useMutation, useQuery } from '@tanstack/react-query';
import { getLatestAnalyticsSnapshot, upsertAnalyticsSnapshot, type AnalyticsSnapshotRecord, type LatestAnalyticsSnapshotFilters } from '../api/analyticsSnapshots.api';
import type { Bucket, MetricKey, NodeId } from '../types/common';
import type { AnalyticsSnapshot, SnapshotInvalidationReason } from '../types/analytics';
import type { AnalyticsMetricName, SnapshotBucket, SnapshotDomain } from '../types/analytics';
import { mergeSnapshots, isSnapshotReusable } from '../utils/analytics/snapshots';
import { useAnalyticsSnapshot } from './useAnalyticsSnapshot';

interface UseIncrementalAnalyticsSnapshotParams {
  node_id: NodeId;
  metric: MetricKey;
  from: string;
  to: string;
  bucket: Bucket;
}

export function useIncrementalAnalyticsSnapshot({ node_id, metric, from, to, bucket }: UseIncrementalAnalyticsSnapshotParams) {
  const analyticsSnapshotQuery = useAnalyticsSnapshot({ node_id, metric, from, to, bucket });
  const currentSnapshot = analyticsSnapshotQuery.snapshot;

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

  const latestPersistedQuery = useQuery({
    queryKey: ['analyticsSnapshots', 'latest', currentSnapshot.identity],
    queryFn: () => {
      const filters: LatestAnalyticsSnapshotFilters = {
        domain: currentSnapshot.identity.domain,
        node_id: currentSnapshot.identity.node_id,
        metric: currentSnapshot.identity.metric,
        bucket: currentSnapshot.identity.bucket,
        analytics_version: currentSnapshot.identity.analytics_version,
        qc_version: currentSnapshot.identity.qc_version,
        calibration_version: currentSnapshot.identity.calibration_version,
        filters_hash: currentSnapshot.identity.filters_hash,
      };
      return getLatestAnalyticsSnapshot(filters);
    },
    retry: false,
  });

  const latestPersistedSnapshot = latestPersistedQuery.data ? toAnalyticsSnapshot(latestPersistedQuery.data) : null;
  const reusableSnapshot = isSnapshotReusable(latestPersistedSnapshot, currentSnapshot.identity) ? latestPersistedSnapshot : null;
  const mergedPreviewSnapshot = reusableSnapshot
    ? mergeSnapshots(reusableSnapshot, currentSnapshot).new_snapshot
    : currentSnapshot;

  const saveMutation = useMutation({
    mutationFn: () => upsertAnalyticsSnapshot(mergedPreviewSnapshot),
  });

  const canReuse = Boolean(reusableSnapshot);
  const reuseReason = canReuse
    ? 'Identity compatible; preview merge available'
    : latestPersistedSnapshot
      ? 'Identity incompatible'
      : 'No persisted snapshot found';

  return {
    currentSnapshot,
    latestPersistedSnapshot,
    reusableSnapshot,
    mergedPreviewSnapshot,
    canReuse,
    reuseReason,
    isLoading: analyticsSnapshotQuery.isLoading || latestPersistedQuery.isLoading,
    isError: analyticsSnapshotQuery.isError || (latestPersistedQuery.isError && (latestPersistedQuery.error as { status?: number } | undefined)?.status !== 404),
    error: analyticsSnapshotQuery.error ?? latestPersistedQuery.error,
    saveMergedSnapshot: saveMutation.mutateAsync,
    saveStatus: saveMutation.status,
  };
}
