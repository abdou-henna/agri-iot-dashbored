export type AgronomicType = 'irrigation_start' | 'irrigation_stop' | 'fertilization' | 'manual_note';

export interface AgronomicEvent {
  id: string;
  node_id: 'MAIN' | 'N2' | 'N3' | null;
  type: AgronomicType;
  value: number | null;
  unit: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  created_by: string | null;
}

export interface AgronomicFilters {
  node_id?: 'MAIN' | 'N2' | 'N3';
  type?: AgronomicType;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}

export interface AgronomicAggregatePoint {
  bucket_start: string;
  irrigation_minutes_total: number;
}

