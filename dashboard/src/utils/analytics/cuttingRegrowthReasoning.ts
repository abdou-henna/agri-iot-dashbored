import type { CuttingRegrowthReasoning } from '../../types/agronomicIntelligence';
import type { AgronomicEvent } from '../../types/agronomy';
import type { SensorReading } from '../../types/readings';

export function buildCuttingRegrowthReasoning(inputs: { readings: SensorReading[]; events: AgronomicEvent[] }): CuttingRegrowthReasoning {
  const limitations: string[] = [];
  const cut = inputs.events.filter((e) => e.event_category === 'cutting').sort((a, b) => +new Date(b.started_at) - +new Date(a.started_at))[0];
  if (!cut) return { days_since_last_cutting: null, post_cut_moisture_trend: 'unknown', heat_context_after_cutting: 'unknown', regrowth_context_label: 'unknown', confidence: { score: null, level: 'low' }, limitations: ['No cutting event available.'] };
  const days = Math.floor((Date.now() - +new Date(cut.started_at)) / 86400000);
  const afterReadings = inputs.readings.filter((r) => +new Date(r.measured_at) >= +new Date(cut.started_at));
  const moistures = afterReadings.map((r) => r.soil_moisture_percent).filter((v): v is number => typeof v === 'number');
  const temps = afterReadings.map((r) => r.air_temperature_c).filter((v): v is number => typeof v === 'number');
  const trend = moistures.length < 2 ? 'unknown' : moistures[moistures.length - 1] > moistures[0] ? 'rising' : moistures[moistures.length - 1] < moistures[0] ? 'declining' : 'stable';
  const heat = temps.length === 0 ? 'unknown' : (temps.reduce((a, b) => a + b, 0) / temps.length) > 30 ? 'elevated' : 'moderate_or_low';
  if (moistures.length < 2) limitations.push('Insufficient post-cut moisture samples for robust trend inference.');
  const label = trend === 'rising' && heat !== 'elevated' ? 'favorable_signal' : trend === 'declining' && heat === 'elevated' ? 'watch_conditions' : 'mixed_signal';
  return { days_since_last_cutting: days, post_cut_moisture_trend: trend, heat_context_after_cutting: heat, regrowth_context_label: label, confidence: { score: moistures.length < 2 ? 0.4 : 0.7, level: moistures.length < 2 ? 'low' : 'medium' }, limitations };
}
