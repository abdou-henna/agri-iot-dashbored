import { useQuery } from '@tanstack/react-query';
import { getAgronomicAggregate } from '../api/agronomy.api';

export function useAgronomicAggregate(filters: { node_id?: 'MAIN' | 'N2' | 'N3'; from?: string; to?: string; bucket?: 'day' | 'hour' }) {
  return useQuery({
    queryKey: ['agronomicAggregate', filters],
    queryFn: () => getAgronomicAggregate(filters),
    staleTime: 15_000,
  });
}
