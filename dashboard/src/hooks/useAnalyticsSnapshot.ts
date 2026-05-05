import { useMemo } from 'react';
import type { Bucket, MetricKey, NodeId } from '../types/common';
import type { AnalyticsMetricName, AnalyticsSnapshot, DuplicateReadingMeta, QcFlag, SnapshotBucket, SnapshotIdentity } from '../types/analytics';
import { useReadingAggregates } from './useReadingAggregates';
import { useReadings } from './useReadings';
import { cleanReadings, detectDuplicateReadings, getSensorCursorFromReadings, physicalRangeFlags } from '../utils/analytics';

interface UseAnalyticsSnapshotParams {
  node_id: NodeId;
  metric: MetricKey;
  from: string;
  to: string;
  bucket: Bucket;
}

interface UseAnalyticsResult {
  aggregates: Array<{ bucket_start: string; avg: number | null; min: number | null; max: number | null; count: number; missing_count: number }>;
  qcFlags: QcFlag[];
  duplicateMeta: DuplicateReadingMeta[];
  cleanedReadings: ReturnType<typeof cleanReadings>;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
}

function normalizeBucket(bucket: Bucket): SnapshotBucket {
  if (bucket === '10min') return '10min';
  if (bucket === '1hour') return 'hour';
  return 'day';
}

function useAnalytics(params: UseAnalyticsSnapshotParams): UseAnalyticsResult {
  const { node_id, metric, from, to, bucket } = params;
  const readingsQuery = useReadings({ node_id, from, to });
  const aggregateQuery = useReadingAggregates(node_id, metric, { from, to }, bucket);

  const cleanedReadings = useMemo(
    () => cleanReadings(readingsQuery.data?.readings ?? [], new Date().toISOString()),
    [readingsQuery.data?.readings],
  );
  const duplicateMeta = useMemo(() => detectDuplicateReadings(readingsQuery.data?.readings ?? []), [readingsQuery.data?.readings]);
  const qcFlags = useMemo(() => physicalRangeFlags(cleanedReadings, metric as AnalyticsMetricName), [cleanedReadings, metric]);

  return {
    aggregates: aggregateQuery.data?.points?.map((point) => ({ ...point })) ?? [],
    qcFlags,
    duplicateMeta,
    cleanedReadings,
    isLoading: readingsQuery.isLoading || aggregateQuery.isLoading,
    isError: readingsQuery.isError || aggregateQuery.isError,
    error: readingsQuery.error ?? aggregateQuery.error,
  };
}

export function useAnalyticsSnapshot({ node_id, metric, from, to, bucket }: UseAnalyticsSnapshotParams) {
  const analytics = useAnalytics({ node_id, metric, from, to, bucket });

  const snapshot = useMemo<AnalyticsSnapshot>(() => {
    const nowIso = new Date().toISOString();
    const missingCount = analytics.aggregates.reduce((sum, point) => sum + (point.missing_count ?? 0), 0);
    const duplicateCount = analytics.duplicateMeta.reduce((sum, item) => sum + item.count, 0) - analytics.duplicateMeta.length;
    const conflictCount = analytics.duplicateMeta.filter((item) => item.conflict).length;
    const validCount = analytics.cleanedReadings.filter((reading) => reading[metric as AnalyticsMetricName] != null).length;
    const cursor = getSensorCursorFromReadings(analytics.cleanedReadings);

    const quality = {
      processed_count: analytics.cleanedReadings.length,
      valid_count: validCount,
      missing_count: missingCount,
      duplicate_count: Math.max(0, duplicateCount),
      conflict_count: conflictCount,
      qc_flag_count: analytics.qcFlags.length,
      reliability_score: undefined,
    };

    const identity: SnapshotIdentity = {
      domain: 'sensor_readings',
      node_id,
      metric,
      window_start: from,
      window_end: to,
      bucket: normalizeBucket(bucket),
      analytics_version: '7.x',
      qc_version: '7.x',
      filters_hash: `${node_id}:${metric}:${from}:${to}:${bucket}`,
    };

    return {
      snapshot_id: [identity.domain, identity.node_id ?? 'all', identity.metric ?? 'all', identity.window_start, identity.window_end, identity.bucket, identity.analytics_version, identity.qc_version, identity.calibration_version ?? 'none', identity.filters_hash].join(':'),
      identity,
      cursor,
      payload: {
        aggregates: analytics.aggregates,
        qc_flags: analytics.qcFlags,
        quality,
        cursor,
      },
      quality,
      invalidated: false,
      created_at: nowIso,
      updated_at: nowIso,
    };
  }, [analytics, bucket, from, metric, node_id, to]);

  return {
    snapshot,
    isLoading: analytics.isLoading,
    isError: analytics.isError,
    error: analytics.error,
  };
}
