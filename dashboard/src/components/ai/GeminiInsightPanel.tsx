import { useEffect, useMemo } from 'react';
import { useGeminiInsight } from '../../hooks/useGeminiInsight';
import type { ApiError } from '../../api/client';
import type { AnalyticsSnapshot } from '../../types/analytics';
import type { GeminiActionPlanItem, GeminiAnalysisType, GeminiInsightOutput, GeminiPivotObservation } from '../../types/gemini';
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
  isFullDataset?: boolean;
  intelligenceFrom?: string;
  intelligenceTo?: string;
  snapshotFrom?: string;
  snapshotTo?: string;
  totalReadingsAvailable?: number;
  readingsLimitUsed?: number;
}

function renderList(items: string[]) {
  if (!items.length) return <p className="mt-1 text-zinc-500 dark:text-zinc-400">No items returned.</p>;
  return <ul className="mt-1 list-disc space-y-1 pl-5 text-zinc-700 dark:text-zinc-300">{items.map((item) => <li key={item}>{item}</li>)}</ul>;
}

interface GeminiErrorDetails {
  friendlyMessage: string;
  requestId?: string;
  providerStatus?: number;
  retryable: boolean;
}

function getGeminiErrorDetails(error: ApiError | null): GeminiErrorDetails {
  if (!error) return { friendlyMessage: 'An unknown error occurred. Please retry.', retryable: false };

  const details = typeof error.details === 'object' && error.details !== null
    ? (error.details as Record<string, unknown>)
    : {};

  const retryable = Boolean(details.retryable) || error.status === 0 || error.status === 503;
  const requestId = typeof details.request_id === 'string' ? details.request_id : undefined;
  const providerStatus = typeof details.provider_status === 'number' ? details.provider_status : undefined;

  // error.message is set to payload.error by client.ts (the error code string)
  const code = error.message;

  let friendlyMessage: string;
  if (code === 'ai_provider_timeout' || code === 'gemini_timeout') {
    friendlyMessage = 'Gemini needed more time than expected to generate this report. Please retry. If it persists, use a smaller report window.';
  } else if (code === 'ai_provider_unavailable') {
    friendlyMessage = 'Gemini is temporarily unavailable. Please try again in a moment.';
  } else if (error.status === 0) {
    friendlyMessage = 'The AI report took longer than expected and the browser stopped waiting. Please retry or reduce the report scope/window.';
  } else {
    friendlyMessage = typeof details.message === 'string' && details.message
      ? details.message
      : 'Unable to generate the AI report due to a temporary service failure. Please retry later.';
  }

  return { friendlyMessage, requestId, providerStatus, retryable };
}

