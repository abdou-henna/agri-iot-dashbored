import { useMemo } from 'react';
import { useGeminiInsight } from '../../hooks/useGeminiInsight';
import type { AnalyticsSnapshot } from '../../types/analytics';
import type { GeminiAnalysisType } from '../../types/gemini';
import { buildGeminiInsightInput } from '../../utils/ai/geminiMapper';

interface GeminiInsightPanelProps {
  snapshot: AnalyticsSnapshot | null;
  analysisType: GeminiAnalysisType;
  timezone?: string;
  contextLabel: string;
  windowLabel: string;
  scopeLabel: string;
}

function parseErrorMessage(error: string | null): string | null {
  if (!error) return null;
  if (error.includes('missing_gemini_api_key')) return 'Backend proxy is missing Gemini API key configuration.';
  if (error.toLowerCase().includes('invalid insight response shape')) return 'Invalid output shape returned by backend proxy. Retry later.';
  if (error.toLowerCase().includes('http')) return 'Backend proxy HTTP error while generating interpretation.';
  return 'Unable to generate interpretation due to a temporary failure.';
}

function renderList(items: string[]) {
  if (!items.length) return <p className="mt-1 text-slate-500">No items returned.</p>;
  return <ul className="mt-1 list-disc space-y-1 pl-5 text-slate-700">{items.map((item) => <li key={item}>{item}</li>)}</ul>;
}

export function GeminiInsightPanel({ snapshot, analysisType, timezone = 'UTC', contextLabel, windowLabel, scopeLabel }: GeminiInsightPanelProps) {
  const input = useMemo(() => {
    if (!snapshot) return null;
    return buildGeminiInsightInput(snapshot, {
      analysis_type: analysisType,
      timezone: timezone ?? 'UTC',
      crop: 'alfalfa',
      season_status: 'unknown',
      calibration_present: false,
    });
  }, [analysisType, snapshot, timezone]);

  const gemini = useGeminiInsight(input);
  const errorMessage = parseErrorMessage(gemini.error);
  const reliabilityLevel = snapshot?.quality.reliability_level ?? 'invalid';
  const reliabilityScore = snapshot?.quality.reliability_score;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-3">
        <h2 className="text-base font-semibold text-slate-900">AI Interpretation</h2>
        <p className="mt-1 text-xs text-slate-600">Context: {contextLabel} · Window: {windowLabel} · Analysis: {analysisType}</p>
        <p className="mt-1 text-xs text-slate-500">Based on processed analytics only. Does not replace deterministic alerts, agronomist review, or field inspection.</p>
      </div>

      <div className="mb-3 flex flex-wrap gap-2 text-xs">
        <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-700">Reliability: {reliabilityLevel}</span>
        <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-700">Reliability score: {reliabilityScore ?? 'n/a'}</span>
        <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-700">Gemini confidence: {gemini.insight?.confidence ?? 'n/a'}</span>
        <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-700">Scope: {scopeLabel}</span>
        <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-700">Window: {windowLabel}</span>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <button type="button" className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-400" onClick={() => void gemini.generate()} disabled={gemini.isLoading || !snapshot}>
          {gemini.isLoading ? 'Generating...' : 'Generate AI insight'}
        </button>
        {(gemini.isError || gemini.insight) ? (
          <button type="button" className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 disabled:cursor-not-allowed" onClick={() => void gemini.refetch()} disabled={gemini.isLoading || !snapshot}>
            Retry
          </button>
        ) : null}
        {gemini.insight ? (
          <button type="button" className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 disabled:cursor-not-allowed" onClick={() => gemini.clear()} disabled={gemini.isLoading}>
            Clear result
          </button>
        ) : null}
      </div>

      {!snapshot ? <div className="mb-3 rounded-md bg-slate-50 p-3 text-sm text-slate-700">No snapshot available for current context.</div> : null}
      {!snapshot && !gemini.isLoading ? null : null}
      {snapshot && reliabilityLevel === 'low' ? <div className="mb-3 rounded-md bg-slate-50 p-3 text-sm text-slate-700">Low reliability snapshot; interpretation quality may be limited.</div> : null}
      {gemini.isLoading ? <div className="mb-3 rounded-md bg-slate-50 p-3 text-sm text-slate-700">Snapshot loading and interpretation in progress.</div> : null}
      {errorMessage ? <div className="mb-3 rounded-md bg-slate-50 p-3 text-sm text-slate-700">{errorMessage}</div> : null}

      {!gemini.insight && !gemini.isLoading ? <div className="text-sm text-slate-500">Run manual generation to view interpretation.</div> : null}

      {gemini.insight ? (
        <div className="space-y-4 border-t border-slate-100 pt-4 text-sm">
          <div>
            <h3 className="font-semibold text-slate-900">Summary</h3>
            <p className="mt-1 text-slate-700">{gemini.insight.summary}</p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Key observations</h3>
            {gemini.insight.key_observations.length ? (
              <ul className="mt-1 list-disc space-y-1 pl-5 text-slate-700">
                {gemini.insight.key_observations.map((obs) => <li key={obs.title}><span className="font-medium">{obs.title}:</span> {obs.description}</li>)}
              </ul>
            ) : <p className="mt-1 text-slate-500">No items returned.</p>}
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Possible explanations</h3>
            {gemini.insight.risks.length ? (
              <ul className="mt-1 list-disc space-y-1 pl-5 text-slate-700">{gemini.insight.risks.map((risk) => <li key={risk.title}><span className="font-medium">{risk.title}:</span> {risk.explanation}</li>)}</ul>
            ) : <p className="mt-1 text-slate-500">No items returned.</p>}
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Risks and cautions</h3>
            {renderList(gemini.insight.hypotheses)}
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Recommended checks</h3>
            {renderList(gemini.insight.recommended_checks)}
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Limitations / Not claimed</h3>
            {renderList(gemini.insight.not_claimed)}
          </div>
        </div>
      ) : (
        <div className="mt-4 border-t border-slate-100 pt-4 text-sm">
          <h3 className="font-semibold text-slate-900">Limitations / Not claimed</h3>
          <p className="mt-1 text-slate-500">No items returned.</p>
        </div>
      )}
    </section>
  );
}
