import { apiDelete, apiGet, apiPatch, apiPost } from './client';
import type {
  AgronomicEvent,
  AgronomicEventsResponse,
  AgronomicFilters,
  CreateAgronomicEventInput,
  IrrigationEndInput,
  IrrigationStartInput,
  UpdateAgronomicEventInput,
} from '../types/agronomy';
import type { TargetScope } from '../types/common';

export function getAgronomicEvents(filters: AgronomicFilters = {}) {
  return apiGet<AgronomicEventsResponse>('/api/v1/agronomic-events', filters as Record<string, unknown>);
}

export function createAgronomicEvent(input: CreateAgronomicEventInput) {
  return apiPost<AgronomicEvent>('/api/v1/agronomic-events', input);
}

export function updateAgronomicEvent(id: string, input: UpdateAgronomicEventInput) {
  return apiPatch<AgronomicEvent>(`/api/v1/agronomic-events/${id}`, input);
}

export function deleteAgronomicEvent(id: string) {
  return apiDelete<{ success?: boolean }>(`/api/v1/agronomic-events/${id}`);
}

export function startIrrigation(input: IrrigationStartInput) {
  return apiPost<AgronomicEvent>('/api/v1/agronomic-events/irrigation/start', input);
}

export function endIrrigation(agroEventId: string, input: IrrigationEndInput) {
  return apiPost<AgronomicEvent>(`/api/v1/agronomic-events/irrigation/${agroEventId}/end`, input);
}

export function getAgronomicAggregate(filters: { target_scope?: TargetScope; from?: string; to?: string; bucket?: 'day' | 'hour' }) {
  return apiGet<{ points: Array<{ bucket_start: string; irrigation_minutes_total: number }> }>('/api/v1/agronomic-events/aggregate', filters as Record<string, unknown>);
}
