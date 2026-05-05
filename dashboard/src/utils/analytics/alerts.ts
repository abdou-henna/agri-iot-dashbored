import type { AlertEvaluation, ReliabilityScore } from '../../types/analytics';

function mkAlert(input: Omit<AlertEvaluation, 'alert_id'>): AlertEvaluation {
  return { ...input, alert_id: `${input.alert_type}-${Date.parse(input.triggered_at)}` };
}

export function evaluateUnreliableData(reliability: ReliabilityScore, triggeredAt: string): AlertEvaluation | null {
  if (reliability.score >= 0.6) return null;
  return mkAlert({
    alert_type: 'unreliable_data',
    domain: 'operational',
    severity: reliability.score < 0.3 ? 'error' : 'warning',
    confidence: 'high',
    title: 'Low data reliability',
    message: 'Node reliability is low; agronomic interpretation should be cautious.',
    triggered_at: triggeredAt,
    evidence: { score: reliability.score, reasons: reliability.reasons },
    limitations: [],
  });
}

export function evaluateMissingNode(lastSeenAt: string | null, nowIso: string, thresholdMinutes = 20): AlertEvaluation | null {
  if (!lastSeenAt) return null;
  const gapMinutes = (Date.parse(nowIso) - Date.parse(lastSeenAt)) / 60000;
  if (gapMinutes <= thresholdMinutes) return null;
  return mkAlert({
    alert_type: 'missing_node', domain: 'operational', severity: gapMinutes > 360 ? 'critical' : gapMinutes > 60 ? 'error' : 'warning', confidence: 'high',
    title: 'Node not reporting', message: 'Node has not reported recent data.', triggered_at: nowIso, evidence: { lastSeenAt, gapMinutes }, limitations: [],
  });
}

export function evaluateStaleMeasurement(latestMeasuredAt: string | null, nowIso: string, staleHours = 24): AlertEvaluation | null {
  if (!latestMeasuredAt) return null;
  const ageHours = (Date.parse(nowIso) - Date.parse(latestMeasuredAt)) / 3600000;
  if (ageHours <= staleHours) return null;
  return mkAlert({ alert_type: 'stale_measurement', domain: 'operational', severity: 'warning', confidence: 'high', title: 'Stale measurement', message: 'Latest measurement is stale.', triggered_at: nowIso, evidence: { latestMeasuredAt, ageHours }, limitations: [] });
}

export function evaluateDryingTrend(dropRate: number | null, baselineDropRate: number | null, triggeredAt: string, factor = 1.5): AlertEvaluation | null {
  if (dropRate == null || baselineDropRate == null) return null;

  const currentDryingMagnitude = Math.abs(Math.min(0, dropRate));
  const baselineDryingMagnitude = Math.abs(Math.min(0, baselineDropRate));

  if (currentDryingMagnitude <= 0 || baselineDryingMagnitude <= 0) return null;
  if (currentDryingMagnitude <= baselineDryingMagnitude * factor) return null;

  return mkAlert({
    alert_type: 'drying_trend_warning',
    domain: 'agronomic',
    severity: 'info',
    confidence: 'medium',
    title: 'Drying trend increased',
    message: 'Moisture is drying faster than recent baseline (trend-only warning).',
    triggered_at: triggeredAt,
    evidence: { dropRate, baselineDropRate, factor, currentDryingMagnitude, baselineDryingMagnitude },
    limitations: ['Not a calibrated water-stress diagnosis.'],
  });
}

export function evaluatePoorIrrigationResponse(delta: number | null, lagMinutes: number | null, triggeredAt: string): AlertEvaluation | null {
  if (delta == null) return null;
  if (delta > 1 && (lagMinutes == null || lagMinutes <= 360)) return null;
  return mkAlert({ alert_type: 'poor_irrigation_response', domain: 'agronomic', severity: 'warning', confidence: 'medium', title: 'Limited irrigation response', message: 'Sensed moisture response after irrigation appears limited.', triggered_at: triggeredAt, evidence: { delta, lagMinutes }, limitations: ['Possible causes include sensor depth, infiltration depth, or uncertain event timing.'] });
}

export function evaluateEcTrendCaution(relativeTrend: number | null, triggeredAt: string, threshold = 0.15): AlertEvaluation | null {
  if (relativeTrend == null || relativeTrend < threshold) return null;
  return mkAlert({ alert_type: 'ec_trend_caution', domain: 'agronomic', severity: 'info', confidence: 'low', title: 'EC trend increasing', message: 'EC increased relative to baseline; use trend context only.', triggered_at: triggeredAt, evidence: { relativeTrend, threshold }, limitations: ['Raw EC is not ECe and does not define official salinity class.'] });
}
