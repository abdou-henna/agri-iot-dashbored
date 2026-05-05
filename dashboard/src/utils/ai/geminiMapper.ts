import type { AnalyticsSnapshot } from '../../types/analytics';
import type { GeminiAnalysisType, GeminiInsightInput } from '../../types/gemini';
import { GEMINI_FORBIDDEN_CLAIMS } from '../../config/geminiPrompts';
import { evaluateGeminiReliabilityGate } from './geminiReliabilityGate';

interface BuildGeminiInsightOptions {
  analysis_type?: GeminiAnalysisType;
  timezone?: string;
  crop?: 'alfalfa';
  season_status?: 'active' | 'inactive' | 'unknown';
  days_since_last_cut?: number | null;
  calibration_present?: boolean;
}

export function buildGeminiInsightInput(snapshot: AnalyticsSnapshot, options: BuildGeminiInsightOptions = {}): GeminiInsightInput {
  const gate = evaluateGeminiReliabilityGate(snapshot);
  const reliabilityLevel = snapshot.quality.reliability_level ?? 'invalid';
  const missingPct = snapshot.quality.expected_count
    ? snapshot.quality.missing_count / Math.max(1, snapshot.quality.expected_count)
    : 0;

  const limitations = new Set<string>(gate.limitations);
  if (reliabilityLevel === 'invalid') limitations.add('No reliable conclusion can be drawn.');
  if (reliabilityLevel === 'low') limitations.add('Snapshot reliability is low; interpretation confidence must remain limited.');
  if (missingPct >= 0.2) limitations.add(`High missing data (${Math.round(missingPct * 100)}%) limits interpretation quality.`);
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
    forbidden_claims: GEMINI_FORBIDDEN_CLAIMS,
  };
}
