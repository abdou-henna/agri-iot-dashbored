import type { FertilizationContext } from '../../types/agronomicIntelligence';
import type { AgronomicEvent } from '../../types/agronomy';
import type { SensorReading } from '../../types/readings';

export function buildFertilizationContext(inputs: { readings: SensorReading[]; events: AgronomicEvent[] }): FertilizationContext {
  const limitations: string[] = ['No nutrient sufficiency claims are made from EC or moisture trends.'];
  const fert = inputs.events.filter((e) => e.event_category === 'fertilization').sort((a, b) => +new Date(b.started_at) - +new Date(a.started_at)).slice(0, 5);
  const ecVals = inputs.readings.map((r) => r.soil_ec_us_cm).filter((v): v is number => typeof v === 'number');
  const moistureVals = inputs.readings.map((r) => r.soil_moisture_percent).filter((v): v is number => typeof v === 'number');
  const ecTrend = ecVals.length < 2 ? 'unknown' : ecVals[ecVals.length - 1] > ecVals[0] ? 'increasing' : ecVals[ecVals.length - 1] < ecVals[0] ? 'decreasing' : 'stable_or_mixed';
  const moistCtx = moistureVals.length < 2 ? 'unknown' : moistureVals[moistureVals.length - 1] > moistureVals[0] ? 'wetter' : 'drier_or_mixed';
  return { recent_fertilization_events: fert.map((e) => ({ started_at: e.started_at, target_scope: e.target_scope, note: e.notes })), ec_relative_trend_context: ecTrend, moisture_context_near_fertilization: moistCtx, confidence: { score: fert.length ? 0.6 : 0.4, level: fert.length ? 'medium' : 'low' }, limitations };
}
