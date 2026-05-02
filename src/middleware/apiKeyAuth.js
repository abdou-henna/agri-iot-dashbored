import { CONFIG } from '../config.js';

export function apiKeyAuth(req, res, next) {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({
      error: 'API key required',
      message: 'x-api-key header is required for this endpoint'
    });
  }

  const expectedKey = process.env.API_KEY;
  if (!expectedKey) {
    console.error('API_KEY environment variable not set');
    return res.status(500).json({
      error: 'Server configuration error'
    });
  }

  if (apiKey !== expectedKey) {
    return res.status(403).json({
      error: 'Invalid API key',
      message: 'The provided API key is not valid'
    });
  }

  next();
}