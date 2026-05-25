import type { AnalyticsSnapshot } from '../../types/analytics';
import type { GeminiAnalysisType, GeminiInsightInput, GeminiMultiSnapshotInsightInput, GeminiMultiSnapshotReportContext, GeminiSnapshotSummary, GeminiTelemetryCoverage } from '../../types/gemini';
import { GEMINI_FORBIDDEN_CLAIMS } from '../../config/geminiPrompts';
import { buildGeminiInsightInput, minutesToHuman } from './geminiMapper';
import { evaluateGeminiMultiSnapshotReliabilityGate, MIN_USABLE_READINGS_FOR_DEMO } from './geminiReliabilityGate';
import type { AgronomicIntelligenceOutput } from '../../types/agronomicIntelligence';

interface BuildMultiSnapshotParams {
  analysisType: GeminiAnalysisType;
  timezone: string;
  snapshots: Array<{ scopeLabel: string; snapshot: AnalyticsSnapshot | null }>;
  agronomicIntelligence?: AgronomicIntelligenceOutput | null;
  selectedWindow?: string;
  isFullDataset?: boolean;
  intelligenceFrom?: string;
  intelligenceTo?: string;
  snapshotFrom?: string;
  snapshotTo?: string;
  totalReadingsAvailable?: number;
  readingsLimitUsed?: number;
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

function buildMultiSnapshotReportContext(
  snapshotEntries: Array<{ scopeLabel: string; snapshot: AnalyticsSnapshot | null }>,
  reportMode: GeminiMultiSnapshotReportContext['report_mode'],
  validCount: number,
  processedCount: number,
): GeminiMultiSnapshotReportContext {
  const usability = snapshotEntries.map((entry) => ({
    scope_label: entry.scopeLabel,
    valid_count: entry.snapshot?.quality.valid_count ?? 0,
    usable: (entry.snapshot?.quality.valid_count ?? 0) >= MIN_USABLE_READINGS_FOR_DEMO,
  }));

  const usableCount = usability.filter((u) => u.usable).length;
  const totalCount = snapshotEntries.length;

  const completeness: GeminiMultiSnapshotReportContext['comparison_completeness'] =
    usableCount === 0 ? 'single_only'
    : usableCount < totalCount ? 'partial'
    : 'full';

  const isDemo = reportMode === 'small_dataset_demo';

  // Build combined telemetry coverage across all valid snapshots
  const validSnaps = snapshotEntries.filter((e): e is { scopeLabel: string; snapshot: AnalyticsSnapshot } => Boolean(e.snapshot));
  let telemetryCoverage: GeminiTelemetryCoverage | undefined;
  if (validSnaps.length > 0) {
    const coverageStarts = validSnaps
      .map((e) => e.snapshot.quality.telemetry_coverage_start)
      .filter((s): s is string => s !== undefined);
    const coverageEnds = validSnaps
      .map((e) => e.snapshot.quality.telemetry_coverage_end)
      .filter((s): s is string => s !== undefined);
    const firstSnap = validSnaps[0].snapshot;
    const totalExpected = validSnaps.reduce((sum, e) => sum + (e.snapshot.quality.expected_count ?? 0), 0);
    const totalValid = validSnaps.reduce((sum, e) => sum + (e.snapshot.quality.valid_count ?? 0), 0);
    const totalMissing = validSnaps.reduce((sum, e) => sum + (e.snapshot.quality.missing_count ?? 0), 0);
    const maxExcluded = validSnaps.reduce((max, e) => Math.max(max, e.snapshot.quality.excluded_pre_telemetry_minutes ?? 0), 0);
    const hasTelemetryWindow = validSnaps.some((e) => e.snapshot.quality.coverage_basis === 'telemetry_window');

    if (firstSnap.quality.coverage_basis) {
      telemetryCoverage = {
        coverage_start: coverageStarts.length > 0 ? [...coverageStarts].sort()[0] : undefined,
        coverage_end: coverageEnds.length > 0 ? [...coverageEnds].sort().reverse()[0] : undefined,
        selected_window_start: firstSnap.quality.selected_window_start ?? firstSnap.identity.window_start,
        selected_window_end: firstSnap.quality.selected_window_end ?? firstSnap.identity.window_end,
        coverage_basis: hasTelemetryWindow ? 'telemetry_window' : 'selected_window',
        expected_count: totalExpected,
        valid_count: totalValid,
        missing_count: totalMissing,
        missing_rate: totalExpected > 0 ? totalMissing / totalExpected : 0,
        excluded_pre_telemetry_minutes: maxExcluded,
        excluded_pre_telemetry_human: maxExcluded > 0 ? minutesToHuman(maxExcluded) : undefined,
      };
    }
  }

  return {
    report_mode: reportMode,
    purpose: isDemo
      ? 'Exploratory multi-snapshot interpretation from small or partial datasets. Suitable for thesis/demo. Not for final agronomic decisions.'
      : 'Standard multi-snapshot agronomic interpretation from quality-controlled summaries.',
    sample_size: {
      processed_count: processedCount,
      valid_count: validCount,
      expected_count: null,
      missing_count: 0,
      valid_ratio: null,
    },
    small_dataset_threshold: MIN_USABLE_READINGS_FOR_DEMO,
    generation_policy: isDemo
      ? 'Generate a structured agronomic report from available snapshots. State which snapshots are usable. Separate confirmed evidence from hypothesis. Recommend field checks.'
      : 'Generate a full structured agronomic comparison report from all deterministic snapshot summaries.',
    interpretation_style: isDemo ? 'exploratory_with_caveats' : 'standard_agronomic',
    usable_snapshot_count: usableCount,
    snapshot_usability: usability,
    comparison_completeness: completeness,
    telemetry_coverage: telemetryCoverage,
  };
}

export function buildGeminiMultiSnapshotInsightInput({ analysisType, timezone, snapshots, agronomicIntelligence, selectedWindow, isFullDataset, intelligenceFrom, intelligenceTo, snapshotFrom, snapshotTo, totalReadingsAvailable, readingsLimitUsed }: BuildMultiSnapshotParams): GeminiInsightInput | GeminiMultiSnapshotInsightInput | null {
  const valid = snapshots.filter((entry): entry is { scopeLabel: string; snapshot: AnalyticsSnapshot } => Boolean(entry.snapshot));
  if (!valid.length) return null;

  const gate = evaluateGeminiMultiSnapshotReliabilityGate(snapshots.map((e) => e.snapshot));

  if (analysisType !== 'pivot_comparison' && analysisType !== 'farm_summary' && valid[0]?.snapshot) {
    return buildGeminiInsightInput(valid[0].snapshot, { analysis_type: analysisType, timezone, agronomicIntelligence, selectedWindow, isFullDataset, intelligenceFrom, intelligenceTo, snapshotFrom, snapshotTo, totalReadingsAvailable, readingsLimitUsed });
  }

  const first = valid[0].snapshot;
  const last = valid[valid.length - 1].snapshot;

  const crossSnapshotLimitations = [
    'Pivot comparison is based on MAIN and N2 soil moisture processed snapshots.',
    'Weather context included only if N3 snapshot is present.',
    'AI must not compute new trusted metrics.',
    'AI must not override deterministic alerts.',
    ...snapshots.filter((s) => !s.snapshot).map((s) => `${s.scopeLabel} snapshot is unavailable and must be treated as a limitation.`),
    ...valid
      .filter((e) => (e.snapshot.quality.excluded_pre_telemetry_minutes ?? 0) > 0)
      .map((e) => `${e.scopeLabel}: selected window starts before telemetry coverage; pre-telemetry time is excluded from missing-rate calculation.`),
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
        valid_count: entry.snapshot.quality.valid_count ?? 0,
      })),
    },
    report_context: buildMultiSnapshotReportContext(snapshots, gate.report_mode, gate.valid_count, gate.processed_count),
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
      manual_context_summary: agronomicIntelligence.manual_context_summary as unknown as Record<string, unknown> | undefined,
      report_window_context: {
        selected_window: selectedWindow ?? 'unknown',
        is_full_dataset: isFullDataset ?? false,
        intelligence_from: intelligenceFrom ?? (valid[0]?.snapshot.identity.window_start ?? 'unknown'),
        intelligence_to: intelligenceTo ?? (valid[valid.length - 1]?.snapshot.identity.window_end ?? 'unknown'),
        sensor_snapshot_from: snapshotFrom ?? (valid[0]?.snapshot.identity.window_start ?? 'unknown'),
        sensor_snapshot_to: snapshotTo ?? (valid[valid.length - 1]?.snapshot.identity.window_end ?? 'unknown'),
        snapshot_charts_capped: isFullDataset
          ? (snapshotFrom !== intelligenceFrom || snapshotTo !== intelligenceTo)
          : false,
        total_readings_available: totalReadingsAvailable ?? null,
        readings_limit_used: readingsLimitUsed ?? null,
      },
    } : undefined,
    forbidden_claims: GEMINI_FORBIDDEN_CLAIMS,
  };
}
