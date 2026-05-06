import type { AgronomicIntelligenceOutput, ConfidenceSummary } from '../../types/agronomicIntelligence';

const conf = (confidence: ConfidenceSummary) => `${confidence.level}${confidence.score == null ? '' : ` (${confidence.score.toFixed(2)})`}`;
const val = (value: number | string | null, suffix = '') => (value == null ? 'Not enough data' : `${value}${suffix}`);

function Limitations({ items }: { items: string[] }) {
  if (!items.length) return <p className="text-xs text-slate-500">Not enough data.</p>;
  return <ul className="list-disc pl-5 text-xs space-y-1 text-slate-600">{items.slice(0, 4).map((item) => <li key={item}>{item}</li>)}</ul>;
}

export function AgronomicIntelligencePanel({ data }: { data: AgronomicIntelligenceOutput }) {
  const firstFert = data.fertilization_context.recent_fertilization_events[0];

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 space-y-4">
      <h2 className="text-base font-semibold">Deterministic Agronomic Intelligence</h2>
      <p className="text-xs text-slate-500">Deterministic section. AI interpretation is separate and does not override deterministic alerts.</p>

      <div className="space-y-3">
        <div className="rounded border p-3"><p className="text-sm font-medium">Farm state</p><p className="text-xs">Season: {data.farm_state.season_context}</p><p className="text-xs">Freshness: {val(data.farm_state.data_freshness_minutes, ' min')}</p><p className="text-xs">Confidence: {conf(data.farm_state.confidence)}</p><Limitations items={data.farm_state.limitations} /></div>
        <div className="rounded border p-3"><p className="text-sm font-medium">Irrigation reasoning</p><p className="text-xs">Response flag: {data.irrigation_reasoning.response_flag}</p><p className="text-xs">Response lag: {val(data.irrigation_reasoning.response_lag_minutes, ' min')}</p><p className="text-xs">Pre/Post sample counts: {data.irrigation_reasoning.moisture_delta_by_pivot.map((p) => `${p.node_id}: ${p.pre_sample_count}/${p.post_sample_count}`).join(' · ') || 'Not enough data'}</p><p className="text-xs">Confidence: {conf(data.irrigation_reasoning.confidence)}</p><Limitations items={data.irrigation_reasoning.limitations} /></div>
        <div className="rounded border p-3"><p className="text-sm font-medium">Pivot intelligence</p><p className="text-xs">Moisture divergence: {val(data.pivot_intelligence.moisture_divergence_percent, '%')}</p><p className="text-xs">Drying-rate differential: {val(data.pivot_intelligence.drying_rate_difference_percent_per_day, '%/day')}</p><p className="text-xs">Confidence: {conf(data.pivot_intelligence.confidence)}</p><Limitations items={data.pivot_intelligence.limitations} /></div>
        <div className="rounded border p-3"><p className="text-sm font-medium">Cutting / regrowth</p><p className="text-xs">Regrowth label: {data.cutting_regrowth_context.regrowth_context_label}</p><p className="text-xs">Days since cutting: {val(data.cutting_regrowth_context.days_since_last_cutting)}</p><p className="text-xs">Confidence: {conf(data.cutting_regrowth_context.confidence)}</p><Limitations items={data.cutting_regrowth_context.limitations} /></div>
        <div className="rounded border p-3"><p className="text-sm font-medium">Fertilization context</p><p className="text-xs">EC trend context: {data.fertilization_context.ec_relative_trend_context}</p><p className="text-xs">Before/after samples (EC): {firstFert ? `${firstFert.ec_before_count}/${firstFert.ec_after_count}` : 'Not enough data'}</p><p className="text-xs">Before/after samples (moisture): {firstFert ? `${firstFert.moisture_before_count}/${firstFert.moisture_after_count}` : 'Not enough data'}</p><p className="text-xs">Confidence: {conf(data.fertilization_context.confidence)}</p><Limitations items={data.fertilization_context.limitations} /></div>
        <div className="rounded border p-3"><p className="text-sm font-medium">Reliability / alerts</p><p className="text-xs">Overall reliability: {conf(data.reliability)}</p><p className="text-xs">Deterministic alerts: {data.deterministic_alerts.length}</p><Limitations items={data.limitations} /></div>
      </div>
    </section>
  );
}
