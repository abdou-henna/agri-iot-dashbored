import type { AgroCategory, TargetScope, TimeConfidence } from './common';

export interface AgronomicEvent {
  agro_event_id: string;
  gateway_id: string;
  event_category: AgroCategory;
  event_type: string;
  target_scope: TargetScope;
  started_at: string;
  ended_at: string | null;
  confidence: TimeConfidence;
  details: Record<string, unknown>;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface AgronomicEventsResponse {
  events: AgronomicEvent[];
  count: number;
}

export interface AgronomicFilters {
  event_category?: AgroCategory;
  event_type?: string;
  target_scope?: TargetScope;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}

export interface CreateAgronomicEventInput {
  event_category: AgroCategory;
  event_type: string;
  target_scope: TargetScope;
  started_at: string;
  ended_at?: string | null;
  confidence?: TimeConfidence;
  details?: Record<string, unknown>;
  notes?: string | null;
}

export interface UpdateAgronomicEventInput {
  event_type?: string;
  target_scope?: TargetScope;
  started_at?: string;
  ended_at?: string | null;
  confidence?: TimeConfidence;
  details?: Record<string, unknown>;
  notes?: string | null;
}

export interface IrrigationStartInput {
  target_scope?: TargetScope;
  started_at?: string;
  confidence?: TimeConfidence;
  notes?: string | null;
}

export interface IrrigationEndInput {
  ended_at?: string;
  confidence?: TimeConfidence;
  notes?: string | null;
}
