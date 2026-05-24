import { apiPost } from './client';
import type { GeminiInsightInput, GeminiInsightOutput, GeminiMultiSnapshotInsightInput } from '../types/gemini';

// Gemini report generation calls an external AI provider through the backend,
// so it can take longer than normal dashboard reads.
const GEMINI_REQUEST_TIMEOUT_MS = 45000;

function isValidInsightOutput(payload: unknown): payload is GeminiInsightOutput {
  if (!payload || typeof payload !== 'object') return false;
  const p = payload as Record<string, unknown>;
  return typeof p.summary === 'string'
    && typeof p.confidence === 'string'
    && Array.isArray(p.key_observations)
    && Array.isArray(p.risks)
    && Array.isArray(p.hypotheses)
    && Array.isArray(p.recommended_checks)
    && Array.isArray(p.not_claimed);
}

export async function generateGeminiInsight(input: GeminiInsightInput | GeminiMultiSnapshotInsightInput): Promise<GeminiInsightOutput> {
  const response = await apiPost<unknown>('/api/v1/ai/gemini/insight', { input }, { timeoutMs: GEMINI_REQUEST_TIMEOUT_MS });

  if (!isValidInsightOutput(response)) {
    throw new Error('Gemini proxy returned an invalid insight response shape.');
  }

  return response;
}
