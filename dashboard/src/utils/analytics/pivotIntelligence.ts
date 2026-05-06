import type { PivotIntelligence } from '../../types/agronomicIntelligence';
import type { SensorReading } from '../../types/readings';
import type { NodeId } from '../../types/common';

const RECENCY_TOLERANCE_MINUTES = 90;
const DRYING_LOOKBACK_HOURS = 24;

export function buildPivotIntelligence(inputs: { readings: SensorReading[]; pivots: NodeId[]; reliabilityByPivot?: Partial<Record<NodeId, number | null>> }): PivotIntelligence {
  const limitations: string[] = [];
  const mainId = inputs.pivots[0];
  const n2Id = inputs.pivots[1];

  const latestByPivot = inputs.pivots.map((node_id) => {
    const sorted = inputs.readings.filter((r) => r.node_id === node_id).sort((a, b) => Date.parse(b.measured_at) - Date.parse(a.measured_at));
    const latest = sorted[0];
    return { node_id, latest_moisture_percent: latest?.soil_moisture_percent ?? null, latest_ec_us_cm: latest?.soil_ec_us_cm ?? null, latest_measured_at: latest?.measured_at ?? null };
  });

  const main = latestByPivot.find((p) => p.node_id === mainId);
  const n2 = latestByPivot.find((p) => p.node_id === n2Id);

  const aligned = main?.latest_measured_at && n2?.latest_measured_at
    ? Math.abs(Date.parse(main.latest_measured_at) - Date.parse(n2.latest_measured_at)) <= RECENCY_TOLERANCE_MINUTES * 60000
    : false;
  if (!aligned) limitations.push('MAIN and N2 latest readings are not aligned within recency tolerance.');

  const moistDiff = aligned && typeof main?.latest_moisture_percent === 'number' && typeof n2?.latest_moisture_percent === 'number'
    ? main.latest_moisture_percent - n2.latest_moisture_percent : null;

  const pivotDryingRate = (nodeId: NodeId): number | null => {
    const sorted = inputs.readings.filter((r) => r.node_id === nodeId && typeof r.soil_moisture_percent === 'number').sort((a, b) => Date.parse(a.measured_at) - Date.parse(b.measured_at));
    const end = sorted[sorted.length - 1];
    if (!end) return null;
    const startCutoff = Date.parse(end.measured_at) - DRYING_LOOKBACK_HOURS * 3600000;
    const window = sorted.filter((r) => Date.parse(r.measured_at) >= startCutoff);
    if (window.length < 2) return null;
    const first = window[0].soil_moisture_percent as number;
    const last = window[window.length - 1].soil_moisture_percent as number;
    return (last - first) * (24 / DRYING_LOOKBACK_HOURS);
  };

  const mainRate = pivotDryingRate(mainId);
  const n2Rate = pivotDryingRate(n2Id);
  const dryingDiff = mainRate != null && n2Rate != null ? mainRate - n2Rate : null;

  const ecDiv = typeof main?.latest_ec_us_cm === 'number' && typeof n2?.latest_ec_us_cm === 'number'
    ? main.latest_ec_us_cm > n2.latest_ec_us_cm ? 'higher_main' : main.latest_ec_us_cm < n2.latest_ec_us_cm ? 'higher_n2' : 'similar_or_unknown'
    : 'similar_or_unknown';

  const mainRel = inputs.reliabilityByPivot?.[mainId] ?? null;
  const n2Rel = inputs.reliabilityByPivot?.[n2Id] ?? null;
  if (mainRel == null || n2Rel == null) limitations.push('One pivot reliability score is missing; whole-field confidence is constrained.');
  const lowRel = [mainRel, n2Rel].some((score) => score == null || score < 0.6);
  const score = lowRel ? 0.45 : Math.min(mainRel ?? 0.7, n2Rel ?? 0.7);

  return { compared_pivots: latestByPivot, drying_rate_difference_percent_per_day: dryingDiff, moisture_divergence_percent: moistDiff, ec_divergence_relative: ecDiv, confidence: { score, level: score >= 0.75 ? 'high' : score >= 0.6 ? 'medium' : 'low' }, limitations };
}
