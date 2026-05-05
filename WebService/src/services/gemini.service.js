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
]);

function hasForbiddenKey(value) {
  if (!value || typeof value !== 'object') return false;
  if (Array.isArray(value)) return value.some((item) => hasForbiddenKey(item));

  return Object.entries(value).some(([key, nested]) => FORBIDDEN_KEYS.has(key) || hasForbiddenKey(nested));
}

function isValidOutputShape(payload) {
  if (!payload || typeof payload !== 'object') return false;
  return typeof payload.summary === 'string'
    && typeof payload.confidence === 'string'
    && Array.isArray(payload.key_observations)
    && Array.isArray(payload.risks)
    && Array.isArray(payload.hypotheses)
    && Array.isArray(payload.recommended_checks)
    && Array.isArray(payload.not_claimed);
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
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: JSON.stringify(input) }] }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
      });
    } catch {
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

    if (!isValidOutputShape(parsed)) {
      return { status: 502, error: 'gemini_invalid_shape', message: 'Gemini output is missing required fields.' };
    }

    return { status: 200, data: parsed };
  }
}

export const geminiService = new GeminiService();
