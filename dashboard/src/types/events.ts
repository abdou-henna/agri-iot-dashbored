import type { EventSeverity, NodeId } from './common';

export interface SystemEvent {
  event_id: string;
  upload_id: string | null;
  gateway_id: string;
  node_id: NodeId | null;
  event_type: string;
  severity: EventSeverity;
  event_time: string;
  received_at: string | null;
  message: string | null;
  details: Record<string, unknown> | null;
  error_code: string | null;
}

export interface EventsResponse {
  events: SystemEvent[];
  count?: number;
}

export interface EventsFilters {
  severity?: EventSeverity | EventSeverity[];
  node_id?: NodeId | 'gateway';
  event_type?: string;
  error_code?: string;
  upload_id?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}

