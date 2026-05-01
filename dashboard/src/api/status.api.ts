import { apiGet } from './client';
import type { StatusResponse } from '../types/status';

export function getStatus() {
  return apiGet<StatusResponse>('/api/v1/status');
}

