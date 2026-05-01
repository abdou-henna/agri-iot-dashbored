import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createAgronomicEvent, getAgronomicEvents } from '../api/agronomic.api';
import type { AgronomicFilters, AgronomicType } from '../types/agronomic';

export function useAgronomicEvents(filters: AgronomicFilters = {}) {
  return useQuery({
    queryKey: ['agronomicEvents', filters],
    queryFn: () => getAgronomicEvents(filters),
    staleTime: 15_000,
  });
}

export function useCreateAgronomicEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { node_id?: 'MAIN' | 'N2' | 'N3'; type: AgronomicType; value?: number; unit?: string; metadata?: Record<string, unknown> }) =>
      createAgronomicEvent(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agronomicEvents'] });
      queryClient.invalidateQueries({ queryKey: ['agronomicAggregate'] });
    },
  });
}

