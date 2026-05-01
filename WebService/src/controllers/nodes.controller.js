import { nodesService } from '../services/nodes.service.js';

export async function getNodes(req, res, next) {
  try {
    const nodes = await nodesService.getNodes();
    res.json({ nodes });
  } catch (error) {
    next(error);
  }
}
