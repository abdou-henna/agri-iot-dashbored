import { apiDelete, apiGet, apiPatch, apiPost } from './client';
import type {
  AgronomicEvent,
  AgronomicEventsResponse,
  AgronomicFilters,
  CreateAgronomicEventInput,
  IrrigationEndInput,
  IrrigationStartInput,
  UpdateAgronomicEventInput,
  CuttingDetails,
  FertilizationDetails,
  SeasonDetails,
  YieldDetails,
} from '../types/agronomy';
import type { TargetScope } from '../types/common';

export function getAgronomicEvents(filters: AgronomicFilters = {}) {
  return apiGet<AgronomicEventsResponse>('/api/v1/agronomic-events', filters as Record<string, unknown>);
}

export function createAgronomicEvent(input: CreateAgronomicEventInput) {
  return apiPost<AgronomicEvent>('/api/v1/agronomic-events', input);
}

export function updateAgronomicEvent(id: string, input: UpdateAgronomicEventInput) {
  return apiPatch<AgronomicEvent>(`/api/v1/agronomic-events/${id}`, input);
}

export function deleteAgronomicEvent(id: string) {
  return apiDelete<{ success?: boolean }>(`/api/v1/agronomic-events/${id}`);
}

export function startIrrigation(input: IrrigationStartInput) {
  return apiPost<AgronomicEvent>('/api/v1/agronomic-events/irrigation/start', input);
}

export function endIrrigation(agroEventId: string, input: IrrigationEndInput) {
  return apiPost<AgronomicEvent>(`/api/v1/agronomic-events/irrigation/${agroEventId}/end`, input);
}

export function getAgronomicAggregate(filters: { target_scope?: TargetScope; from?: string; to?: string; bucket?: 'day' | 'hour' }) {
  return apiGet<{ points: Array<{ bucket_start: string; irrigation_minutes_total: number }> }>('/api/v1/agronomic-events/aggregate', filters as Record<string, unknown>);
}

// TODO (Phase 5.1):
// Align backend enum from 'season_setup' to 'season'
// to remove mapping layer and enforce canonical agronomic model consistency.
export function createSeasonStart(input: { target_scope: TargetScope; started_at: string; confidence: 'exact' | 'estimated'; notes?: string | null; details?: SeasonDetails }) {
  return createAgronomicEvent({ event_category: 'season_setup', event_type: 'season_start', ...input, ended_at: null });
}
export function createSeasonEnd(input: { target_scope: TargetScope; started_at: string; ended_at: string; confidence: 'exact' | 'estimated'; notes?: string | null; details?: SeasonDetails }) {
  return createAgronomicEvent({ event_category: 'season_setup', event_type: 'season_end', ...input });
}
export function createCuttingEvent(input: { target_scope: TargetScope; started_at: string; confidence: 'exact' | 'estimated'; notes?: string | null; details?: CuttingDetails }) {
  return createAgronomicEvent({ event_category: 'cutting', event_type: 'cutting_event', ...input, ended_at: null });
}
export function createYieldRecord(input: { target_scope: TargetScope; started_at: string; confidence: 'exact' | 'estimated'; notes?: string | null; details: YieldDetails }) {
  // TODO (Phase 5.1):
  // Ensure yield_record always persists a reference to cutting_event
  // (e.g. details.cutting_id) to maintain agronomic traceability.
  return createAgronomicEvent({ event_category: 'yield', event_type: 'yield_record', ...input, ended_at: null });
}
export function createFertilizationEvent(input: { target_scope: TargetScope; started_at: string; confidence: 'exact' | 'estimated'; notes?: string | null; details: FertilizationDetails }) {
  return createAgronomicEvent({ event_category: 'fertilization', event_type: 'fertilization_event', ...input, ended_at: null });
}
export function createFieldNote(input: { target_scope: TargetScope; started_at: string; confidence: 'exact' | 'estimated'; notes: string; details?: Record<string, unknown> }) {
  return createAgronomicEvent({ event_category: 'field_note', event_type: 'field_note', ...input, ended_at: null });
}
