export type GeminiAnalysisType = 'weekly_summary' | 'event_analysis' | 'alert_explanation' | 'pivot_comparison' | 'farm_summary';

export type GeminiConfidence = 'high' | 'medium' | 'low';

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
  agronomic_intelligence?: {
    farm_state: Record<string, unknown>;
    irrigation_reasoning: Record<string, unknown>;
    pivot_intelligence: Record<string, unknown>;
    cutting_regrowth_context: Record<string, unknown>;
    fertilization_context: Record<string, unknown>;
    predictive_risk_context: Record<string, unknown>;
    reliability: Record<string, unknown>;
    deterministic_alerts: Array<Record<string, unknown>>;
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
  forbidden_claims: GeminiForbiddenClaim[];
}
export interface GeminiInsightRequestState {
  insight: GeminiInsightOutput | null;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
}
