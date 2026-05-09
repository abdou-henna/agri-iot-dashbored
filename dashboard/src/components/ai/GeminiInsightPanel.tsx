import { useEffect, useMemo } from 'react';
import { useGeminiInsight } from '../../hooks/useGeminiInsight';
import type { AnalyticsSnapshot } from '../../types/analytics';
import type { GeminiAnalysisType } from '../../types/gemini';
import type { AgronomicIntelligenceOutput } from '../../types/agronomicIntelligence';
import { buildGeminiInsightInput } from '../../utils/ai/geminiMapper';
import { buildGeminiMultiSnapshotInsightInput } from '../../utils/ai/geminiMultiSnapshotMapper';
import { GeminiReliabilityGate } from './GeminiReliabilityGate';
import { evaluateGeminiMultiSnapshotReliabilityGate, evaluateGeminiReliabilityGate } from '../../utils/ai/geminiReliabilityGate';

interface GeminiInsightPanelProps {
  snapshot: AnalyticsSnapshot | null;
  comparisonSnapshots?: Array<{ scopeLabel: string; snapshot: AnalyticsSnapshot | null }>;
  analysisType: GeminiAnalysisType;
  timezone?: string;
  contextLabel: string;
  windowLabel: string;
  scopeLabel: string;
  agronomicIntelligence?: AgronomicIntelligenceOutput | null;
}

function renderList(items: string[]) {
  if (!items.length) return <p className="mt-1 text-zinc-500 dark:text-zinc-400">No items returned.</p>;
  return <ul className="mt-1 list-disc space-y-1 pl-5 text-zinc-700 dark:text-zinc-300">{items.map((item) => <li key={item}>{item}</li>)}</ul>;
}

