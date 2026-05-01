import { useQuery } from '@tanstack/react-query';
import { getReadingAggregate } from '../api/readings.api';
import type { Bucket, DateRange, MetricKey, NodeId } from '../types/common';

export function selectBucket(range: DateRange): Bucket {
  const diffHours = (new Date(range.to).getTime() - new Date(range.from).getTime()) / 3_600_000;
  if (diffHours <= 24) return '10min';
  if (diffHours <= 24 * 7) return '1hour';
  return '1day';
}

export function useReadingAggregates(nodeId: NodeId, metric: MetricKey, range: DateRange, bucket = selectBucket(range)) {
  return useQuery({
    queryKey: ['readingsAggregate', nodeId, metric, range, bucket],
    queryFn: () => getReadingAggregate(nodeId, metric, range, bucket),
    staleTime: 300_000,
  });
}

