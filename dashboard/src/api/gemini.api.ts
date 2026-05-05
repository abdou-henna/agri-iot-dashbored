import type { GeminiInsightInput, GeminiInsightOutput } from '../types/gemini';
import { GEMINI_SYSTEM_PROMPT } from '../config/geminiPrompts';

interface GeminiApiError {
  message: string;
  code: 'missing_api_key' | 'http_error' | 'invalid_json' | 'invalid_shape' | 'unknown';
  status?: number;
}

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
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
  const model = (import.meta.env.VITE_GEMINI_MODEL as string | undefined) || 'gemini-flash-latest';

  if (!apiKey) {
    throw { code: 'missing_api_key', message: 'VITE_GEMINI_API_KEY is required to generate Gemini insights.' } as GeminiApiError;
  }

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: JSON.stringify(input) }] }],
      systemInstruction: { parts: [{ text: GEMINI_SYSTEM_PROMPT }] },
      generationConfig: { responseMimeType: 'application/json' },
    }),
  });

  if (!response.ok) {
    throw { code: 'http_error', status: response.status, message: `Gemini request failed with status ${response.status}.` } as GeminiApiError;
  }

  const responseJson = await response.json();
  const text = responseJson?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof text !== 'string') {
    throw { code: 'invalid_json', message: 'Gemini response did not include JSON text content.' } as GeminiApiError;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw { code: 'invalid_json', message: 'Gemini returned non-JSON output.' } as GeminiApiError;
  }

  if (!isValidInsightOutput(parsed)) {
    throw { code: 'invalid_shape', message: 'Gemini JSON output is missing required fields.' } as GeminiApiError;
  }

  return parsed;
}