export function GeminiInsightPanel({ snapshot, comparisonSnapshots = [], analysisType, timezone = 'UTC', contextLabel, windowLabel, scopeLabel, agronomicIntelligence = null }: GeminiInsightPanelProps) {
  const isMulti = analysisType === 'pivot_comparison' || analysisType === 'farm_summary';
  const gate = useMemo(
    () => (isMulti ? evaluateGeminiMultiSnapshotReliabilityGate(comparisonSnapshots.map((item) => item.snapshot)) : evaluateGeminiReliabilityGate(snapshot)),
    [comparisonSnapshots, isMulti, snapshot],
  );

  const input = useMemo(() => {
    if (isMulti) return buildGeminiMultiSnapshotInsightInput({ analysisType, timezone, snapshots: comparisonSnapshots, agronomicIntelligence });
    if (!snapshot) return null;
    return buildGeminiInsightInput(snapshot, { analysis_type: analysisType, timezone, crop: 'alfalfa', season_status: 'unknown', calibration_present: false, agronomicIntelligence });
  }, [agronomicIntelligence, analysisType, comparisonSnapshots, isMulti, snapshot, timezone]);

  const gemini = useGeminiInsight(input);
  useEffect(() => { gemini.clear(); }, [analysisType, contextLabel, scopeLabel, windowLabel]);

  const canGenerate = gate.canGenerate && !gemini.isLoading && Boolean(input);
  const includedSnapshots = comparisonSnapshots.filter((item) => item.snapshot).map((item) => item.scopeLabel);
  const missingSnapshots = comparisonSnapshots.filter((item) => !item.snapshot).map((item) => item.scopeLabel);

  return (
    <section className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-3">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">AI Interpretation</h2>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Context: {contextLabel} · Window: {windowLabel} · Analysis: {analysisType}</p>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Based on deterministic summaries. Does not override deterministic alerts, and does not replace agronomist review or field inspection.</p>
      </div>

      <div className="mb-3 flex flex-wrap gap-2 text-xs">
        <span className="rounded-full bg-zinc-100 px-2 py-1 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">Reliability mode: {gate.mode}</span>
        <span className="rounded-full bg-zinc-100 px-2 py-1 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">Reliability level: {snapshot?.quality.reliability_level ?? 'mixed'}</span>
        <span className="rounded-full bg-zinc-100 px-2 py-1 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">Gemini confidence: {gemini.insight?.confidence ?? 'n/a'}</span>
        <span className="rounded-full bg-zinc-100 px-2 py-1 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">Scope: {scopeLabel}</span>
        <span className="rounded-full bg-zinc-100 px-2 py-1 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">Window: {windowLabel}</span>
        {isMulti ? <span className="rounded-full bg-zinc-100 px-2 py-1 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">Included snapshots: {includedSnapshots.length}</span> : null}
        {isMulti ? <span className="rounded-full bg-zinc-100 px-2 py-1 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">Included: {includedSnapshots.length ? includedSnapshots.join(', ') : 'none'}</span> : null}
        {isMulti ? <span className="rounded-full bg-zinc-100 px-2 py-1 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">Missing: {missingSnapshots.length ? missingSnapshots.join(', ') : 'none'}</span> : null}
      </div>

      <GeminiReliabilityGate gate={gate} snapshot={snapshot} />

      <div className="mb-4 flex flex-wrap gap-2">
        <button type="button" className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50" onClick={() => void gemini.generate()} disabled={!canGenerate}>
          {gemini.isLoading ? 'Generating...' : 'Generate AI insight'}
        </button>
        {(gemini.isError || gemini.insight) ? (
          <button type="button" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800" onClick={() => void gemini.refetch()} disabled={!canGenerate}>
            Retry
          </button>
        ) : null}
        {gemini.insight ? (
          <button type="button" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800" onClick={() => gemini.clear()} disabled={gemini.isLoading}>
            Clear result
          </button>
        ) : null}
      </div>

      {!gate.canGenerate ? <div className="mb-3 rounded-lg bg-zinc-50 p-3 text-sm text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">Generation disabled until data reliability improves or a valid snapshot is available.</div> : null}
      {gate.mode === 'caution' ? <div className="mb-3 rounded-md bg-amber-50 p-3 text-sm text-amber-900">Generated interpretation will be limited and should be treated as low confidence.</div> : null}
      {gate.mode === 'caution' && gemini.insight?.confidence === 'high' ? <div className="mb-3 rounded-md bg-amber-50 p-3 text-sm text-amber-900">Gemini confidence is high, but snapshot reliability limits practical confidence.</div> : null}
      {gemini.isError ? <div className="mb-3 rounded-lg bg-zinc-50 p-3 text-sm text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">Unable to generate interpretation due to a temporary proxy timeout or service failure. Please retry later.</div> : null}

      {!gemini.insight && !gemini.isLoading ? <div className="text-sm text-zinc-500 dark:text-zinc-400">Run manual generation to view interpretation.</div> : null}

      {gemini.insight ? (
        <div className="space-y-4 border-t border-zinc-100 pt-4 text-sm dark:border-zinc-800">
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Summary</h3>
            <p className="mt-1 text-zinc-700 dark:text-zinc-300">{gemini.insight.summary}</p>
          </div>
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Key observations</h3>
            {gemini.insight.key_observations.length ? (
              <ul className="mt-1 list-disc space-y-1 pl-5 text-zinc-700 dark:text-zinc-300">{gemini.insight.key_observations.map((obs) => <li key={obs.title}><span className="font-medium">{obs.title}:</span> {obs.description}</li>)}</ul>
            ) : <p className="mt-1 text-zinc-500 dark:text-zinc-400">No items returned.</p>}
          </div>
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Possible explanations</h3>
            {renderList(gemini.insight.hypotheses)}
          </div>
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Risks and cautions</h3>
            {gemini.insight.risks.length ? (
              <ul className="mt-1 list-disc space-y-1 pl-5 text-zinc-700 dark:text-zinc-300">{gemini.insight.risks.map((risk) => <li key={risk.title}><span className="font-medium">{risk.title}:</span> {risk.explanation} ({risk.severity}/{risk.confidence})</li>)}</ul>
            ) : <p className="mt-1 text-zinc-500 dark:text-zinc-400">No items returned.</p>}
          </div>
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Recommended checks</h3>
            {renderList(gemini.insight.recommended_checks)}
          </div>
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Limitations / Not claimed</h3>
            {renderList(gemini.insight.not_claimed)}
          </div>
        </div>
      ) : null}
    </section>
  );
}
