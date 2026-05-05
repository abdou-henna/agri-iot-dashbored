import { geminiService } from '../services/gemini.service.js';

export async function postGeminiInsight(req, res) {
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
