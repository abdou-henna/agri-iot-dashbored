import type { AgronomicIntelligenceOutput } from '../../types/agronomicIntelligence';

const conf = (level: string, score: number | null) => `${level}${score == null ? '' : ` (${score.toFixed(2)})`}`;

export function AgronomicIntelligencePanel({ data }: { data: AgronomicIntelligenceOutput }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 space-y-4">
      <h2 className="text-base font-semibold">Deterministic Agronomic Intelligence</h2>
      <p className="text-xs text-slate-500">Deterministic results are shown below. AI interpretation is separate and must not override deterministic alerts.</p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded border p-3"><p className="text-sm font-medium">Farm State</p><p className="text-xs">Season: {data.farm_state.season_context}</p><p className="text-xs">Freshness: {data.farm_state.data_freshness_minutes ?? 'n/a'} min</p><p className="text-xs">Confidence: {conf(data.farm_state.confidence.level, data.farm_state.confidence.score)}</p></div>
        <div className="rounded border p-3"><p className="text-sm font-medium">Pivot Intelligence</p><p className="text-xs">Moisture divergence: {data.pivot_intelligence.moisture_divergence_percent ?? 'n/a'}%</p><p className="text-xs">Drying diff/day: {data.pivot_intelligence.drying_rate_difference_percent_per_day ?? 'n/a'}</p><p className="text-xs">Confidence: {conf(data.pivot_intelligence.confidence.level, data.pivot_intelligence.confidence.score)}</p></div>
        <div className="rounded border p-3"><p className="text-sm font-medium">Irrigation Reasoning</p><p className="text-xs">Response: {data.irrigation_reasoning.response_flag}</p><p className="text-xs">Lag: {data.irrigation_reasoning.response_lag_minutes ?? 'n/a'} min</p><p className="text-xs">Confidence: {conf(data.irrigation_reasoning.confidence.level, data.irrigation_reasoning.confidence.score)}</p></div>
        <div className="rounded border p-3"><p className="text-sm font-medium">Cutting / Fertilization</p><p className="text-xs">Regrowth: {data.cutting_regrowth_context.regrowth_context_label}</p><p className="text-xs">Fertilization EC trend: {data.fertilization_context.ec_relative_trend_context}</p><p className="text-xs">Confidence: {conf(data.reliability.level, data.reliability.score)}</p></div>
      </div>

      <div>
        <h3 className="text-sm font-semibold">Limitations</h3>
        <ul className="list-disc pl-5 text-xs space-y-1">
          {data.limitations.slice(0, 10).map((l) => <li key={l}>{l}</li>)}
        </ul>
      </div>
    </section>
  );
}
