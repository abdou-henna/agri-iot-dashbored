import { apiGet } from './client';
import type { EventsAggregateResponse, EventsFilters, EventsResponse, SystemEvent } from '../types/events';

export async function getEvents(filters: EventsFilters = {}) {
  const params = {
    ...filters,
    severity: Array.isArray(filters.severity) ? filters.severity.join(',') : filters.severity,
  };
  const response = await apiGet<EventsResponse | SystemEvent[]>('/api/v1/events', params);
  return Array.isArray(response) ? { events: response, count: response.length } : response;
}

export function getEventsAggregate(filters: Omit<EventsFilters, 'limit' | 'offset'> & { bucket?: 'day' | 'hour'; group_by?: 'severity' | 'event_type' } = {}) {
  return apiGet<EventsAggregateResponse>('/api/v1/events/aggregate', filters);
}
