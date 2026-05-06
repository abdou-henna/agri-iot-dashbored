import type { AnalyticsSnapshot } from '../../types/analytics';
import type { GeminiAnalysisType, GeminiInsightInput, GeminiMultiSnapshotInsightInput, GeminiSnapshotSummary } from '../../types/gemini';
import { GEMINI_FORBIDDEN_CLAIMS } from '../../config/geminiPrompts';
import { buildGeminiInsightInput } from './geminiMapper';
import type { AgronomicIntelligenceOutput } from '../../types/agronomicIntelligence';

interface BuildMultiSnapshotParams {
  analysisType: GeminiAnalysisType;
  timezone: string;
  snapshots: Array<{ scopeLabel: string; snapshot: AnalyticsSnapshot | null }>;
  agronomicIntelligence?: AgronomicIntelligenceOutput | null;
}

function toSummary(scopeLabel: string, snapshot: AnalyticsSnapshot, timezone: string, agronomicIntelligence: AgronomicIntelligenceOutput | null): GeminiSnapshotSummary {
  const single = buildGeminiInsightInput(snapshot, { analysis_type: 'weekly_summary', timezone, agronomicIntelligence });
  return {
    scope_label: scopeLabel,
    node_id: snapshot.identity.node_id ?? 'unknown',
    metric: snapshot.identity.metric ?? 'unknown',
    time_window: single.time_window,
    quality: snapshot.quality as unknown as Record<string, unknown>,
    reliability: single.reliability,
    alerts: single.alerts,
    processed_features: {
      soil_water: single.soil_water,
      irrigation: single.irrigation,
      weather: single.weather,
      ec_trend: single.ec_trend,
      agronomic_context: single.agronomic_context,
    },
    limitations: single.crop_context.known_limitations,
  };
}

export function buildGeminiMultiSnapshotInsightInput({ analysisType, timezone, snapshots, agronomicIntelligence }: BuildMultiSnapshotParams): GeminiInsightInput | GeminiMultiSnapshotInsightInput | null {
  const valid = snapshots.filter((entry): entry is { scopeLabel: string; snapshot: AnalyticsSnapshot } => Boolean(entry.snapshot));
  if (!valid.length) return null;

  if (analysisType !== 'pivot_comparison' && analysisType !== 'farm_summary' && valid[0]?.snapshot) {
    return buildGeminiInsightInput(valid[0].snapshot, { analysis_type: analysisType, timezone, agronomicIntelligence });
  }

  const first = valid[0].snapshot;
  const last = valid[valid.length - 1].snapshot;

  const crossSnapshotLimitations = [
    'Pivot comparison is based on MAIN and N2 soil moisture processed snapshots.',
    'Weather context included only if N3 snapshot is present.',
    'AI must not compute new trusted metrics.',
    'AI must not override deterministic alerts.',
    ...snapshots.filter((s) => !s.snapshot).map((s) => `${s.scopeLabel} snapshot is unavailable and must be treated as a limitation.`),
  ];

  return {
    schema_version: '1.0',
    analysis_type: analysisType,
    context_mode: analysisType === 'pivot_comparison' ? 'pivot_comparison' : 'farm_summary',
    time_window: {
      from: first.identity.window_start,
      to: last.identity.window_end,
      timezone,
    },
    crop_context: {
      crop: 'alfalfa',
      season_status: 'unknown',
      days_since_last_cut: null,
      known_limitations: crossSnapshotLimitations,
    },
    snapshots: valid.map((entry) => toSummary(entry.scopeLabel, entry.snapshot, timezone, agronomicIntelligence ?? null)),
    cross_snapshot_limitations: crossSnapshotLimitations,
    reliability: {
      snapshot_count: valid.length,
      nodes: valid.map((entry) => ({
        node_id: entry.snapshot.identity.node_id,
        reliability_level: entry.snapshot.quality.reliability_level ?? 'invalid',
        reliability_score: entry.snapshot.quality.reliability_score ?? null,
      })),
    },
    agronomic_intelligence: agronomicIntelligence ? {
      farm_state: agronomicIntelligence.farm_state as unknown as Record<string, unknown>,
      irrigation_reasoning: agronomicIntelligence.irrigation_reasoning as unknown as Record<string, unknown>,
      pivot_intelligence: agronomicIntelligence.pivot_intelligence as unknown as Record<string, unknown>,
      cutting_regrowth_context: agronomicIntelligence.cutting_regrowth_context as unknown as Record<string, unknown>,
      fertilization_context: agronomicIntelligence.fertilization_context as unknown as Record<string, unknown>,
      predictive_risk_context: agronomicIntelligence.predictive_risk_context as unknown as Record<string, unknown>,
      reliability: agronomicIntelligence.reliability as unknown as Record<string, unknown>,
      deterministic_alerts: agronomicIntelligence.deterministic_alerts.map((item) => ({ ...item })) as Array<Record<string, unknown>>,
      limitations: [...agronomicIntelligence.limitations],
      forbidden_claims: [...agronomicIntelligence.forbidden_claims],
    } : undefined,
    forbidden_claims: GEMINI_FORBIDDEN_CLAIMS,
  };
}
