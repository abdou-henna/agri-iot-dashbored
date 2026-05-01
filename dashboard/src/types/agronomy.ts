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

