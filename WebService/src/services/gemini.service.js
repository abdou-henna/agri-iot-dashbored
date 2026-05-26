import { GEMINI_SYSTEM_PROMPT } from '../config/geminiPrompts.js';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const GEMINI_UPSTREAM_TIMEOUT_MS = 25_000;
const MAX_ATTEMPTS = 3;
// Delays before attempt 2 and attempt 3 (ms). No delay needed after the final attempt.
const RETRY_DELAYS_MS = [1000, 2000];
const RETRYABLE_HTTP_STATUSES = new Set([429, 500, 502, 503, 504]);

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

// These strings must always appear in not_claimed regardless of what Gemini returns
const REQUIRED_NOT_CLAIMED = [
  'No disease diagnosis is made.',
  'No disease percentage is inferred.',
  'No yield prediction is made.',
  'No exact irrigation amount is prescribed.',
  'No NPK, pH, ECe, or ET inference is made.',
];

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
    // Enriched fields (optional in schema — safe fallback if Gemini omits them)
    report_mode: { type: 'string', enum: ['standard', 'small_dataset_demo'] },
    executive_summary: { type: 'string' },
    farm_state: { type: 'string' },
    pivot_observations: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          pivot: { type: 'string' },
          observation: { type: 'string' },
          evidence: { type: 'array', items: { type: 'string' } },
          confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
          limitation: { type: 'string' },
        },
        required: ['pivot', 'observation', 'evidence', 'confidence', 'limitation'],
      },
    },
    weather_context: { type: 'string' },
    irrigation_context: { type: 'string' },
    data_quality_interpretation: {
      type: 'object',
      properties: {
        usable_for: { type: 'array', items: { type: 'string' } },
        not_usable_for: { type: 'array', items: { type: 'string' } },
      },
      required: ['usable_for', 'not_usable_for'],
    },
    plant_health_caution: {
      type: 'object',
      properties: {
        not_diagnosed: { type: 'array', items: { type: 'string' } },
      },
      required: ['not_diagnosed'],
    },
    why_this_matters: { type: 'string' },
    action_plan: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          priority: { type: 'string', enum: ['high', 'medium', 'low'] },
          type: { type: 'string', enum: ['field_check', 'sensor_check', 'data_quality', 'irrigation_review', 'monitoring'] },
          rationale: { type: 'string' },
          confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
        },
        required: ['title', 'priority', 'type', 'rationale', 'confidence'],
      },
    },
    limitations: { type: 'array', items: { type: 'string' } },
  },
  required: ['summary', 'confidence', 'key_observations', 'risks', 'hypotheses', 'recommended_checks', 'not_claimed'],
};

function isRetryableStatus(status) {
  return RETRYABLE_HTTP_STATUSES.has(status);
}

