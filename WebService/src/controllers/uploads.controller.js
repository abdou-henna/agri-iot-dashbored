import { uploadsService } from '../services/uploads.service.js';

export async function getUploads(req, res, next) {
  try {
    const {
      gateway_id,
      status,
      from,
      to,
      limit = 100,
      offset = 0
    } = req.query;

    const uploads = await uploadsService.getUploads({
      gatewayId: gateway_id,
      status,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
      limit: Math.min(parseInt(limit) || 100, 1000),
      offset: parseInt(offset) || 0
    });

    res.json({
      uploads,
      count: uploads.length
    });
  } catch (error) {
    next(error);
  }
}
