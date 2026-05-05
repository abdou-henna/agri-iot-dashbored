import { useEffect, useMemo } from 'react';
import { useGeminiInsight } from '../../hooks/useGeminiInsight';
import type { AnalyticsSnapshot } from '../../types/analytics';
import type { GeminiAnalysisType } from '../../types/gemini';
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
}

export function GeminiInsightPanel({ snapshot, comparisonSnapshots = [], analysisType, timezone = 'UTC', contextLabel, windowLabel, scopeLabel }: GeminiInsightPanelProps) {
  const isMulti = analysisType === 'pivot_comparison' || analysisType === 'farm_summary';
  const gate = useMemo(() => (isMulti ? evaluateGeminiMultiSnapshotReliabilityGate(comparisonSnapshots.map((item) => item.snapshot)) : evaluateGeminiReliabilityGate(snapshot)), [comparisonSnapshots, isMulti, snapshot]);
  const input = useMemo(() => {
    if (isMulti) return buildGeminiMultiSnapshotInsightInput({ analysisType, timezone, snapshots: comparisonSnapshots });
    if (!snapshot) return null;
    return buildGeminiInsightInput(snapshot, { analysis_type: analysisType, timezone, crop: 'alfalfa', season_status: 'unknown', calibration_present: false });
  }, [analysisType, comparisonSnapshots, isMulti, snapshot, timezone]);

  const gemini = useGeminiInsight(input);
  useEffect(() => { gemini.clear(); }, [analysisType, windowLabel, scopeLabel]);
  const canGenerate = gate.canGenerate && !gemini.isLoading && Boolean(input);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="text-base font-semibold text-slate-900">AI Interpretation</h2>
      <p className="mt-1 text-xs text-slate-600">Context: {contextLabel} · Window: {windowLabel} · Analysis: {analysisType}</p>
      {isMulti ? <div className="mt-2 text-xs text-slate-600">Snapshots: {comparisonSnapshots.map((s) => `${s.scopeLabel}: ${s.snapshot ? 'included' : 'missing'}`).join(' · ')}</div> : null}
      <GeminiReliabilityGate gate={gate} snapshot={snapshot} />
      <div className="mb-3 flex flex-wrap gap-2">
        <button type="button" className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-400" onClick={() => void gemini.generate()} disabled={!canGenerate}>{gemini.isLoading ? 'Generating...' : 'Generate AI insight'}</button>
      </div>
      {gemini.error ? <div className="text-sm text-slate-700">Unable to generate interpretation right now. Please retry shortly.</div> : null}
      {gemini.insight ? <p className="text-sm text-slate-700">{gemini.insight.summary}</p> : <p className="text-sm text-slate-500">Run manual generation to view interpretation.</p>}
    </section>
  );
}
