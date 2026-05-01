import { apiGet } from './client';
import type { NodeHealth, NodesResponse } from '../types/status';

export async function getNodes() {
  const response = await apiGet<NodesResponse | NodeHealth[]>('/api/v1/nodes');
  return Array.isArray(response) ? { nodes: response } : response;
}

