import { useQuery } from '@tanstack/react-query';
import { getStatus } from '../api/status.api';

export function useStatus() {
  return useQuery({
    queryKey: ['status'],
    queryFn: getStatus,
    staleTime: 30_000,
  });
}

