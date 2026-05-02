import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './db.js';
import { migrateDatabase } from './migrate.js';
import { errorHandler } from './middleware/errorHandler.js';

// Import routes
import healthRoutes from './routes/health.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import readingsRoutes from './routes/readings.routes.js';
import statusRoutes from './routes/status.routes.js';
import eventsRoutes from './routes/events.routes.js';
import uploadsRoutes from './routes/uploads.routes.js';
import nodesRoutes from './routes/nodes.routes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: '10mb' })); // Allow large payloads for batch uploads

// Routes
app.get('/', (req, res) => {
  res.json({
    service: 'Smart Farm IoT WebService',
    type: 'api-only',
    status: 'running',
    version: '1.0.0'
  });
});

app.use('/health', healthRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/readings', readingsRoutes);
app.use('/api/v1/events', eventsRoutes);
app.use('/api/v1/status', statusRoutes);
app.use('/api/v1/uploads', uploadsRoutes);
app.use('/api/v1/nodes', nodesRoutes);
app.use('/api/v1/server-time', (req, res) => {
  res.json({
    server_time: new Date().toISOString(),
    unix_ms: Date.now()
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
async function startServer() {
  try {
    // Initialize schema before starting the application
    await migrateDatabase();

    // Test database connection
    await connectDB();
    console.log('Database connected successfully');

    app.listen(PORT, () => {
      console.log(`IoT WebService running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message || error);
    process.exit(1);
  }
}

startServer();
