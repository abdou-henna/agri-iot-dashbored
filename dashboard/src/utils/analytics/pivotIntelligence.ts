import type { PivotIntelligence } from '../../types/agronomicIntelligence';
import type { SensorReading } from '../../types/readings';
import type { NodeId } from '../../types/common';

export function buildPivotIntelligence(inputs: { readings: SensorReading[]; pivots: NodeId[]; reliabilityScore: number | null }): PivotIntelligence {
  const limitations: string[] = [];
  const latestByPivot = inputs.pivots.map((node_id) => {
    const latest = inputs.readings.filter((r) => r.node_id === node_id).sort((a, b) => +new Date(b.measured_at) - +new Date(a.measured_at))[0];
    return { node_id, latest_moisture_percent: latest?.soil_moisture_percent ?? null, latest_ec_us_cm: latest?.soil_ec_us_cm ?? null };
  });
  const [main, n2] = latestByPivot;
  const moistDiff = typeof main?.latest_moisture_percent === 'number' && typeof n2?.latest_moisture_percent === 'number' ? main.latest_moisture_percent - n2.latest_moisture_percent : null;
  const ecDiv = typeof main?.latest_ec_us_cm === 'number' && typeof n2?.latest_ec_us_cm === 'number' ? (main.latest_ec_us_cm > n2.latest_ec_us_cm ? 'higher_main' : main.latest_ec_us_cm < n2.latest_ec_us_cm ? 'higher_n2' : 'similar_or_unknown') : 'similar_or_unknown';
  if (moistDiff == null) limitations.push('Moisture divergence unavailable due to missing latest pivot values.');
  return { compared_pivots: latestByPivot, drying_rate_difference_percent_per_day: null, moisture_divergence_percent: moistDiff, ec_divergence_relative: ecDiv, confidence: { score: inputs.reliabilityScore, level: inputs.reliabilityScore != null && inputs.reliabilityScore >= 0.75 ? 'high' : 'medium' }, limitations };
}
