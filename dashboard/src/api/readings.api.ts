import { apiGet } from './client';
import type { Bucket, DateRange, MetricKey, NodeId } from '../types/common';
import type {
  ReadingAggregateResponse,
  ReadingsFilters,
  ReadingsResponse,
  SensorReading,
} from '../types/readings';

export async function getReadings(filters: ReadingsFilters = {}) {
  const response = await apiGet<ReadingsResponse | SensorReading[]>('/api/v1/readings', { ...filters });
  return Array.isArray(response) ? { readings: response, count: response.length } : response;
}

export function getReadingAggregate(nodeId: NodeId, metric: MetricKey, range: DateRange, bucket: Bucket) {
  return apiGet<ReadingAggregateResponse>('/api/v1/readings/aggregate', {
    node_id: nodeId,
    metric,
    from: range.from,
    to: range.to,
    bucket,
  });
}

export function getReadingByRecordId(recordId: string) {
  return apiGet<SensorReading & { raw_payload?: Record<string, unknown> | null }>(`/api/v1/readings/${recordId}`);
}
