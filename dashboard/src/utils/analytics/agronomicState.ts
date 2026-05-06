import type { FarmStateSummary } from '../../types/agronomicIntelligence';
import type { AgronomicEvent } from '../../types/agronomy';
import type { SensorReading } from '../../types/readings';
import type { ReliabilityScore } from '../../types/analytics';

export function buildFarmStateSummary(inputs: { readings: SensorReading[]; events: AgronomicEvent[]; reliability?: ReliabilityScore | null }): FarmStateSummary {
  const limitations: string[] = [];
  const latestReading = [...inputs.readings].sort((a, b) => +new Date(b.measured_at) - +new Date(a.measured_at))[0];
  const freshnessMinutes = latestReading ? Math.max(0, Math.round((Date.now() - +new Date(latestReading.measured_at)) / 60000)) : null;
  if (freshnessMinutes == null) limitations.push('No sensor readings available to evaluate freshness.');

  const seasonActive = inputs.events.some((e) => e.event_type === 'season_start') && !inputs.events.some((e) => e.event_type === 'season_end');
  const irrigation = inputs.events.filter((e) => e.event_category === 'irrigation').sort((a, b) => +new Date(b.started_at) - +new Date(a.started_at))[0];
  const cutting = inputs.events.filter((e) => e.event_category === 'cutting').sort((a, b) => +new Date(b.started_at) - +new Date(a.started_at))[0];
  const fertCount = inputs.events.filter((e) => e.event_category === 'fertilization' && Date.now() - +new Date(e.started_at) <= 30 * 86400000).length;
  const reliability = inputs.reliability;
  const score = reliability?.score ?? null;
  const level = reliability?.level === 'invalid' ? 'unknown' : (reliability?.level ?? 'unknown');

  return {
    data_freshness_minutes: freshnessMinutes,
    overall_reliability: { score, level },
    season_context: seasonActive ? 'active' : 'unknown',
    last_irrigation_at: irrigation?.started_at ?? null,
    last_cutting_at: cutting?.started_at ?? null,
    recent_fertilization_count_30d: fertCount,
    pivot_state_comparison: 'See pivot intelligence for relative trend comparison.',
    confidence: { score, level },
    limitations,
  };
}
