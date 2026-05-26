import { geminiService } from '../services/gemini.service.js';

const MAX_INPUT_BYTES = 120000;

export async function postGeminiInsight(req, res) {
  const bodySize = Buffer.byteLength(JSON.stringify(req.body ?? {}));
  if (bodySize > MAX_INPUT_BYTES) {
    return res.status(413).json({ error: 'ai_payload_too_large', message: 'The AI report context is too large. Try a smaller report window.', retryable: false });
  }

  const { input } = req.body ?? {};
  const validationError = geminiService.validateInput(input);

  if (validationError) {
    return res.status(400).json({ error: validationError.code, message: validationError.message });
  }

  const result = await geminiService.generateInsight(input);
  if (result.error) {
    return res.status(result.status).json({ error: result.error, message: result.message });
  }

  return res.json(result.data);
}
