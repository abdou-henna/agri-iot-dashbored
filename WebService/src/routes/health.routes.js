import express from 'express';
import { testConnection } from '../db.js';

const router = express.Router();

// GET /health
router.get('/', async (req, res) => {
  try {
    const dbConnected = await testConnection();

    const health = {
      status: dbConnected ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: dbConnected ? 'connected' : 'disconnected',
      environment: process.env.NODE_ENV || 'development'
    };

    res.status(dbConnected ? 200 : 503).json(health);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    });
  }
});

export default router;