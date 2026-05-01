export type UploadStatus = 'received' | 'processing' | 'completed' | 'failed';

export interface UploadRecord {
  upload_id: string;
  gateway_id: string;
  started_at: string;
  finished_at: string | null;
  received_at: string;
  source: string;
  records_count: number;
  events_count: number;
  status: UploadStatus;
  notes: string | null;
  raw_summary: {
    readings_count?: number;
    events_count?: number;
    [key: string]: unknown;
  } | null;
}

export interface UploadsResponse {
  uploads: UploadRecord[];
  count?: number;
}

export interface UploadsFilters {
  gateway_id?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}

