import { useMemo } from 'react';
import type { Bucket, MetricKey, NodeId } from '../types/common';
import type { AnalyticsSnapshot, SnapshotBucket, SnapshotIdentity } from '../types/analytics';
import { useReadingAggregates } from './useReadingAggregates';
import { useReadings } from './useReadings';
import { buildSnapshotId, getSensorCursorFromReadings } from '../utils/analytics';

interface UseAnalyticsSnapshotParams {
  node_id: NodeId;
  metric: MetricKey;
  from: string;
  to: string;
  bucket: Bucket;
}

function normalizeBucket(bucket: Bucket): SnapshotBucket {
  if (bucket === '10min') return '10min';
  if (bucket === '1hour') return 'hour';
  return 'day';
}

export function useAnalyticsSnapshot({ node_id, metric, from, to, bucket }: UseAnalyticsSnapshotParams) {
  const readingsQuery = useReadings({ node_id, from, to });
  const aggregateQuery = useReadingAggregates(node_id, metric, { from, to }, bucket);

  const snapshot = useMemo<AnalyticsSnapshot>(() => {
    const nowIso = new Date().toISOString();
    const readings = (readingsQuery.data?.readings ?? []).map((item) => ({ ...item }));
    const sortedReadings = [...readings].sort((a, b) => Date.parse(a.measured_at) - Date.parse(b.measured_at) || a.record_id.localeCompare(b.record_id));
    const seen = new Set<string>();
    const uniqueCount = sortedReadings.filter((item) => {
      const key = `${item.measured_at}|${item.record_id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).length;

    const qcFlags: never[] = [];
    const aggregates = aggregateQuery.data?.points ?? [];
    const cursor = getSensorCursorFromReadings(sortedReadings);
    const quality = {
      processed_count: sortedReadings.length,
      valid_count: uniqueCount,
      missing_count: Math.max(0, sortedReadings.length - uniqueCount),
      duplicate_count: Math.max(0, sortedReadings.length - uniqueCount),
      conflict_count: 0,
      qc_flag_count: qcFlags.length,
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
      snapshot_id: buildSnapshotId(identity),
      identity,
      cursor,
      payload: {
        aggregates: aggregates.map((point) => ({ ...point })),
        qc_flags: qcFlags,
        quality,
        cursor,
      },
      quality,
      invalidated: false,
      created_at: nowIso,
      updated_at: nowIso,
    };
  }, [aggregateQuery.data?.points, bucket, from, metric, node_id, readingsQuery.data?.readings, to]);

  return {
    snapshot,
    isLoading: readingsQuery.isLoading || aggregateQuery.isLoading,
    isError: readingsQuery.isError || aggregateQuery.isError,
    error: readingsQuery.error ?? aggregateQuery.error,
  };
}
