import type { NodeId } from './common';

export type ConfidenceLevel = 'high' | 'medium' | 'low' | 'unknown';

export interface ConfidenceSummary {
  score: number | null;
  level: ConfidenceLevel;
}

export interface FarmStateSummary {
  data_freshness_minutes: number | null;
  overall_reliability: ConfidenceSummary;
  season_context: 'active' | 'unknown';
  last_irrigation_at: string | null;
  last_cutting_at: string | null;
  recent_fertilization_count_30d: number;
  pivot_state_comparison: string;
  confidence: ConfidenceSummary;
  limitations: string[];
}

export interface IrrigationResponseReasoning {
  event_window: { started_at: string | null; ended_at: string | null };
  moisture_delta_by_pivot: Array<{ node_id: NodeId; pre_moisture_percent: number | null; post_moisture_percent: number | null; delta_percent: number | null }>;
  response_lag_minutes: number | null;
  response_flag: 'positive_response' | 'weak_or_no_response' | 'insufficient_data';
  confidence: ConfidenceSummary;
  limitations: string[];
}

export interface CuttingRegrowthReasoning {
  days_since_last_cutting: number | null;
  post_cut_moisture_trend: 'rising' | 'stable' | 'declining' | 'unknown';
  heat_context_after_cutting: 'elevated' | 'moderate_or_low' | 'unknown';
  regrowth_context_label: 'favorable_signal' | 'mixed_signal' | 'watch_conditions' | 'unknown';
  confidence: ConfidenceSummary;
  limitations: string[];
}

export interface FertilizationContext {
  recent_fertilization_events: Array<{ started_at: string; target_scope: string; note: string | null }>;
  ec_relative_trend_context: 'increasing' | 'stable_or_mixed' | 'decreasing' | 'unknown';
  moisture_context_near_fertilization: 'wetter' | 'drier_or_mixed' | 'unknown';
  confidence: ConfidenceSummary;
  limitations: string[];
}

export interface PivotIntelligence {
  compared_pivots: Array<{ node_id: NodeId; latest_moisture_percent: number | null; latest_ec_us_cm: number | null }>;
  drying_rate_difference_percent_per_day: number | null;
  moisture_divergence_percent: number | null;
  ec_divergence_relative: 'higher_main' | 'higher_n2' | 'similar_or_unknown';
  confidence: ConfidenceSummary;
  limitations: string[];
}

export interface AgronomicIntelligenceOutput {
  farm_state: FarmStateSummary;
  irrigation_reasoning: IrrigationResponseReasoning;
  cutting_regrowth_context: CuttingRegrowthReasoning;
  fertilization_context: FertilizationContext;
  pivot_intelligence: PivotIntelligence;
  predictive_risk_context: { status: 'deferred'; limitations: string[] };
  reliability: ConfidenceSummary;
  deterministic_alerts: Array<{ title: string; severity: string; confidence: string; limitations: string[] }>;
  forbidden_claims: string[];
  limitations: string[];
}
