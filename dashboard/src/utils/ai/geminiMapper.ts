import type { AnalyticsSnapshot } from '../../types/analytics';
import type { GeminiAnalysisType, GeminiInsightInput, GeminiReportContext, GeminiTelemetryCoverage } from '../../types/gemini';
import { GEMINI_FORBIDDEN_CLAIMS } from '../../config/geminiPrompts';
import { evaluateGeminiReliabilityGate, MIN_USABLE_READINGS_FOR_DEMO } from './geminiReliabilityGate';

import type { AgronomicIntelligenceOutput } from '../../types/agronomicIntelligence';

interface BuildGeminiInsightOptions {
  analysis_type?: GeminiAnalysisType;
  timezone?: string;
  crop?: 'alfalfa';
  season_status?: 'active' | 'inactive' | 'unknown';
  days_since_last_cut?: number | null;
  calibration_present?: boolean;
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

function buildReportContext(snapshot: AnalyticsSnapshot, reportMode: GeminiReportContext['report_mode']): GeminiReportContext {
  const validCount = snapshot.quality.valid_count ?? 0;
  const processedCount = snapshot.quality.processed_count ?? 0;
  const expectedCount = snapshot.quality.expected_count ?? null;
  const missingCount = snapshot.quality.missing_count ?? 0;
  const validRatio = typeof expectedCount === 'number' && expectedCount > 0
    ? validCount / expectedCount
    : null;

  const isDemo = reportMode === 'small_dataset_demo';

  let telemetryCoverage: GeminiTelemetryCoverage | undefined;
  if (snapshot.quality.coverage_basis) {
    telemetryCoverage = {
      coverage_start: snapshot.quality.telemetry_coverage_start,
      coverage_end: snapshot.quality.telemetry_coverage_end,
      selected_window_start: snapshot.quality.selected_window_start ?? snapshot.identity.window_start,
      selected_window_end: snapshot.quality.selected_window_end ?? snapshot.identity.window_end,
      coverage_basis: snapshot.quality.coverage_basis,
      expected_count: snapshot.quality.expected_count ?? 0,
      valid_count: validCount,
      missing_count: missingCount,
      missing_rate: snapshot.quality.missing_rate ?? 0,
      excluded_pre_telemetry_minutes: snapshot.quality.excluded_pre_telemetry_minutes ?? 0,
    };
  }

  return {
    report_mode: reportMode,
    purpose: isDemo
      ? 'Exploratory interpretation from a small dataset. Suitable for thesis and demo contexts. Not for final agronomic decisions.'
      : 'Standard agronomic interpretation of a quality-controlled sensor snapshot.',
    sample_size: {
      processed_count: processedCount,
      valid_count: validCount,
      expected_count: expectedCount,
      missing_count: missingCount,
      valid_ratio: validRatio,
    },
    small_dataset_threshold: MIN_USABLE_READINGS_FOR_DEMO,
    generation_policy: isDemo
      ? 'Generate a structured agronomic report from available deterministic summaries. State sample-size limits explicitly. Separate confirmed evidence from hypothesis. Recommend field checks.'
      : 'Generate a full structured agronomic report from the deterministic snapshot summaries.',
    interpretation_style: isDemo
      ? 'exploratory_with_caveats'
      : 'standard_agronomic',
    telemetry_coverage: telemetryCoverage,
  };
}

export function buildGeminiInsightInput(snapshot: AnalyticsSnapshot, options: BuildGeminiInsightOptions = {}): GeminiInsightInput {
  const gate = evaluateGeminiReliabilityGate(snapshot);
  const reliabilityLevel = snapshot.quality.reliability_level ?? 'invalid';
  // Use telemetry-window-based missing rate when available; fall back to ratio from quality counts.
  const missingPct = snapshot.quality.missing_rate
    ?? (snapshot.quality.expected_count
      ? snapshot.quality.missing_count / Math.max(1, snapshot.quality.expected_count)
      : 0);

  const limitations = new Set<string>(gate.limitations);
  if (reliabilityLevel === 'invalid') limitations.add('No reliable conclusion can be drawn.');
  if (reliabilityLevel === 'low') limitations.add('Snapshot reliability is low; interpretation confidence must remain limited.');
  if ((snapshot.quality.excluded_pre_telemetry_minutes ?? 0) > 0) {
    limitations.add('The selected window starts before telemetry coverage; pre-telemetry time is excluded from missing-rate calculation.');
  }
  if (missingPct >= 0.2) {
    limitations.add(`Within the telemetry coverage window, missing telemetry is approximately ${Math.round(missingPct * 100)}%. Interpretation quality is limited.`);
  }
  if (options.calibration_present === false) limitations.add('No calibration metadata; water-stress threshold claims are forbidden.');

  const features = (snapshot.payload.features ?? {}) as Record<string, unknown>;
  const hasEcSignal = JSON.stringify(features).includes('ec');
  if (hasEcSignal) limitations.add('Raw EC is not ECe.');

  const weatherObj = (features.weather ?? {}) as Record<string, unknown>;
  if (!('wind' in weatherObj) || !('solar' in weatherObj)) limitations.add('ET is not computed.');

  return {
    schema_version: '1.0',
    analysis_type: options.analysis_type ?? 'weekly_summary',
    time_window: {
      from: snapshot.identity.window_start,
      to: snapshot.identity.window_end,
      timezone: options.timezone ?? 'UTC',
    },
    crop_context: {
      crop: options.crop ?? 'alfalfa',
      season_status: options.season_status ?? 'unknown',
      days_since_last_cut: options.days_since_last_cut ?? null,
      known_limitations: [...limitations],
    },
    soil_water: (features.soil_water ?? {}) as Record<string, unknown>,
    irrigation: (features.irrigation ?? {}) as Record<string, unknown>,
    weather: weatherObj,
    ec_trend: (features.ec_trend ?? {}) as Record<string, unknown>,
    agronomic_context: (features.agronomic_context ?? {}) as Record<string, unknown>,
    reliability: {
      overall_confidence: reliabilityLevel,
      score: snapshot.quality.reliability_score ?? null,
      reasons: snapshot.payload.reliability?.reasons ?? [],
      limitations: [...limitations],
    },
    alerts: (snapshot.payload.alerts ?? []).map((alert) => ({ ...alert })) as Array<Record<string, unknown>>,
    report_context: buildReportContext(snapshot, gate.report_mode),
    agronomic_intelligence: options.agronomicIntelligence ? {
      farm_state: options.agronomicIntelligence.farm_state as unknown as Record<string, unknown>,
      irrigation_reasoning: options.agronomicIntelligence.irrigation_reasoning as unknown as Record<string, unknown>,
      pivot_intelligence: options.agronomicIntelligence.pivot_intelligence as unknown as Record<string, unknown>,
      cutting_regrowth_context: options.agronomicIntelligence.cutting_regrowth_context as unknown as Record<string, unknown>,
      fertilization_context: options.agronomicIntelligence.fertilization_context as unknown as Record<string, unknown>,
      predictive_risk_context: options.agronomicIntelligence.predictive_risk_context as unknown as Record<string, unknown>,
      reliability: options.agronomicIntelligence.reliability as unknown as Record<string, unknown>,
      deterministic_alerts: options.agronomicIntelligence.deterministic_alerts.map((item) => ({ ...item })) as Array<Record<string, unknown>>,
      limitations: [...options.agronomicIntelligence.limitations],
      forbidden_claims: [...options.agronomicIntelligence.forbidden_claims],
      manual_context_summary: options.agronomicIntelligence.manual_context_summary as unknown as Record<string, unknown> | undefined,
      report_window_context: {
        selected_window: options.selectedWindow ?? 'unknown',
        is_full_dataset: options.isFullDataset ?? false,
        intelligence_from: options.intelligenceFrom ?? snapshot.identity.window_start,
        intelligence_to: options.intelligenceTo ?? snapshot.identity.window_end,
        sensor_snapshot_from: options.snapshotFrom ?? snapshot.identity.window_start,
        sensor_snapshot_to: options.snapshotTo ?? snapshot.identity.window_end,
        snapshot_charts_capped: options.isFullDataset
          ? (options.snapshotFrom !== options.intelligenceFrom || options.snapshotTo !== options.intelligenceTo)
          : false,
        total_readings_available: options.totalReadingsAvailable ?? null,
        readings_limit_used: options.readingsLimitUsed ?? null,
      },
    } : undefined,
    forbidden_claims: GEMINI_FORBIDDEN_CLAIMS,
  };
}
