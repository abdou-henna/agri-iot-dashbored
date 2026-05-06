import type { CuttingRegrowthReasoning } from '../../types/agronomicIntelligence';
import type { AgronomicEvent } from '../../types/agronomy';
import type { SensorReading } from '../../types/readings';

const median = (values: number[]): number | null => {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
};

export function buildCuttingRegrowthReasoning(inputs: { readings: SensorReading[]; events: AgronomicEvent[]; reference_time?: string | null }): CuttingRegrowthReasoning {
  const limitations: string[] = [];
  const cut = inputs.events.filter((e) => e.event_category === 'cutting').sort((a, b) => Date.parse(b.started_at) - Date.parse(a.started_at))[0];
  if (!cut) return { days_since_last_cutting: null, post_cut_moisture_trend: 'unknown', heat_context_after_cutting: 'unknown', regrowth_context_label: 'unknown', confidence: { score: null, level: 'low' }, limitations: ['No cutting event available.'] };

  const ref = inputs.reference_time ?? inputs.readings.sort((a, b) => Date.parse(b.measured_at) - Date.parse(a.measured_at))[0]?.measured_at ?? null;
  const days = ref ? Math.floor((Date.parse(ref) - Date.parse(cut.started_at)) / 86400000) : null;
  if (!ref) limitations.push('Reference time missing; days since cutting is unavailable.');

  const cutMs = Date.parse(cut.started_at);
  const post7d = inputs.readings.filter((r) => Date.parse(r.measured_at) >= cutMs && Date.parse(r.measured_at) <= cutMs + 7 * 86400000);
  const post14d = inputs.readings.filter((r) => Date.parse(r.measured_at) >= cutMs + 7 * 86400000 && Date.parse(r.measured_at) <= cutMs + 14 * 86400000);

  const m7 = median(post7d.map((r) => r.soil_moisture_percent).filter((v): v is number => typeof v === 'number'));
  const m14 = median(post14d.map((r) => r.soil_moisture_percent).filter((v): v is number => typeof v === 'number'));
  const t7 = median(post7d.map((r) => r.air_temperature_c).filter((v): v is number => typeof v === 'number'));

  const trend = m7 == null || m14 == null ? 'unknown' : m14 > m7 ? 'rising' : m14 < m7 ? 'declining' : 'stable';
  const heat = t7 == null ? 'unknown' : t7 > 30 ? 'elevated' : 'moderate_or_low';
  if (post7d.length < 2 || post14d.length < 2) limitations.push('Weak post-cut sample coverage across 0-7d and 7-14d windows.');
  const label = trend === 'rising' && heat !== 'elevated' ? 'favorable_signal' : trend === 'declining' && heat === 'elevated' ? 'watch_conditions' : trend === 'unknown' ? 'unknown' : 'mixed_signal';

  return { days_since_last_cutting: days, post_cut_moisture_trend: trend, heat_context_after_cutting: heat, regrowth_context_label: label, confidence: { score: trend === 'unknown' ? 0.4 : 0.65, level: trend === 'unknown' ? 'low' : 'medium' }, limitations };
}
