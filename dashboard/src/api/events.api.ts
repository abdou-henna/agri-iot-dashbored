import { apiGet } from './client';
import type { EventsAggregateResponse, EventsFilters, EventsResponse, SystemEvent } from '../types/events';

export async function getEvents(filters: EventsFilters = {}) {
  const severityParam = Array.isArray(filters.severity) ? filters.severity.join(',') : filters.severity;
  const params = {
    ...filters,
    severity: severityParam || undefined,
  };
  const response = await apiGet<EventsResponse | SystemEvent[]>('/api/v1/events', params);
  return Array.isArray(response) ? { events: response, count: response.length } : response;
}

export function getEventsAggregate(filters: Omit<EventsFilters, 'limit' | 'offset'> & { bucket?: 'day' | 'hour'; group_by?: 'severity' | 'event_type' } = {}) {
  const severityParam = Array.isArray(filters.severity) ? filters.severity.join(',') : filters.severity;
  return apiGet<EventsAggregateResponse>('/api/v1/events/aggregate', { ...filters, severity: severityParam || undefined });
}
