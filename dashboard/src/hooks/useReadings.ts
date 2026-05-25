import { useQuery } from '@tanstack/react-query';
import { getReadings, getReadingsBounds } from '../api/readings.api';
import type { ReadingsFilters } from '../types/readings';

export function useReadings(filters: ReadingsFilters = {}) {
  return useQuery({
    queryKey: ['readings', filters],
    queryFn: () => getReadings(filters),
    staleTime: 30_000,
  });
}

export function useReadingsBounds() {
  return useQuery({
    queryKey: ['readings', 'bounds'],
    queryFn: () => getReadingsBounds(),
    staleTime: 60_000,
  });
}