function jitter() {
  return Math.floor(Math.random() * 500);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeConfidence(value, maxAllowed) {
  const normalized = CONFIDENCE_LEVELS.has(value) ? value : 'low';
  if (!maxAllowed) return normalized;
  // Cap confidence: high > medium > low
  const rank = { high: 2, medium: 1, low: 0 };
  return rank[normalized] > rank[maxAllowed] ? maxAllowed : normalized;
}

function firstNonEmptyString(...values) {
  return values.find((value) => typeof value === 'string' && value.trim())?.trim() ?? '';
}

function sentenceFromObservation(observation) {
  if (!observation || typeof observation !== 'object') return '';
  return firstNonEmptyString(observation.description, observation.title);
}

function buildDataQualityFallback(input, hasLowOrInvalidReliability) {
  const sampleSize = input?.report_context?.sample_size;
  const validCount = typeof sampleSize?.valid_count === 'number' ? sampleSize.valid_count : null;
  const processedCount = typeof sampleSize?.processed_count === 'number' ? sampleSize.processed_count : null;
  const sampleText = validCount === null
    ? 'the available processed summaries'
    : `${validCount} valid reading${validCount === 1 ? '' : 's'} from ${processedCount ?? 'the'} processed record${processedCount === 1 ? '' : 's'}`;

  return {
    usable_for: [
      `Thesis/demo interpretation from ${sampleText}.`,
      'Field-check guidance, monitoring review, and explanation of deterministic QC, reliability, and alert outputs.',
    ],
    not_usable_for: [
      'Final agronomic decisions without field inspection and a larger validated dataset.',
      'Disease diagnosis, disease percentage, yield prediction, exact irrigation prescription, NPK, pH, ECe, or ET inference.',
      hasLowOrInvalidReliability
        ? 'High-confidence crop condition claims because at least one reliability signal is low or invalid.'
        : 'High-confidence crop condition claims beyond the deterministic summaries provided.',
    ],
  };
}

function buildPlantHealthFallback() {
  return {
    not_diagnosed: [
      'No disease diagnosis is produced.',
      'No disease percentage is produced.',
      'No confirmed crop damage, confirmed water stress, or yield status is inferred.',
      'No NPK, pH, ECe, ET, or exact irrigation prescription is inferred.',
    ],
  };
}

function actionTypeFromText(text) {
  const normalized = String(text).toLowerCase();
  if (normalized.includes('sensor') || normalized.includes('node') || normalized.includes('telemetry')) return 'sensor_check';
  if (normalized.includes('quality') || normalized.includes('reliability') || normalized.includes('missing') || normalized.includes('valid')) return 'data_quality';
  if (normalized.includes('irrigation') || normalized.includes('moisture') || normalized.includes('pivot')) return 'irrigation_review';
  if (normalized.includes('field') || normalized.includes('inspect')) return 'field_check';
  return 'monitoring';
}

function normalizeActionType(value, fallbackText) {
  if (value === 'field_check' || value === 'sensor_check' || value === 'data_quality' || value === 'irrigation_review' || value === 'monitoring') return value;
  if (value === 'irrigation') return 'irrigation_review';
  if (value === 'system_check' || value === 'agronomist_review') return actionTypeFromText(fallbackText);
  return actionTypeFromText(fallbackText);
}

function buildFallbackActionPlan(recommendedChecks, maxConfidence) {
  const checks = recommendedChecks.length
    ? recommendedChecks
    : [
        'Inspect the relevant field area and compare plant appearance with the dashboard trend.',
        'Check sensor placement, recent readings, and reliability flags before interpreting the window.',
        'Review irrigation notes and moisture trend direction without treating the report as an irrigation prescription.',
      ];

  return checks.slice(0, 5).map((check, index) => ({
    title: index === 0 ? 'Field-check the reported condition' : `Review item ${index + 1}`,
    priority: index === 0 ? 'high' : 'medium',
    type: normalizeActionType(null, check),
    rationale: check,
    confidence: normalizeConfidence(index === 0 ? 'medium' : 'low', maxConfidence),
  }));
}

function buildPivotFallback(keyObservations, maxConfidence) {
  const pivotRelated = keyObservations.filter((item) => {
    const text = `${item?.title ?? ''} ${item?.description ?? ''}`.toLowerCase();
    return text.includes('pivot') || text.includes('main') || text.includes('n2') || text.includes('soil') || text.includes('moisture');
  });

  return pivotRelated.slice(0, 3).map((item, index) => ({
    pivot: item.title || `Observation ${index + 1}`,
    observation: item.description || item.title || 'A pivot-related observation is available from deterministic summaries.',
    evidence: Array.isArray(item.evidence) ? item.evidence.filter((entry) => typeof entry === 'string') : [],
    confidence: normalizeConfidence(item.confidence, maxConfidence),
    limitation: 'Interpret as monitoring guidance only; field verification is required.',
  }));
}

function extractReportMeta(input) {
  const reportContext = input?.report_context;
  const reportMode = reportContext?.report_mode ?? 'standard';
  const reliabilityLevel = input?.reliability?.overall_confidence ?? 'invalid';
  // For multi-snapshot, check snapshot nodes
  const nodesReliability = input?.reliability?.nodes ?? [];
  const hasLowOrInvalidReliability =
    reliabilityLevel === 'low' || reliabilityLevel === 'invalid'
    || nodesReliability.some((n) => n.reliability_level === 'low' || n.reliability_level === 'invalid');

  return { reportMode, hasLowOrInvalidReliability };
}

function getSafeRequestMeta(input) {
  const validCount = input?.report_context?.sample_size?.valid_count;
  return {
    report_mode: input?.report_context?.report_mode ?? 'standard',
    analysis_type: input?.analysis_type ?? 'unknown',
    valid_count: typeof validCount === 'number' ? validCount : null,
    timeout_ms: GEMINI_UPSTREAM_TIMEOUT_MS,
  };
}

function normalizeGeminiInsightOutput(parsed, input) {
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;

  const { reportMode, hasLowOrInvalidReliability } = extractReportMeta(input);
  // For small_dataset_demo with low/invalid reliability, cap confidence at 'medium'
  const maxConfidence = (reportMode === 'small_dataset_demo' && hasLowOrInvalidReliability) ? 'medium' : null;

  const source = parsed;
  const keyObservations = Array.isArray(source.key_observations) ? source.key_observations : [];
  const risks = Array.isArray(source.risks) ? source.risks : [];
  const hypotheses = Array.isArray(source.hypotheses) ? source.hypotheses.filter((item) => typeof item === 'string') : [];
  const recommendedChecks = Array.isArray(source.recommended_checks) ? source.recommended_checks.filter((item) => typeof item === 'string') : [];

  // Merge Gemini's not_claimed with REQUIRED_NOT_CLAIMED (deduplicated)
  const geminiNotClaimed = Array.isArray(source.not_claimed) ? source.not_claimed.filter((item) => typeof item === 'string') : [];
  const mergedNotClaimed = [...new Set([...REQUIRED_NOT_CLAIMED, ...geminiNotClaimed])];

  // Normalize pivot_observations
  const pivotObservations = Array.isArray(source.pivot_observations)
    ? source.pivot_observations
      .filter((p) => p && typeof p === 'object')
      .map((p) => ({
        pivot: typeof p.pivot === 'string' ? p.pivot : 'Unknown pivot',
        observation: typeof p.observation === 'string' ? p.observation : '',
        evidence: Array.isArray(p.evidence) ? p.evidence.filter((e) => typeof e === 'string') : [],
        confidence: normalizeConfidence(p.confidence, maxConfidence),
        limitation: typeof p.limitation === 'string' ? p.limitation : '',
      }))
    : [];

  // Normalize action_plan
  const VALID_PRIORITIES = new Set(['high', 'medium', 'low']);
  const VALID_ACTION_TYPES = new Set(['field_check', 'sensor_check', 'data_quality', 'irrigation_review', 'monitoring']);
  const actionPlan = Array.isArray(source.action_plan)
    ? source.action_plan
      .filter((a) => a && typeof a === 'object')
      .map((a) => ({
        title: typeof a.title === 'string' ? a.title : 'Action item',
        priority: VALID_PRIORITIES.has(a.priority) ? a.priority : 'medium',
        type: VALID_ACTION_TYPES.has(a.type) ? a.type : normalizeActionType(a.type, `${a.title ?? ''} ${a.rationale ?? ''}`),
        rationale: typeof a.rationale === 'string' ? a.rationale : '',
        confidence: normalizeConfidence(a.confidence, maxConfidence),
      }))
    : [];

  // Normalize data_quality_interpretation
  const dqi = source.data_quality_interpretation;
  const dataQualityInterpretation = dqi && typeof dqi === 'object' && !Array.isArray(dqi)
    ? {
        usable_for: Array.isArray(dqi.usable_for) ? dqi.usable_for.filter((s) => typeof s === 'string') : [],
        not_usable_for: Array.isArray(dqi.not_usable_for) ? dqi.not_usable_for.filter((s) => typeof s === 'string') : [],
      }
    : null;

  // Normalize plant_health_caution
  const phc = source.plant_health_caution;
  const plantHealthCaution = phc && typeof phc === 'object' && !Array.isArray(phc)
    ? {
        not_diagnosed: Array.isArray(phc.not_diagnosed) ? phc.not_diagnosed.filter((s) => typeof s === 'string') : [],
      }
    : null;

  const result = {
    summary: typeof source.summary === 'string' && source.summary.trim()
      ? source.summary
      : 'AI interpretation was returned without a summary. Review limitations before use.',
    confidence: normalizeConfidence(source.confidence, maxConfidence),
    key_observations: keyObservations
      .filter((item) => item && typeof item === 'object' && !Array.isArray(item))
      .map((item) => ({
        title: typeof item.title === 'string' ? item.title : 'Observation',
        description: typeof item.description === 'string' ? item.description : 'No description provided by AI output.',
        confidence: normalizeConfidence(item.confidence, maxConfidence),
        evidence: Array.isArray(item.evidence) ? item.evidence.filter((e) => typeof e === 'string') : [],
        limitations: Array.isArray(item.limitations) ? item.limitations.filter((e) => typeof e === 'string') : [],
      })),
    risks: risks
      .filter((risk) => risk && typeof risk === 'object' && !Array.isArray(risk))
      .map((risk) => ({
        title: typeof risk.title === 'string' ? risk.title : 'Risk item',
        severity: ['info', 'warning', 'error'].includes(risk.severity) ? risk.severity : 'info',
        confidence: normalizeConfidence(risk.confidence, maxConfidence),
        explanation: typeof risk.explanation === 'string' ? risk.explanation : 'No explanation provided by AI output.',
        limitations: Array.isArray(risk.limitations) ? risk.limitations.filter((item) => typeof item === 'string') : [],
      })),
    hypotheses,
    recommended_checks: recommendedChecks,
    not_claimed: mergedNotClaimed,
  };

  if (['standard', 'small_dataset_demo'].includes(source.report_mode)) {
    result.report_mode = source.report_mode;
  } else {
    result.report_mode = reportMode;
  }
  const firstObservation = sentenceFromObservation(result.key_observations[0]);
  const irrigationObservation = result.key_observations
    .map(sentenceFromObservation)
    .find((item) => /irrigation|moisture|pivot/i.test(item));

  result.executive_summary = firstNonEmptyString(source.executive_summary, result.summary);
  result.farm_state = firstNonEmptyString(source.farm_state, firstObservation, result.summary);
  result.pivot_observations = pivotObservations.length ? pivotObservations : buildPivotFallback(result.key_observations, maxConfidence);
  result.weather_context = firstNonEmptyString(
    source.weather_context,
    'Weather context is limited or unavailable in the selected window.',
  );
  result.irrigation_context = firstNonEmptyString(
    source.irrigation_context,
    irrigationObservation,
    'Irrigation response cannot be confirmed from the current limited dataset.',
  );
  result.data_quality_interpretation = dataQualityInterpretation ?? buildDataQualityFallback(input, hasLowOrInvalidReliability);
  result.plant_health_caution = plantHealthCaution ?? buildPlantHealthFallback();
  result.why_this_matters = firstNonEmptyString(
    source.why_this_matters,
    'This pipeline connects sensing, deterministic quality control, reliability scoring, alert review, and AI-assisted interpretation so the dashboard can explain what the data suggests while keeping final agronomic decisions tied to field checks and validated measurements.',
  );
  result.action_plan = actionPlan.length ? actionPlan : buildFallbackActionPlan(recommendedChecks, maxConfidence);
  result.limitations = Array.isArray(source.limitations)
    ? source.limitations.filter((s) => typeof s === 'string')
    : [
        'Small Dataset Demo Mode supports thesis/demo interpretation and field-check guidance only.',
        'The report does not replace agronomist review, calibration, or field inspection.',
      ];

  return result;
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
    const requestMeta = getSafeRequestMeta(input);
    const request_id = crypto.randomUUID();
    const startTime = Date.now();

    console.info('[gemini] request start', { request_id, ...requestMeta, payload_size_bytes: JSON.stringify(input).length });

    const requestBody = JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: JSON.stringify(input) }] }],
      systemInstruction: { parts: [{ text: GEMINI_SYSTEM_PROMPT }] },
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: GEMINI_INSIGHT_RESPONSE_SCHEMA,
      },
    });

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      const attemptStart = Date.now();
      console.info('[gemini] attempt start', { request_id, attempt });

      let response;
      try {
        response = await fetch(`${GEMINI_API_URL}/${model}:generateContent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': apiKey,
          },
          signal: AbortSignal.timeout(GEMINI_UPSTREAM_TIMEOUT_MS),
          body: requestBody,
        });
      } catch (fetchError) {
        const duration_ms = Date.now() - attemptStart;
        const isTimeout = fetchError?.name === 'TimeoutError';
        const error_type = isTimeout ? 'timeout' : 'network';
        const retryable = attempt < MAX_ATTEMPTS;
        console.warn('[gemini] attempt error', { request_id, attempt, error_type, duration_ms, retryable });

        if (retryable) {
          await sleep(RETRY_DELAYS_MS[attempt - 1] + jitter());
          continue;
        }

        console.info('[gemini] request end', { request_id, success: false, attempts: attempt, total_duration_ms: Date.now() - startTime });
        if (isTimeout) {
          return { status: 503, error: 'ai_provider_timeout', message: 'Gemini did not respond in time. Try a smaller report window.', retryable: true, request_id };
        }
        return { status: 503, error: 'ai_provider_unavailable', message: 'Gemini is temporarily unavailable. Please retry in a moment.', retryable: true, request_id };
      }

      const duration_ms = Date.now() - attemptStart;
      console.info('[gemini] attempt response', { request_id, attempt, status: response.status, duration_ms });

      if (!response.ok) {
        const shouldRetry = attempt < MAX_ATTEMPTS && isRetryableStatus(response.status);
        console.warn('[gemini] attempt error', { request_id, attempt, error_type: 'http_error', duration_ms, retryable: shouldRetry, status: response.status });

        if (shouldRetry) {
          await sleep(RETRY_DELAYS_MS[attempt - 1] + jitter());
          continue;
        }

        console.info('[gemini] request end', { request_id, success: false, attempts: attempt, total_duration_ms: Date.now() - startTime });
        if (isRetryableStatus(response.status)) {
          return { status: 503, error: 'ai_provider_unavailable', message: 'Gemini is temporarily unavailable. Please retry in a moment.', retryable: true, provider_status: response.status, request_id };
        }
        return { status: 502, error: 'gemini_http_error', message: `Gemini API returned HTTP ${response.status}.`, request_id };
      }

      // 2xx response — parse and validate (no further retries)
      let responseJson;
      try {
        responseJson = await response.json();
      } catch {
        console.info('[gemini] request end', { request_id, success: false, attempts: attempt, total_duration_ms: Date.now() - startTime });
        return { status: 502, error: 'gemini_invalid_response', message: 'Gemini response is not valid JSON.', request_id };
      }

      const text = responseJson?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (typeof text !== 'string') {
        console.info('[gemini] request end', { request_id, success: false, attempts: attempt, total_duration_ms: Date.now() - startTime });
        return { status: 502, error: 'gemini_invalid_json', message: 'Gemini response did not include JSON text output.', request_id };
      }

      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch {
        console.info('[gemini] request end', { request_id, success: false, attempts: attempt, total_duration_ms: Date.now() - startTime });
        return { status: 502, error: 'gemini_invalid_json', message: 'Gemini output is not valid JSON.', request_id };
      }

      const normalized = normalizeGeminiInsightOutput(parsed, input);
      if (!normalized || !isValidOutputShape(normalized)) {
        console.warn('[gemini] invalid output shape', {
          request_id,
          hasSummary: typeof parsed?.summary === 'string',
          hasConfidence: typeof parsed?.confidence === 'string',
          hasKeyObservations: Array.isArray(parsed?.key_observations),
          hasRisks: Array.isArray(parsed?.risks),
          hasHypotheses: Array.isArray(parsed?.hypotheses),
          hasRecommendedChecks: Array.isArray(parsed?.recommended_checks),
          hasNotClaimed: Array.isArray(parsed?.not_claimed),
        });
        console.info('[gemini] request end', { request_id, success: false, attempts: attempt, total_duration_ms: Date.now() - startTime });
        return { status: 502, error: 'gemini_invalid_shape', message: 'Gemini output is missing required fields.', request_id };
      }

      console.info('[gemini] request end', { request_id, success: true, attempts: attempt, total_duration_ms: Date.now() - startTime });
      return { status: 200, data: normalized };
    }

    // Unreachable: loop always returns, but satisfies static analysis
    console.info('[gemini] request end', { request_id, success: false, attempts: MAX_ATTEMPTS, total_duration_ms: Date.now() - startTime });
    return { status: 503, error: 'ai_provider_unavailable', message: 'Gemini is temporarily unavailable. Please retry in a moment.', retryable: true, request_id };
  }
}

export const geminiService = new GeminiService();
