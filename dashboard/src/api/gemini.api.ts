import { apiPost } from './client';
import type { GeminiInsightInput, GeminiInsightOutput } from '../types/gemini';

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

export async function generateGeminiInsight(input: GeminiInsightInput): Promise<GeminiInsightOutput> {
  const response = await apiPost<unknown>('/api/v1/ai/gemini/insight', { input });

  if (!isValidInsightOutput(response)) {
    throw new Error('Gemini proxy returned an invalid insight response shape.');
  }

  return response;
}
