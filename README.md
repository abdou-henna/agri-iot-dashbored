# IoT Agricultural Monitoring WebService

This is the backend API service for the Smart Farm IoT monitoring system. It provides endpoints for ESP32 Main Nodes to upload sensor data collected from soil and weather nodes via LoRa communication.

**Important:** This WebService is API-only and does not include any frontend dashboard. The final dashboard will be built separately and will consume these API endpoints.

## Features

- RESTful API for data uploads from ESP32 devices
- PostgreSQL database storage
- API key authentication for write operations
- Clean GET endpoints for future dashboard integration
- Comprehensive error handling and validation
- Render deployment ready

## Technology Stack

- Node.js with Express.js
- PostgreSQL database
- Environment-based configuration
- ES Modules

## Database Schema

The service uses the following PostgreSQL tables:

- `gateways` - Gateway/Main Node information
- `nodes` - Remote node metadata
- `sensor_readings` - Sensor data from all nodes
- `system_events` - Error and system events
- `uploads` - Upload session tracking

## API Endpoints

### Public Endpoints

- `GET /` - Service information
- `GET /health` - Health check with DB connectivity
- `GET /api/v1/server-time` - Current server time

### Protected Endpoints (require API key)

- `POST /api/v1/upload` - Upload sensor readings and events

### Future Dashboard Endpoints

- `GET /api/v1/readings` - Query sensor readings
- `GET /api/v1/events` - Query system events
- `GET /api/v1/status` - System status summary

## Local Development Setup

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Git

### Installation

1. Clone or copy this project to your local machine
2. Navigate to the WebService directory
3. Install dependencies:
   ```bash
   npm install
   ```

### Local Environment Configuration

1. Copy `.env.example` to `.env`
2. Fill in your local values:
   ```env
   PORT=3000
   DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE
   API_KEY=change-me-to-a-long-secret-key
   NODE_ENV=development
   ```
3. Keep `.env` local only and never commit it to GitHub.

### Database Setup

1. Create a PostgreSQL database
2. Initialize the schema locally with:
   ```bash
   npm run migrate
   ```

### Running Locally

Start the development server:
```bash
npm run dev
```

Or production mode:
```bash
npm start
```

The server will start on the port specified in your `.env` file (default: 3000).

## Testing the API

### Health Check
```bash
curl http://localhost:3000/health
```

### Upload Data (requires API key)
```bash
curl -X POST http://localhost:3000/api/v1/upload \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_api_key" \
  -d @test_upload.json
```

Example `test_upload.json`:
```json
{
  "upload_id": "UP-GW01-20260425-001",
  "gateway": {
    "gateway_id": "GW01",
    "firmware_version": "1.0.0"
  },
  "upload": {
    "started_at": "2026-04-25T10:00:00Z",
    "finished_at": "2026-04-25T10:01:20Z",
    "source": "esp32",
    "notes": "manual_button_upload"
  },
  "readings": [
    {
      "record_id": "GW01-N2-000001",
      "node_id": "N2",
      "node_type": "soil",
      "node_seq": 1,
      "frame_id": 1001,
      "measured_at": "2026-04-25T09:50:20Z",
      "rssi": -94,
      "snr": 7.5,
      "battery_mv": null,
      "battery_percent": null,
      "battery_status": "not_measured",
      "soil_temperature_c": 21.4,
      "soil_moisture_percent": 38.2,
      "soil_ec_us_cm": 1450,
      "soil_ph": 6.7,
      "status": "ok"
    }
  ],
  "events": [
    {
      "event_id": "EV-GW01-20260425-0001",
      "event_type": "upload_started",
      "severity": "info",
      "event_time": "2026-04-25T10:00:00Z",
      "message": "Upload session started",
      "details": {}
    }
  ]
}
```

## Deployment to Render

### Render Settings

- Root Directory: `WebService`
- Build Command: `npm install`
- Start Command: `npm start`

### Environment Variables

Set these values in Render Environment Variables:

- `DATABASE_URL`
- `API_KEY`
- `NODE_ENV=production`

Render automatically sets `PORT` for your service.

### Use Render Internal Database URL

If you are using Render PostgreSQL, set `DATABASE_URL` to the Internal Database URL provided by Render. Do not hardcode any secret values in source files, README examples, or package files.

### Deployment Steps

1. Create a new Web Service on Render
2. Connect your Git repository
3. Add required environment variables in the Render dashboard
4. Deploy

## Security Notes

- The API key is required for all write operations
- Read endpoints are currently public for development
- In production, consider adding authentication to read endpoints
- Store API keys securely and rotate regularly

## System Constraints

- No permanent internet connection on ESP32 devices
- Data collected locally on SD cards
- Manual upload trigger via button press
- Battery monitoring not yet implemented (fields nullable)
- No NPK measurements in this system

## Future Enhancements

- Add authentication for read endpoints
- Implement rate limiting
- Add data export endpoints
- Add real-time WebSocket support
- Integrate with dashboard frontend