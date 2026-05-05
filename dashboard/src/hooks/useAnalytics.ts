import { useMemo } from 'react';
import type { Bucket } from '../types/common';
import type { AnalyticsMetricName } from '../types/analytics';
import { useReadingAggregates } from './useReadingAggregates';
import { useReadings } from './useReadings';
import { cleanReadings, detectDuplicateReadings, physicalRangeFlags } from '../utils/analytics';

interface UseAnalyticsParams {
  node_id: 'MAIN' | 'N2' | 'N3';
  metric: AnalyticsMetricName;
  from: string;
  to: string;
  bucket: Bucket;
}

export function useAnalytics({ node_id, metric, from, to, bucket }: UseAnalyticsParams) {
  const readingsQuery = useReadings({ node_id, from, to });
  const aggregateQuery = useReadingAggregates(node_id, metric, { from, to }, bucket);

  const cleanedReadings = useMemo(() => cleanReadings(readingsQuery.data?.readings ?? [], new Date().toISOString()), [readingsQuery.data?.readings]);
  const duplicateMeta = useMemo(() => detectDuplicateReadings(readingsQuery.data?.readings ?? []), [readingsQuery.data?.readings]);
  const qcFlags = useMemo(() => physicalRangeFlags(cleanedReadings, metric), [cleanedReadings, metric]);

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
