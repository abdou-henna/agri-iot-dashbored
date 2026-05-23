# Upload API Listing for Thesis

This listing is a thesis-oriented explanation of the upload mechanism. It is not a full source-code dump.

## Purpose

The upload API receives stored field data from the MAIN ESP32 gateway after offline collection. The uploaded payload may contain sensor readings, system events, and upload metadata. The backend must preserve measurement timestamps and must not replace `measured_at` with upload time.

## Conceptual endpoint

```http
POST /api/v1/upload
Content-Type: application/json
Authorization: Bearer <device-or-dashboard-token>
```

## Conceptual payload structure

```json
{
  "gateway_id": "GW01",
  "upload_id": "UP-2026-032",
  "started_at": "2026-05-06T23:55:00Z",
  "records": [
    {
      "type": "reading",
      "record_id": "GW01-MAIN-SOIL-4104465",
      "node_id": "MAIN",
      "node_type": "soil",
      "frame_id": 4104465,
      "measured_at": "2026-05-06T00:00:00Z",
      "soil_moisture_percent": 28.2,
      "soil_temperature_c": 20.3,
      "soil_ec_us_cm": 1175,
      "status": "ok"
    }
  ],
  "events": []
}
```

## Processing logic

```text
1. Receive upload request from MAIN gateway.
2. Validate JSON structure and gateway identity.
3. Insert upload session metadata into uploads table.
4. Insert sensor rows into sensor_readings using measured_at as the canonical measurement time.
5. Insert system events into system_events using event_time as the canonical event time.
6. Preserve upload time only as transfer/audit metadata.
7. Return a processing summary to the device/dashboard.
```

## Thesis note

The upload endpoint is part of the offline-first architecture. It decouples data collection from dashboard availability while preserving field measurement time.
