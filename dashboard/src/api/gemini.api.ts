import { apiPost } from './client';
import type { GeminiInsightInput, GeminiInsightOutput, GeminiMultiSnapshotInsightInput } from '../types/gemini';

const REQUEST_TIMEOUT_MS = 30000;

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
  const response = await Promise.race([
    apiPost<unknown>('/api/v1/ai/gemini/insight', { input }),
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Gemini request timed out after 30s.')), REQUEST_TIMEOUT_MS)),
  ]);

  if (!isValidInsightOutput(response)) {
    throw new Error('Gemini proxy returned an invalid insight response shape.');
  }

  return response;
}
