import { useMutation, useQuery } from '@tanstack/react-query';
import {
  getAnalyticsSnapshot,
  invalidateAnalyticsSnapshot,
  upsertAnalyticsSnapshot,
} from '../api/analyticsSnapshots.api';
import { useAnalyticsSnapshot } from './useAnalyticsSnapshot';
import type { Bucket, MetricKey, NodeId } from '../types/common';

interface UsePersistentAnalyticsSnapshotParams {
  node_id: NodeId;
  metric: MetricKey;
  from: string;
  to: string;
  bucket: Bucket;
}

export function usePersistentAnalyticsSnapshot({ node_id, metric, from, to, bucket }: UsePersistentAnalyticsSnapshotParams) {
  const analyticsSnapshotQuery = useAnalyticsSnapshot({ node_id, metric, from, to, bucket });
  const snapshotId = analyticsSnapshotQuery.snapshot.snapshot_id;

  const persistedSnapshotQuery = useQuery({
    queryKey: ['analyticsSnapshots', snapshotId],
    queryFn: () => getAnalyticsSnapshot(snapshotId),
    enabled: Boolean(snapshotId),
    retry: false,
  });

  const saveMutation = useMutation({
    mutationFn: () => upsertAnalyticsSnapshot(analyticsSnapshotQuery.snapshot),
  });

  const invalidateMutation = useMutation({
    mutationFn: (reason: string) => invalidateAnalyticsSnapshot(snapshotId, reason),
  });

  return {
    currentSnapshot: analyticsSnapshotQuery.snapshot,
    persistedSnapshot: persistedSnapshotQuery.data,
    isLoading: analyticsSnapshotQuery.isLoading || persistedSnapshotQuery.isLoading,
    isError: analyticsSnapshotQuery.isError || (persistedSnapshotQuery.isError && (persistedSnapshotQuery.error as { status?: number } | undefined)?.status !== 404),
    saveSnapshot: saveMutation.mutateAsync,
    invalidateSnapshot: invalidateMutation.mutateAsync,
    saveStatus: saveMutation.status,
    invalidateStatus: invalidateMutation.status,
  };
}
