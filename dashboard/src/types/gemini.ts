export type GeminiAnalysisType = 'weekly_summary' | 'event_analysis' | 'alert_explanation' | 'pivot_comparison' | 'farm_summary';

export type GeminiConfidence = 'high' | 'medium' | 'low';

export type GeminiReportMode = 'standard' | 'small_dataset_demo';

export type GeminiForbiddenClaim =
  | 'Do not diagnose disease.'
  | 'Do not infer NPK or pH.'
  | 'Do not convert raw EC to ECe.'
  | 'Do not compute ET.'
  | 'Do not give exact irrigation amount.'
  | 'Do not claim yield prediction from sensors alone.'
  | 'Do not make calibrated water-stress threshold claims without calibration metadata.';

export interface GeminiRiskOutput {
  title: string;
  severity: 'info' | 'warning' | 'error';
  confidence: GeminiConfidence;
  explanation: string;
  limitations: string[];
}

export interface GeminiPivotObservation {
  pivot: string;
  observation: string;
  evidence: string[];
  confidence: GeminiConfidence;
  limitation: string;
}

export interface GeminiActionPlanItem {
  title: string;
  priority: 'high' | 'medium' | 'low';
  type: 'field_check' | 'sensor_check' | 'data_quality' | 'irrigation_review' | 'monitoring';
  rationale: string;
  confidence: GeminiConfidence;
}

export interface GeminiInsightOutput {
  summary: string;
  confidence: GeminiConfidence;
  key_observations: Array<{
    title: string;
    description: string;
    confidence: GeminiConfidence;
    evidence: string[];
    limitations: string[];
  }>;
  risks: GeminiRiskOutput[];
  hypotheses: string[];
  recommended_checks: string[];
  not_claimed: string[];
  // Enriched report fields (optional — safe fallback if absent)
  report_mode?: GeminiReportMode;
  executive_summary?: string;
  farm_state?: string;
  pivot_observations?: GeminiPivotObservation[];
  weather_context?: string;
  irrigation_context?: string;
  data_quality_interpretation?: {
    usable_for: string[];
    not_usable_for: string[];
  };
  plant_health_caution?: {
    not_diagnosed: string[];
  };
  why_this_matters?: string;
  action_plan?: GeminiActionPlanItem[];
  limitations?: string[];
}

export interface GeminiTelemetryCoverage {
  coverage_start?: string;
  coverage_end?: string;
  selected_window_start: string;
  selected_window_end: string;
  coverage_basis: 'telemetry_window' | 'selected_window' | 'no_telemetry';
  expected_count: number;
  valid_count: number;
  missing_count: number;
  missing_rate: number;
  excluded_pre_telemetry_minutes: number;
  /** Human-readable form of excluded_pre_telemetry_minutes, e.g. "28 days 17 hours". */
  excluded_pre_telemetry_human?: string;
  /** Human-readable duration of the current reporting gap (time since last reading), e.g. "3 hours 20 minutes". Only present when gap > 2 hours. */
  current_reporting_gap_human?: string;
}

export interface GeminiReportContext {
  report_mode: GeminiReportMode;
  purpose: string;
  sample_size: {
    processed_count: number;
    valid_count: number;
    expected_count: number | null;
    missing_count: number;
    valid_ratio: number | null;
  };
  small_dataset_threshold: number;
  generation_policy: string;
  interpretation_style: string;
  telemetry_coverage?: GeminiTelemetryCoverage;
}

export interface GeminiMultiSnapshotReportContext extends GeminiReportContext {
  usable_snapshot_count: number;
  snapshot_usability: Array<{
    scope_label: string;
    valid_count: number;
    usable: boolean;
  }>;
  comparison_completeness: 'full' | 'partial' | 'single_only';
}

export interface GeminiInsightInput {
  schema_version: '1.0';
  analysis_type: GeminiAnalysisType;
  time_window: {
    from: string;
    to: string;
    timezone: string;
  };
  crop_context: {
    crop: 'alfalfa';
    season_status: 'active' | 'inactive' | 'unknown';
    days_since_last_cut: number | null;
    known_limitations: string[];
  };
  soil_water: Record<string, unknown>;
  irrigation: Record<string, unknown>;
  weather: Record<string, unknown>;
  ec_trend: Record<string, unknown>;
  agronomic_context: Record<string, unknown>;
  reliability: Record<string, unknown>;
  alerts: Array<Record<string, unknown>>;
  report_context: GeminiReportContext;
  agronomic_intelligence?: {
    farm_state: Record<string, unknown>;
    irrigation_reasoning: Record<string, unknown>;
    pivot_intelligence: Record<string, unknown>;
    cutting_regrowth_context: Record<string, unknown>;
    fertilization_context: Record<string, unknown>;
    predictive_risk_context: Record<string, unknown>;
    reliability: Record<string, unknown>;
    deterministic_alerts: Array<Record<string, unknown>>;
    limitations: string[];
    forbidden_claims: string[];
    manual_context_summary?: Record<string, unknown>;
    report_window_context?: Record<string, unknown>;
  };
  forbidden_claims: GeminiForbiddenClaim[];
}



export interface GeminiSnapshotSummary {
  scope_label: string;
  node_id: string;
  metric: string;
  time_window: {
    from: string;
    to: string;
    timezone: string;
  };
  quality: Record<string, unknown>;
  reliability: Record<string, unknown>;
  alerts: Array<Record<string, unknown>>;
  processed_features: Record<string, unknown>;
  limitations: string[];
}

export interface GeminiMultiSnapshotInsightInput {
  schema_version: '1.0';
  analysis_type: GeminiAnalysisType;
  context_mode: 'single_snapshot' | 'pivot_comparison' | 'farm_summary';
  time_window: {
    from: string;
    to: string;
    timezone: string;
  };
  crop_context: GeminiInsightInput['crop_context'];
  snapshots: GeminiSnapshotSummary[];
  cross_snapshot_limitations: string[];
  reliability: Record<string, unknown>;
  report_context: GeminiMultiSnapshotReportContext;
  forbidden_claims: GeminiForbiddenClaim[];
  agronomic_intelligence?: GeminiInsightInput['agronomic_intelligence'];
}

export interface GeminiInsightRequestState {
  insight: GeminiInsightOutput | null;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
}
