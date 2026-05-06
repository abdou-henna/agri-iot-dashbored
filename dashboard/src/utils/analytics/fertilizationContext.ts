import type { FertilizationContext } from '../../types/agronomicIntelligence';
import type { AgronomicEvent } from '../../types/agronomy';
import type { SensorReading } from '../../types/readings';

const median = (values: number[]): number | null => {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
};

export function buildFertilizationContext(inputs: { readings: SensorReading[]; events: AgronomicEvent[] }): FertilizationContext {
  const limitations: string[] = ['No nutrient sufficiency claims are made from EC or moisture trends.'];
  const fert = inputs.events.filter((e) => e.event_category === 'fertilization').sort((a, b) => Date.parse(b.started_at) - Date.parse(a.started_at)).slice(0, 5);

  let ecTrend: FertilizationContext['ec_relative_trend_context'] = 'unknown';
  let moistCtx: FertilizationContext['moisture_context_near_fertilization'] = 'unknown';
  const eventSummaries = fert.map((e) => {
    const start = Date.parse(e.started_at);
    const beforeStart = start - 48 * 3600000;
    const afterEnd = start + 7 * 24 * 3600000;
    const before = inputs.readings.filter((r) => Date.parse(r.measured_at) >= beforeStart && Date.parse(r.measured_at) <= start);
    const after = inputs.readings.filter((r) => Date.parse(r.measured_at) >= start && Date.parse(r.measured_at) <= afterEnd);
    const ecBefore = median(before.map((r) => r.soil_ec_us_cm).filter((v): v is number => typeof v === 'number'));
    const ecAfter = median(after.map((r) => r.soil_ec_us_cm).filter((v): v is number => typeof v === 'number'));
    const moistureBefore = median(before.map((r) => r.soil_moisture_percent).filter((v): v is number => typeof v === 'number'));
    const moistureAfter = median(after.map((r) => r.soil_moisture_percent).filter((v): v is number => typeof v === 'number'));
    return {
      started_at: e.started_at,
      target_scope: e.target_scope,
      note: e.notes,
      ec_before_median: ecBefore,
      ec_after_median: ecAfter,
      moisture_before_median: moistureBefore,
      moisture_after_median: moistureAfter,
      ec_before_count: before.filter((r) => typeof r.soil_ec_us_cm === 'number').length,
      ec_after_count: after.filter((r) => typeof r.soil_ec_us_cm === 'number').length,
      moisture_before_count: before.filter((r) => typeof r.soil_moisture_percent === 'number').length,
      moisture_after_count: after.filter((r) => typeof r.soil_moisture_percent === 'number').length,
    };
  });

  const latest = eventSummaries[0];
  if (latest) {
    if (latest.ec_before_median != null && latest.ec_after_median != null) {
      ecTrend = latest.ec_after_median > latest.ec_before_median ? 'increasing' : latest.ec_after_median < latest.ec_before_median ? 'decreasing' : 'stable_or_mixed';
    }
    if (latest.moisture_before_median != null && latest.moisture_after_median != null) {
      moistCtx = latest.moisture_after_median > latest.moisture_before_median ? 'wetter' : 'drier_or_mixed';
    }
    if (latest.ec_before_count < 2 || latest.ec_after_count < 2 || latest.moisture_before_count < 2 || latest.moisture_after_count < 2) limitations.push('Fertilization window sample coverage is limited; trend context has reduced certainty.');
  }

  if (!latest) limitations.push('No fertilization events available for event-window trend context.');
  return { recent_fertilization_events: eventSummaries, ec_relative_trend_context: ecTrend, moisture_context_near_fertilization: moistCtx, confidence: { score: latest ? 0.6 : 0.4, level: latest ? 'medium' : 'low' }, limitations };
}
