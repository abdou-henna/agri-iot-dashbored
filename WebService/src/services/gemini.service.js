import { GEMINI_SYSTEM_PROMPT } from '../config/geminiPrompts.js';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

const FORBIDDEN_KEYS = new Set([
  'raw_payload',
  'record_id',
  'event_id',
  'upload_id',
  'gateway_id',
  'api_key',
  'x-api-key',
  'password',
  'secret',
  'token',
  'authorization',
  'cookie',
  'set-cookie',
]);

const CONFIDENCE_LEVELS = new Set(['high', 'medium', 'low']);
const FORBIDDEN_AI_ALERT_TERMS = ['critical alert', 'emergency shutdown', 'fatal risk'];


const GEMINI_INSIGHT_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    summary: { type: 'string' },
    confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
    key_observations: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
        },
        required: ['title', 'description', 'confidence'],
      },
    },
    risks: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          severity: { type: 'string', enum: ['info', 'warning', 'error'] },
          confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
          explanation: { type: 'string' },
          limitations: { type: 'array', items: { type: 'string' } },
        },
        required: ['title', 'severity', 'confidence', 'explanation', 'limitations'],
      },
    },
    hypotheses: { type: 'array', items: { type: 'string' } },
    recommended_checks: { type: 'array', items: { type: 'string' } },
    not_claimed: { type: 'array', items: { type: 'string' } },
  },
  required: ['summary', 'confidence', 'key_observations', 'risks', 'hypotheses', 'recommended_checks', 'not_claimed'],
};

function normalizeConfidence(value) {
  return CONFIDENCE_LEVELS.has(value) ? value : 'low';
}

function normalizeGeminiInsightOutput(parsed) {
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;

  const source = parsed;
  const keyObservations = Array.isArray(source.key_observations) ? source.key_observations : [];
  const risks = Array.isArray(source.risks) ? source.risks : [];
  const hypotheses = Array.isArray(source.hypotheses) ? source.hypotheses.filter((item) => typeof item === 'string') : [];
  const recommendedChecks = Array.isArray(source.recommended_checks) ? source.recommended_checks.filter((item) => typeof item === 'string') : [];

  const normalizedNotClaimed = Array.isArray(source.not_claimed) ? source.not_claimed.filter((item) => typeof item === 'string') : [];
  if (!normalizedNotClaimed.length) {
    normalizedNotClaimed.push(
      'AI output is interpretation only and must not override deterministic analytics.',
      'No disease, nutrient, yield, ET, pH, NPK, or ECe claim is made.',
    );
  }

  return {
    summary: typeof source.summary === 'string' && source.summary.trim()
      ? source.summary
      : 'AI interpretation was returned without a summary. Review limitations before use.',
    confidence: normalizeConfidence(source.confidence),
    key_observations: keyObservations
      .filter((item) => item && typeof item === 'object' && !Array.isArray(item))
      .map((item) => ({
        title: typeof item.title === 'string' ? item.title : 'Observation',
        description: typeof item.description === 'string' ? item.description : 'No description provided by AI output.',
        confidence: normalizeConfidence(item.confidence),
      })),
    risks: risks
      .filter((risk) => risk && typeof risk === 'object' && !Array.isArray(risk))
      .map((risk) => ({
        title: typeof risk.title === 'string' ? risk.title : 'Risk item',
        severity: ['info', 'warning', 'error'].includes(risk.severity) ? risk.severity : 'info',
        confidence: normalizeConfidence(risk.confidence),
        explanation: typeof risk.explanation === 'string' ? risk.explanation : 'No explanation provided by AI output.',
        limitations: Array.isArray(risk.limitations) ? risk.limitations.filter((item) => typeof item === 'string') : [],
      })),
    hypotheses,
    recommended_checks: recommendedChecks,
    not_claimed: normalizedNotClaimed,
  };
}

function hasForbiddenKey(value) {
  if (!value || typeof value !== 'object') return false;
  if (Array.isArray(value)) return value.some((item) => hasForbiddenKey(item));

  return Object.entries(value).some(([key, nested]) => {
    const normalizedKey = key.toLowerCase();
    return FORBIDDEN_KEYS.has(normalizedKey) || hasForbiddenKey(nested);
  });
}

