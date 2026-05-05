import { AlertTriangle } from 'lucide-react';
import { useMemo } from 'react';
import { useGeminiInsight } from '../../hooks/useGeminiInsight';
import type { AnalyticsSnapshot } from '../../types/analytics';
import type { GeminiAnalysisType } from '../../types/gemini';
import { buildGeminiInsightInput } from '../../utils/ai/geminiMapper';

interface GeminiInsightPanelProps {
  snapshot: AnalyticsSnapshot | null;
  defaultAnalysisType?: GeminiAnalysisType;
  timezone?: string;
  cropContext?: {
    crop?: 'alfalfa';
    season_status?: 'active' | 'inactive' | 'unknown';
    calibration_present?: boolean;
  };
}

function reliabilityWarning(snapshot: AnalyticsSnapshot | null): string | null {
  if (!snapshot) return 'No analytics snapshot is currently available. AI interpretation may be incomplete.';
  if (snapshot.quality.reliability_level === 'low' || snapshot.quality.reliability_level === 'invalid') {
    return `Snapshot reliability is ${snapshot.quality.reliability_level}. Interpret with caution.`;
  }
  return null;
}

function parseErrorMessage(error: string | null): string | null {
  if (!error) return null;
  if (error.includes('missing_gemini_api_key')) {
    return 'AI service is not configured on backend (502 missing_gemini_api_key).';
  }
  if (error.toLowerCase().includes('invalid insight response shape')) {
    return 'AI returned an unexpected response format. Please retry later.';
  }
  return `Gemini proxy error: ${error}`;
}

export function GeminiInsightPanel({ snapshot, defaultAnalysisType = 'weekly_summary', timezone = 'UTC', cropContext }: GeminiInsightPanelProps) {
  const input = useMemo(() => {
    if (!snapshot) return null;

    return buildGeminiInsightInput(snapshot, {
      analysis_type: defaultAnalysisType,
      timezone,
      crop: cropContext?.crop ?? 'alfalfa',
      season_status: cropContext?.season_status ?? 'unknown',
      calibration_present: cropContext?.calibration_present ?? false,
    });
  }, [cropContext?.calibration_present, cropContext?.crop, cropContext?.season_status, defaultAnalysisType, snapshot, timezone]);

  const gemini = useGeminiInsight(input);
  const warning = reliabilityWarning(snapshot);
  const errorMessage = parseErrorMessage(gemini.error);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-3">
        <h2 className="text-base font-semibold text-slate-900">AI Interpretation</h2>
        <p className="mt-1 text-xs text-slate-500">Based on processed analytics only. Does not replace deterministic alerts or field inspection.</p>
      </div>

      {warning ? (
        <div className="mb-3 flex gap-2 rounded-md bg-amber-50 p-3 text-sm text-amber-800">
          <AlertTriangle className="mt-0.5 h-4 w-4" />
          <span>{warning}</span>
        </div>
      ) : null}

      <div className="mb-4">
        <button
          type="button"
          className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-400"
          onClick={() => {
            void gemini.generate();
          }}
          disabled={gemini.isLoading}
        >
          {gemini.isLoading ? 'Generating...' : 'Generate AI insight'}
        </button>
      </div>

      {errorMessage ? <div className="mb-3 rounded-md bg-rose-50 p-3 text-sm text-rose-700">{errorMessage}</div> : null}

      {!gemini.insight && !gemini.isLoading ? <div className="text-sm text-slate-500">Run manual generation to view AI interpretation.</div> : null}

      {gemini.insight ? (
        <div className="space-y-4 text-sm">
          <div>
            <h3 className="font-semibold text-slate-900">summary</h3>
            <p className="mt-1 text-slate-700">{gemini.insight.summary}</p>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900">confidence</h3>
            <p className="mt-1 uppercase text-slate-700">{gemini.insight.confidence}</p>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900">key observations</h3>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-slate-700">
              {gemini.insight.key_observations.map((obs) => (
                <li key={obs.title}><span className="font-medium">{obs.title}:</span> {obs.description}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900">Possible explanations</h3>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-slate-700">
              {gemini.insight.risks.map((risk) => (
                <li key={risk.title}><span className="font-medium">{risk.title}:</span> {risk.explanation}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900">hypotheses</h3>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-slate-700">
              {gemini.insight.hypotheses.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900">Recommended checks</h3>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-slate-700">
              {gemini.insight.recommended_checks.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900">Limitations</h3>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-slate-700">
              {gemini.insight.not_claimed.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        </div>
      ) : null}
    </section>
  );
}