function RichInsightContent({ insight }: { insight: GeminiInsightOutput }) {
  const isDemo = insight.report_mode === 'small_dataset_demo';
  const hasEnrichedReport = Boolean(
    insight.executive_summary
    || insight.farm_state
    || insight.pivot_observations?.length
    || insight.weather_context
    || insight.irrigation_context
    || insight.data_quality_interpretation
    || insight.plant_health_caution
    || insight.why_this_matters
    || insight.action_plan?.length,
  );

  return (
    <div className="space-y-4 border-t border-zinc-100 pt-4 text-sm dark:border-zinc-800">
      {isDemo && (
        <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
          <span className="mr-2 rounded-full bg-amber-200 px-2 py-0.5 font-semibold dark:bg-amber-800">Small Dataset Demo Report</span>
          Suitable for thesis/demo interpretation and field-check guidance. Not for final agronomic decisions.
        </div>
      )}

      {insight.executive_summary ? (
        <div>
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Executive Summary</h3>
          <p className="mt-1 text-zinc-700 dark:text-zinc-300">{insight.executive_summary}</p>
        </div>
      ) : (
        <div>
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Summary</h3>
          <p className="mt-1 text-zinc-700 dark:text-zinc-300">{insight.summary}</p>
        </div>
      )}

      {insight.farm_state ? (
        <div>
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Farm State</h3>
          <p className="mt-1 text-zinc-700 dark:text-zinc-300">{insight.farm_state}</p>
        </div>
      ) : null}

      {insight.pivot_observations?.length ? (
        <div>
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Pivot Observations</h3>
          <ul className="mt-1 space-y-2">
            {insight.pivot_observations.map((obs: GeminiPivotObservation) => (
              <li key={obs.pivot} className="rounded-md border border-zinc-100 bg-zinc-50 p-2 dark:border-zinc-700 dark:bg-zinc-800">
                <p className="font-medium text-zinc-800 dark:text-zinc-200">{obs.pivot}</p>
                <p className="mt-0.5 text-zinc-700 dark:text-zinc-300">{obs.observation}</p>
                {obs.evidence.length ? (
                  <ul className="mt-1 list-disc pl-4 text-xs text-zinc-600 dark:text-zinc-400">
                    {obs.evidence.map((e) => <li key={e}>{e}</li>)}
                  </ul>
                ) : null}
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Confidence: {obs.confidence} · {obs.limitation}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {insight.weather_context ? (
        <div>
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Weather Context</h3>
          <p className="mt-1 text-zinc-700 dark:text-zinc-300">{insight.weather_context}</p>
        </div>
      ) : null}

      {insight.irrigation_context ? (
        <div>
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Irrigation Context</h3>
          <p className="mt-1 text-zinc-700 dark:text-zinc-300">{insight.irrigation_context}</p>
        </div>
      ) : null}

      {insight.data_quality_interpretation ? (
        <div>
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Data Quality</h3>
          <p className="mt-1 text-xs font-medium text-zinc-600 dark:text-zinc-400">Usable for:</p>
          {renderList(insight.data_quality_interpretation.usable_for)}
          <p className="mt-2 text-xs font-medium text-zinc-600 dark:text-zinc-400">Not usable for:</p>
          {renderList(insight.data_quality_interpretation.not_usable_for)}
        </div>
      ) : null}

      {insight.plant_health_caution?.not_diagnosed?.length ? (
        <div>
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Plant Health Caution</h3>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Not diagnosed / not inferred:</p>
          {renderList(insight.plant_health_caution.not_diagnosed)}
        </div>
      ) : null}

      {insight.why_this_matters ? (
        <div>
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Why This Matters</h3>
          <p className="mt-1 text-zinc-700 dark:text-zinc-300">{insight.why_this_matters}</p>
        </div>
      ) : null}

      {insight.action_plan?.length ? (
        <div>
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Action Plan</h3>
          <ul className="mt-1 space-y-2">
            {insight.action_plan.map((action: GeminiActionPlanItem) => (
              <li key={action.title} className="rounded-md border border-zinc-100 bg-zinc-50 p-2 dark:border-zinc-700 dark:bg-zinc-800">
                <p className="font-medium text-zinc-800 dark:text-zinc-200">{action.title}</p>
                <p className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400">Priority: {action.priority} · Type: {action.type} · Confidence: {action.confidence}</p>
                <p className="mt-1 text-zinc-700 dark:text-zinc-300">{action.rationale}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {!hasEnrichedReport ? (
        <div>
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Key observations</h3>
          {insight.key_observations.length ? (
            <ul className="mt-1 list-disc space-y-1 pl-5 text-zinc-700 dark:text-zinc-300">{insight.key_observations.map((obs) => <li key={obs.title}><span className="font-medium">{obs.title}:</span> {obs.description}</li>)}</ul>
          ) : <p className="mt-1 text-zinc-500 dark:text-zinc-400">No items returned.</p>}
        </div>
      ) : null}

      {hasEnrichedReport && insight.key_observations.length ? (
        <div>
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Supporting Detail: Key Observations</h3>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-zinc-700 dark:text-zinc-300">{insight.key_observations.map((obs) => <li key={obs.title}><span className="font-medium">{obs.title}:</span> {obs.description}</li>)}</ul>
        </div>
      ) : null}

      {insight.hypotheses.length ? (
        <div>
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Supporting Detail: Possible Explanations</h3>
          {renderList(insight.hypotheses)}
        </div>
      ) : null}

      <div>
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Monitoring Risks and Cautions</h3>
        {insight.risks.length ? (
          <ul className="mt-1 list-disc space-y-1 pl-5 text-zinc-700 dark:text-zinc-300">{insight.risks.map((risk) => <li key={risk.title}><span className="font-medium">{risk.title}:</span> {risk.explanation} ({risk.severity}/{risk.confidence})</li>)}</ul>
        ) : <p className="mt-1 text-zinc-500 dark:text-zinc-400">No items returned.</p>}
      </div>

      {!insight.action_plan?.length && insight.recommended_checks.length ? (
        <div>
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Recommended Checks</h3>
          {renderList(insight.recommended_checks)}
        </div>
      ) : null}

      {(insight.limitations?.length || insight.not_claimed.length) ? (
        <div>
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Limitations / Not claimed</h3>
          {insight.limitations?.length ? renderList(insight.limitations) : null}
          {renderList(insight.not_claimed)}
        </div>
      ) : null}
    </div>
  );
}

export function GeminiInsightPanel({ snapshot, comparisonSnapshots = [], analysisType, timezone = 'UTC', contextLabel, windowLabel, scopeLabel, agronomicIntelligence = null, isFullDataset = false, intelligenceFrom, intelligenceTo, snapshotFrom, snapshotTo, totalReadingsAvailable, readingsLimitUsed }: GeminiInsightPanelProps) {
  const isMulti = analysisType === 'pivot_comparison' || analysisType === 'farm_summary';
  const gate = useMemo(
    () => (isMulti ? evaluateGeminiMultiSnapshotReliabilityGate(comparisonSnapshots.map((item) => item.snapshot)) : evaluateGeminiReliabilityGate(snapshot)),
    [comparisonSnapshots, isMulti, snapshot],
  );

  const input = useMemo(() => {
    if (isMulti) return buildGeminiMultiSnapshotInsightInput({ analysisType, timezone, snapshots: comparisonSnapshots, agronomicIntelligence, selectedWindow: windowLabel, isFullDataset, intelligenceFrom, intelligenceTo, snapshotFrom, snapshotTo, totalReadingsAvailable, readingsLimitUsed });
    if (!snapshot) return null;
    return buildGeminiInsightInput(snapshot, { analysis_type: analysisType, timezone, crop: 'alfalfa', season_status: 'unknown', calibration_present: false, agronomicIntelligence, selectedWindow: windowLabel, isFullDataset, intelligenceFrom, intelligenceTo, snapshotFrom, snapshotTo, totalReadingsAvailable, readingsLimitUsed });
  }, [agronomicIntelligence, analysisType, comparisonSnapshots, intelligenceFrom, intelligenceTo, isFullDataset, isMulti, readingsLimitUsed, snapshot, snapshotFrom, snapshotTo, timezone, totalReadingsAvailable, windowLabel]);

  const gemini = useGeminiInsight(input);
  useEffect(() => { gemini.clear(); }, [analysisType, contextLabel, scopeLabel, windowLabel]);

  const canGenerate = gate.canGenerate && !gemini.isLoading && Boolean(input);
  const errorDetails = getGeminiErrorDetails(gemini.apiError);
  const displayedConfidence = gate.report_mode === 'small_dataset_demo' && gate.mode === 'caution' && gemini.insight?.confidence === 'high'
    ? 'medium'
    : (gemini.insight?.confidence ?? 'n/a');
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
        <span className="rounded-full bg-zinc-100 px-2 py-1 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">Report mode: {gate.report_mode}</span>
        <span className="rounded-full bg-zinc-100 px-2 py-1 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">Reliability level: {snapshot?.quality.reliability_level ?? 'mixed'}</span>
        <span className="rounded-full bg-zinc-100 px-2 py-1 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">Gemini confidence: {displayedConfidence}</span>
        <span className="rounded-full bg-zinc-100 px-2 py-1 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">Valid readings: {gate.valid_count}</span>
        <span className="rounded-full bg-zinc-100 px-2 py-1 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">Scope: {scopeLabel}</span>
        <span className="rounded-full bg-zinc-100 px-2 py-1 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">Window: {windowLabel}</span>
        {isMulti ? <span className="rounded-full bg-zinc-100 px-2 py-1 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">Included: {includedSnapshots.length ? includedSnapshots.join(', ') : 'none'}</span> : null}
        {isMulti ? <span className="rounded-full bg-zinc-100 px-2 py-1 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">Missing: {missingSnapshots.length ? missingSnapshots.join(', ') : 'none'}</span> : null}
      </div>

      <GeminiReliabilityGate gate={gate} snapshot={snapshot} />

      <div className="mb-4 flex flex-wrap gap-2">
        <button type="button" className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50" onClick={() => { gemini.generate().catch(() => {}); }} disabled={!canGenerate}>
          {gemini.isLoading ? 'Generating...' : 'Generate AI insight'}
        </button>
        {(gemini.isError || gemini.insight) ? (
          <button type="button" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800" onClick={() => { gemini.refetch().catch(() => {}); }} disabled={!canGenerate}>
            Retry
          </button>
        ) : null}
        {gemini.insight ? (
          <button type="button" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800" onClick={() => gemini.clear()} disabled={gemini.isLoading}>
            Clear result
          </button>
        ) : null}
      </div>

      {!gate.canGenerate ? <div className="mb-3 rounded-lg bg-zinc-50 p-3 text-sm text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">Generation disabled: {gate.reason}</div> : null}
      {gate.mode === 'caution' ? <div className="mb-3 rounded-md bg-amber-50 p-3 text-sm text-amber-900">This report is generated in Small Dataset Demo Mode. It is suitable for thesis/demo interpretation and field-check guidance, but not for final agronomic decisions.</div> : null}
      {gate.mode === 'caution' && gemini.insight?.confidence === 'high' ? <div className="mb-3 rounded-md bg-amber-50 p-3 text-sm text-amber-900">Snapshot reliability caps practical confidence at medium for this demo report.</div> : null}
      {gemini.isError ? (
        <div className="mb-3 rounded-lg bg-zinc-50 p-3 text-sm text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
          <p>{errorDetails.friendlyMessage}</p>
          {(gemini.apiError?.message || errorDetails.requestId || errorDetails.providerStatus) ? (
            <details className="mt-2">
              <summary className="cursor-pointer text-xs text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300">Technical details</summary>
              <div className="mt-1 space-y-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                {gemini.apiError?.message ? <p>Code: {gemini.apiError.message}</p> : null}
                {errorDetails.providerStatus ? <p>Provider status: {errorDetails.providerStatus}</p> : null}
                {errorDetails.requestId ? <p>Request ID: {errorDetails.requestId}</p> : null}
              </div>
            </details>
          ) : null}
        </div>
      ) : null}

      {!gemini.insight && !gemini.isLoading ? <div className="text-sm text-zinc-500 dark:text-zinc-400">Run manual generation to view interpretation.</div> : null}

      {gemini.insight ? <RichInsightContent insight={gemini.insight} /> : null}
    </section>
  );
}
