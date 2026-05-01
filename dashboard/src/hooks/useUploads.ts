import { useQuery } from '@tanstack/react-query';
import { getUploads } from '../api/uploads.api';
import type { UploadsFilters } from '../types/uploads';

export function useUploads(filters: UploadsFilters = {}) {
  return useQuery({
    queryKey: ['uploads', filters],
    queryFn: () => getUploads(filters),
    staleTime: 60_000,
  });
}

