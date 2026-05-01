import { useQuery } from '@tanstack/react-query';
import { getNodes } from '../api/nodes.api';

export function useNodes() {
  return useQuery({
    queryKey: ['nodes'],
    queryFn: getNodes,
    staleTime: 60_000,
  });
}

