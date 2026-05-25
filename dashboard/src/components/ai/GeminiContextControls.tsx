import type { GeminiAnalysisType } from '../../types/gemini';

export type GeminiScopeKey = 'pivot_1_main' | 'pivot_2_remote' | 'weather' | 'farm_summary';
export type GeminiWindowKey = '7d' | '30d' | 'all';

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
    <section className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Interpretation context controls</h2>
      <div className="mt-3 grid gap-3 md:grid-cols-3">
        <label className="text-sm text-zinc-700 dark:text-zinc-300">
          <span className="mb-1 block font-medium">Scope</span>
          <select
            className="w-full rounded-md border border-zinc-300 bg-white px-2 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
            aria-label="Scope selector"
            value={selectedScope}
            onChange={(event) => onScopeChange(event.target.value as GeminiScopeKey)}
          >
            {SCOPE_OPTIONS.map((option) => <option key={option.key} value={option.key}>{option.label}</option>)}
          </select>
        </label>

        <label className="text-sm text-zinc-700 dark:text-zinc-300">
          <span className="mb-1 block font-medium">Time window</span>
          <select
            className="w-full rounded-md border border-zinc-300 bg-white px-2 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
            aria-label="Time window selector"
            value={selectedWindow}
            onChange={(event) => onWindowChange(event.target.value as GeminiWindowKey)}
          >
            <option value="7d">7d</option>
            <option value="30d">30d</option>
            <option value="all">Full dataset</option>
          </select>
        </label>

        <label className="text-sm text-zinc-700 dark:text-zinc-300">
          <span className="mb-1 block font-medium">Analysis type</span>
          <select
            className="w-full rounded-md border border-zinc-300 bg-white px-2 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
            aria-label="Analysis type selector"
            value={selectedAnalysisType}
            onChange={(event) => onAnalysisTypeChange(event.target.value as GeminiAnalysisType)}
          >
            {ANALYSIS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
      </div>

      {selectedScope === 'farm_summary' ? (
        <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">Farm summary is based on currently selected snapshot proxy, not a full multi-node synthesis.</p>
      ) : null}

      {selectedAnalysisType === 'pivot_comparison' ? (
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">Pivot comparison is limited because this UI currently sends one selected snapshot.</p>
      ) : null}
    </section>
  );
}