function isValidRisk(risk) {
  return Boolean(
    risk
    && typeof risk === 'object'
    && typeof risk.title === 'string'
    && typeof risk.severity === 'string'
    && typeof risk.confidence === 'string'
    && typeof risk.explanation === 'string'
    && Array.isArray(risk.limitations)
  );
}

function isValidOutputShape(payload) {
  if (!payload || typeof payload !== 'object') return false;
  return typeof payload.summary === 'string'
    && CONFIDENCE_LEVELS.has(payload.confidence)
    && Array.isArray(payload.key_observations)
    && Array.isArray(payload.risks)
    && payload.risks.every((risk) => isValidRisk(risk))
    && Array.isArray(payload.hypotheses)
    && Array.isArray(payload.recommended_checks)
    && Array.isArray(payload.not_claimed)
    && payload.key_observations.every((item) => item && typeof item === 'object')
    && payload.risks.every((risk) => isValidRisk(risk) && !FORBIDDEN_AI_ALERT_TERMS.some((term) => String(risk.title).toLowerCase().includes(term)));
}

class GeminiService {
  validateInput(input) {
    if (!input || typeof input !== 'object') {
      return { code: 'invalid_request', message: 'input is required.' };
    }

    if (input.schema_version !== '1.0') {
      return { code: 'invalid_request', message: 'input.schema_version must be "1.0".' };
    }

    if (!Array.isArray(input.forbidden_claims)) {
      return { code: 'invalid_request', message: 'input.forbidden_claims must be an array.' };
    }

    if (hasForbiddenKey(input)) {
      return { code: 'invalid_request', message: 'input contains forbidden fields.' };
    }

    return null;
  }

  async generateInsight(input) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return { status: 500, error: 'missing_gemini_api_key', message: 'GEMINI_API_KEY is not configured.' };
    }

    const model = process.env.GEMINI_MODEL || 'gemini-flash-latest';

    let response;
    try {
      response = await fetch(`${GEMINI_API_URL}/${model}:generateContent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': apiKey,
        },
        signal: AbortSignal.timeout(30000),
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: JSON.stringify(input) }] }],
          systemInstruction: { parts: [{ text: GEMINI_SYSTEM_PROMPT }] },
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: GEMINI_INSIGHT_RESPONSE_SCHEMA,
          },
        }),
      });
    } catch (error) {
      if (error?.name === 'TimeoutError') {
        return { status: 502, error: 'gemini_timeout', message: 'Gemini upstream timeout.' };
      }
      return { status: 502, error: 'gemini_http_error', message: 'Failed to reach Gemini API.' };
    }

    if (!response.ok) {
      return { status: 502, error: 'gemini_http_error', message: `Gemini API returned HTTP ${response.status}.` };
    }

    let responseJson;
    try {
      responseJson = await response.json();
    } catch {
      return { status: 502, error: 'gemini_invalid_response', message: 'Gemini response is not valid JSON.' };
    }

    const text = responseJson?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof text !== 'string') {
      return { status: 502, error: 'gemini_invalid_json', message: 'Gemini response did not include JSON text output.' };
    }

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      return { status: 502, error: 'gemini_invalid_json', message: 'Gemini output is not valid JSON.' };
    }

    const normalized = normalizeGeminiInsightOutput(parsed);
    if (!normalized || !isValidOutputShape(normalized)) {
      console.warn('[gemini] invalid output shape', {
        hasSummary: typeof parsed?.summary === 'string',
        hasConfidence: typeof parsed?.confidence === 'string',
        hasKeyObservations: Array.isArray(parsed?.key_observations),
        hasRisks: Array.isArray(parsed?.risks),
        hasHypotheses: Array.isArray(parsed?.hypotheses),
        hasRecommendedChecks: Array.isArray(parsed?.recommended_checks),
        hasNotClaimed: Array.isArray(parsed?.not_claimed),
      });
      return { status: 502, error: 'gemini_invalid_shape', message: 'Gemini output is missing required fields.' };
    }

    return { status: 200, data: normalized };
  }
}

export const geminiService = new GeminiService();
