import { apiGet } from './client';
import type { UploadRecord, UploadsFilters, UploadsResponse } from '../types/uploads';

export async function getUploads(filters: UploadsFilters = {}) {
  const response = await apiGet<UploadsResponse | UploadRecord[]>('/api/v1/uploads', { ...filters });
  return Array.isArray(response) ? { uploads: response, count: response.length } : response;
}
