import { useQuery } from '@tanstack/react-query';
import { getEventsAggregate } from '../api/events.api';
import type { EventsFilters } from '../types/events';

export function useEventsAggregate(filters: Omit<EventsFilters, 'limit' | 'offset'> & { bucket?: 'day' | 'hour'; group_by?: 'severity' | 'event_type' } = {}) {
  return useQuery({
    queryKey: ['eventsAggregate', filters],
    queryFn: () => getEventsAggregate(filters),
    staleTime: 30_000,
  });
}

