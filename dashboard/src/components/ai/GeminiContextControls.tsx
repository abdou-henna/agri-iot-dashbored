import type { GeminiAnalysisType } from '../../types/gemini';

export type GeminiScopeKey = 'pivot_1_main' | 'pivot_2_remote' | 'weather' | 'farm_summary';
export type GeminiWindowKey = '7d' | '30d';

export interface GeminiScopeOption {
  key: GeminiScopeKey;
  node_id: 'MAIN' | 'N2' | 'N3';
  metric: 'soil_moisture_percent' | 'air_temperature_c';
  label: string;
}

const SCOPE_OPTIONS: GeminiScopeOption[] = [
  { key: 'pivot_1_main', node_id: 'MAIN', metric: 'soil_moisture_percent', label: 'Pivot 1 — MAIN soil' },
  { key: 'pivot_2_remote', node_id: 'N2', metric: 'soil_moisture_percent', label: 'Pivot 2 — N2 soil' },
  { key: 'weather', node_id: 'N3', metric: 'air_temperature_c', label: 'Weather — N3' },
  { key: 'farm_summary', node_id: 'MAIN', metric: 'soil_moisture_percent', label: 'Farm summary' },
];

const ANALYSIS_OPTIONS: Array<{ value: GeminiAnalysisType; label: string }> = [
  { value: 'weekly_summary', label: 'Weekly summary interpretation' },
  { value: 'event_analysis', label: 'Event analysis interpretation' },
  { value: 'alert_explanation', label: 'Alert explanation interpretation' },
  { value: 'pivot_comparison', label: 'Pivot comparison interpretation' },
];

interface GeminiContextControlsProps {
  selectedScope: GeminiScopeKey;
  selectedWindow: GeminiWindowKey;
  selectedAnalysisType: GeminiAnalysisType;
  onScopeChange: (scope: GeminiScopeKey) => void;
  onWindowChange: (window: GeminiWindowKey) => void;
  onAnalysisTypeChange: (analysisType: GeminiAnalysisType) => void;
}

export function getGeminiScopeOption(scope: GeminiScopeKey): GeminiScopeOption {
  return SCOPE_OPTIONS.find((option) => option.key === scope) ?? SCOPE_OPTIONS[0];
}

export function GeminiContextControls({
  selectedScope,
  selectedWindow,
  selectedAnalysisType,
  onScopeChange,
  onWindowChange,
  onAnalysisTypeChange,
}: GeminiContextControlsProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="text-base font-semibold text-slate-900">Interpretation context controls</h2>
      <div className="mt-3 grid gap-3 md:grid-cols-3">
        <label className="text-sm text-slate-700">
          <span className="mb-1 block font-medium">Scope</span>
          <select
            className="w-full rounded-md border border-slate-300 bg-white px-2 py-2 text-sm"
            aria-label="Scope selector"
            value={selectedScope}
            onChange={(event) => onScopeChange(event.target.value as GeminiScopeKey)}
          >
            {SCOPE_OPTIONS.map((option) => <option key={option.key} value={option.key}>{option.label}</option>)}
          </select>
        </label>

        <label className="text-sm text-slate-700">
          <span className="mb-1 block font-medium">Time window</span>
          <select
            className="w-full rounded-md border border-slate-300 bg-white px-2 py-2 text-sm"
            aria-label="Time window selector"
            value={selectedWindow}
            onChange={(event) => onWindowChange(event.target.value as GeminiWindowKey)}
          >
            <option value="7d">7d</option>
            <option value="30d">30d</option>
          </select>
        </label>

        <label className="text-sm text-slate-700">
          <span className="mb-1 block font-medium">Analysis type</span>
          <select
            className="w-full rounded-md border border-slate-300 bg-white px-2 py-2 text-sm"
            aria-label="Analysis type selector"
            value={selectedAnalysisType}
            onChange={(event) => onAnalysisTypeChange(event.target.value as GeminiAnalysisType)}
          >
            {ANALYSIS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
      </div>

      {selectedScope === 'farm_summary' ? (
        <p className="mt-3 text-xs text-slate-600">Farm summary is based on currently selected snapshot proxy, not a full multi-node synthesis.</p>
      ) : null}

      {selectedAnalysisType === 'pivot_comparison' ? (
        <p className="mt-2 text-xs text-slate-600">Pivot comparison is limited because this UI currently sends one selected snapshot.</p>
      ) : null}
    </section>
  );
}
