import { useQuery } from '@tanstack/react-query';
import { getReadings } from '../api/readings.api';
import type { ReadingsFilters } from '../types/readings';

export function useReadings(filters: ReadingsFilters = {}) {
  return useQuery({
    queryKey: ['readings', filters],
    queryFn: () => getReadings(filters),
    staleTime: 30_000,
  });
}

