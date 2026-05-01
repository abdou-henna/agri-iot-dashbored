import { useQuery } from '@tanstack/react-query';
import { getEvents } from '../api/events.api';
import type { EventsFilters } from '../types/events';

export function useEvents(filters: EventsFilters = {}) {
  return useQuery({
    queryKey: ['events', filters],
    queryFn: () => getEvents(filters),
    staleTime: 30_000,
  });
}

