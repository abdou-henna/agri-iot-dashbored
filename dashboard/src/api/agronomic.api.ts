import { apiGet, apiPost } from './client';
import type { AgronomicAggregatePoint, AgronomicEvent, AgronomicFilters, AgronomicType } from '../types/agronomic';

export function getAgronomicEvents(filters: AgronomicFilters = {}) {
  return apiGet<{ events: AgronomicEvent[]; count: number }>('/api/v1/agronomic-events', filters as Record<string, unknown>);
}

export function createAgronomicEvent(payload: {
  node_id?: 'MAIN' | 'N2' | 'N3';
  type: AgronomicType;
  value?: number;
  unit?: string;
  metadata?: Record<string, unknown>;
}) {
  return apiPost<AgronomicEvent>('/api/v1/agronomic-events', payload);
}

export function getAgronomicAggregate(filters: { node_id?: 'MAIN' | 'N2' | 'N3'; from?: string; to?: string; bucket?: 'day' | 'hour' }) {
  return apiGet<{ points: AgronomicAggregatePoint[] }>('/api/v1/agronomic-events/aggregate', filters);
}
