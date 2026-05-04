import type { AgroCategory, TargetScope, TimeConfidence } from './common';
export type AgronomicCategory = AgroCategory | 'season';
export type AgronomicEventType =
  | 'season_start'
  | 'season_end'
  | 'cutting_event'
  | 'yield_record'
  | 'fertilization_event'
  | 'field_note'
  | 'irrigation_session'
  | 'manual_note';

export interface SeasonDetails extends Record<string, unknown> {
  season_name?: string;
}
export interface CuttingDetails extends Record<string, unknown> {
  cutting_number?: number;
}
export interface YieldDetails extends Record<string, unknown> {
  cutting_event_id: string;
  yield_amount: number;
  yield_unit: string;
}
export interface FertilizationDetails extends Record<string, unknown> {
  fertilizer_name?: string;
  fertilizer_type?: string;
  amount?: number;
  unit?: string;
}

export interface AgronomicEvent {
  agro_event_id: string;
  gateway_id: string;
  event_category: AgronomicCategory;
  event_type: AgronomicEventType | string;
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
  event_category: AgronomicCategory;
  event_type: AgronomicEventType | string;
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
