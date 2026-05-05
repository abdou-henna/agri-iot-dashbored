import { useMemo } from 'react';
import type { Bucket, MetricKey, NodeId } from '../types/common';
import type { AnalyticsMetricName, AnalyticsSnapshot, SnapshotIdentity } from '../types/analytics';
import { useAnalytics } from './useAnalytics';
import { getSensorCursorFromReadings } from '../utils/analytics';

interface UseAnalyticsSnapshotParams {
  node_id: NodeId;
  metric: MetricKey;
  from: string;
  to: string;
  bucket: Bucket;
  effectiveFrom?: string;
}

function normalizeBucket(bucket: Bucket): '10min' | 'hour' | 'day' {
  if (bucket === '10min') return '10min';
  if (bucket === '1hour') return 'hour';
  return 'day';
}

export function useAnalyticsSnapshot({ node_id, metric, from, to, bucket, effectiveFrom }: UseAnalyticsSnapshotParams) {
  const analytics = useAnalytics({ node_id, metric: metric as AnalyticsMetricName, from, to, bucket, effectiveFrom });

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
        features: {
          delta_window: {
            effective_from: analytics.effectiveFrom,
            logical_from: from,
            to,
            used_delta: analytics.effectiveFrom !== from,
          },
        },
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
