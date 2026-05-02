import { useQuery } from '@tanstack/react-query';
import { getAgronomicEvents } from '../api/agronomy.api';
import type { AgronomicFilters } from '../types/agronomy';

export function useAgronomicEvents(filters: AgronomicFilters = {}) {
  return useQuery({
    queryKey: ['agronomicEvents', filters],
    queryFn: () => getAgronomicEvents(filters),
    staleTime: 15_000,
  });
}

