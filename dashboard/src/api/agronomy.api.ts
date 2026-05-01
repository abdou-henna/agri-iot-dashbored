import { apiGet, apiPatch, apiPost } from './client';
import type { AgronomicEvent } from '../types/agronomic';

export interface AgronomicEventsResponse {
  events: AgronomicEvent[];
  count?: number;
}

export function getAgronomicEvents(params: Record<string, unknown> = {}) {
  return apiGet<AgronomicEventsResponse>('/api/v1/agronomic-events', params);
}

export function createAgronomicEvent(body: unknown) {
  return apiPost<AgronomicEvent>('/api/v1/agronomic-events', body);
}

export function updateAgronomicEvent(id: string, body: unknown) {
  return apiPatch<AgronomicEvent>(`/api/v1/agronomic-events/${id}`, body);
}
