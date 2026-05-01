# API Requirements for Dashboard

This document lists every backend endpoint the dashboard needs. It distinguishes between endpoints that already exist (possibly needing enhancement) and new endpoints that must be added to the WebService.

Base path: `GET /api/v1/...`
Authentication: currently public for GET endpoints. A read-only API key or session token should be added before exposing to the internet (see Security notes at the end).

---

## Existing Endpoints — Required Enhancements

### GET /api/v1/readings

**Currently exists.** Needs the following additions:

**Missing fields in SELECT** (must be added to `readings.service.js`):
- `node_seq`
- `frame_id`
- `error_code`
- `upload_id`
- `received_at`

> `raw_payload` is a large JSONB column; exclude it from the default response. Add a separate `GET /api/v1/readings/:record_id` endpoint to fetch raw_payload on demand.

**Missing filter parameters:**
- `status` — filter by `ok`, `missing`, `error`, `partial`
- `upload_id` — filter readings that arrived in a specific upload session

**Pagination required:**
- `limit` already exists (max 1000)
- Add `offset` or cursor-based pagination (`before_id` parameter using the `id` BIGSERIAL primary key)

**Aggregation variant needed** (see new endpoint below).

---

### GET /api/v1/events

**Currently exists.** Needs the following additions:

**Missing fields in SELECT** (must be added to `status.service.js`):
- `error_code`
- `upload_id`
- `received_at`

**Missing filter parameters:**
- `error_code` — filter by error code string
- `upload_id` — filter events from a specific upload session
- `node_id` — currently missing (only `gateway_id` and `severity` and `event_type` are filterable)

**Pagination required:**
- Same approach as readings (offset or cursor)

---

### GET /api/v1/status

**Currently exists.** Used by Overview and System Health pages. No changes needed for the current design. Already returns:
- `gateways` array (gateway_id, name, last_seen_at, last_upload_at, last_upload_id, firmware_version)
- `latest_readings` array (node_id, node_type, measured_at, status, battery_status)
- `recent_warnings_errors` array (last 10 events with severity warning/error/critical in 24h)
- `server_time`

Enhancement to consider: also return `nodes` table data (last_seq per node) for the System Health page.

---

## New Endpoints Required

### GET /api/v1/readings/aggregate

Time-series aggregation endpoint. Required by all chart pages to avoid transferring thousands of individual points for 30d views.

**Query parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `node_id` | string | yes | `MAIN`, `N2`, or `N3` |
| `metric` | string | yes | One of: `soil_temperature_c`, `soil_moisture_percent`, `soil_ec_us_cm`, `air_temperature_c`, `air_humidity_percent`, `air_pressure_hpa`, `rssi`, `snr` |
| `from` | ISO 8601 | yes | Start of range |
| `to` | ISO 8601 | yes | End of range |
| `bucket` | string | yes | `10min`, `1hour`, `1day` |

**Response body:**

```json
{
  "node_id": "N2",
  "metric": "soil_moisture_percent",
  "bucket": "1hour",
  "from": "2026-04-18T00:00:00Z",
  "to": "2026-04-25T23:59:59Z",
  "points": [
    {
      "bucket_start": "2026-04-25T09:00:00Z",
      "avg": 38.4,
      "min": 36.1,
      "max": 40.2,
      "count": 6,
      "missing_count": 0
    }
  ]
}
```

`missing_count` = number of status=missing readings within the bucket (used to show partial-data warning on chart).

**SQL pattern (PostgreSQL):**

```sql
SELECT
  date_trunc($bucket, measured_at) AS bucket_start,
  AVG(soil_moisture_percent)       AS avg,
  MIN(soil_moisture_percent)       AS min,
  MAX(soil_moisture_percent)       AS max,
  COUNT(*)                         AS count,
  COUNT(*) FILTER (WHERE status = 'missing') AS missing_count
FROM sensor_readings
WHERE node_id = $node_id
  AND measured_at BETWEEN $from AND $to
  AND soil_moisture_percent IS NOT NULL
GROUP BY bucket_start
ORDER BY bucket_start ASC
```

---

### GET /api/v1/uploads

Upload session history. Required by Upload History page.

**Query parameters:**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `gateway_id` | string | — | Filter by gateway |
| `from` | ISO 8601 | — | Filter by received_at |
| `to` | ISO 8601 | — | Filter by received_at |
| `limit` | integer | 50 | Max rows returned |
| `offset` | integer | 0 | Pagination offset |

**Response body:**

```json
{
  "uploads": [
    {
      "upload_id": "UPL-GW01-20260425-103000",
      "gateway_id": "GW01",
      "started_at": "2026-04-25T10:30:00Z",
      "finished_at": null,
      "received_at": "2026-04-25T10:30:15Z",
      "source": "esp32",
      "records_count": 0,
      "events_count": 0,
      "status": "received",
      "notes": null,
      "raw_summary": { "readings_count": 288, "events_count": 12 }
    }
  ],
  "count": 1
}
```

> Note: `records_count` in the uploads table defaults to 0 and may not be updated by the current WebService. The actual count is available in `raw_summary.readings_count`. The dashboard should display `raw_summary.readings_count` as the authoritative count. (See data_contract.md assumption A4.)

---

### GET /api/v1/readings/:record_id

Single reading detail, including `raw_payload`. Used for deep debug from System Health page.

**Response:** Full `sensor_readings` row including `raw_payload` JSONB.

---

### GET /api/v1/events/aggregate

Event count aggregated by day and severity. Used for the mini histogram on the Logs page and the Upload History chart.

**Query parameters:** `from`, `to`, `node_id` (optional), `gateway_id` (optional)

**Response:**

```json
{
  "points": [
    {
      "day": "2026-04-25",
      "info": 42,
      "warning": 3,
      "error": 1,
      "critical": 0
    }
  ]
}
```

---

### GET /api/v1/nodes

Returns all rows from the `nodes` table. Used by System Health page.

**Response:**

```json
{
  "nodes": [
    {
      "node_id": "N2",
      "node_type": "soil",
      "name": null,
      "gateway_id": "GW01",
      "created_at": "2026-04-01T00:00:00Z",
      "last_seen_at": "2026-04-25T10:00:00Z",
      "last_seq": 124
    }
  ]
}
```

---

## Endpoint Priority for Build Phases

| Priority | Endpoint | Needed for |
|---|---|---|
| P0 | GET /api/v1/readings (enhanced) | All soil and weather chart pages |
| P0 | GET /api/v1/events (enhanced) | Logs page |
| P0 | GET /api/v1/status (existing) | Overview, System Health |
| P1 | GET /api/v1/readings/aggregate | 7d and 30d chart performance |
| P1 | GET /api/v1/uploads | Upload History page |
| P1 | GET /api/v1/nodes | System Health node cards |
| P2 | GET /api/v1/events/aggregate | Logs histogram, Upload History chart |
| P2 | GET /api/v1/readings/:record_id | Deep debug raw_payload view |

---

## Security Notes

Current read endpoints are public (no authentication). Before production exposure:

1. Add a read-only API key or Bearer token header check to all dashboard GET endpoints.
2. Rate-limit dashboard endpoints independently from the firmware upload endpoint.
3. The firmware POST `/api/v1/upload` uses a separate write key (`x-api-key`); do not reuse this key for dashboard reads.
4. Consider CORS configuration: allow only the dashboard origin domain.

---

## Response Format Conventions

All responses use `Content-Type: application/json`.
Timestamps are always ISO 8601 UTC (`2026-04-25T10:00:00Z` or `2026-04-25T10:00:00.000Z`).
Null values are returned as JSON `null`, not as empty strings or omitted keys.
HTTP 200 = success. HTTP 400 = bad query params (with `error` field). HTTP 500 = server error.


---

# Revision Addendum — Manual Agronomic Event API

## New Endpoints Required

### GET /api/v1/agronomic-events

Returns manual agronomic events.

**Query parameters:**

| Parameter | Type | Description |
|---|---|---|
| `event_category` | string | irrigation, cutting, fertilization, yield, field_note, season_setup |
| `event_type` | string | specific type |
| `target_scope` | string | farm, pivot_1, pivot_2, both_pivots |
| `from` | ISO 8601 | start date |
| `to` | ISO 8601 | end date |
| `limit` | integer | default 100 |
| `offset` | integer | pagination |

### POST /api/v1/agronomic-events

Creates a manual event.

Used by:
- Start irrigation
- End irrigation
- Backfill irrigation
- Add cutting
- Add yield
- Add fertilization
- Add field note
- Season setup forms

### PATCH /api/v1/agronomic-events/:agro_event_id

Edits a manual event.

Required because field data may be entered after the fact or corrected.

### DELETE /api/v1/agronomic-events/:agro_event_id

Optional. If implemented, prefer soft-delete with `deleted_at`.

---

## Special Workflow: Irrigation Session

### POST /api/v1/agronomic-events/irrigation/start

Creates active irrigation session:

```json
{
  "target_scope": "both_pivots",
  "started_at": "2026-05-01T06:10:00Z",
  "confidence": "exact",
  "notes": ""
}
```

### POST /api/v1/agronomic-events/irrigation/:id/end

Ends active session:

```json
{
  "ended_at": "2026-05-01T08:00:00Z",
  "notes": "Normal irrigation"
}
```

### Backfill

Use normal POST with both `started_at` and `ended_at`, or `duration_min`.

---

## Reminder Endpoints

### GET /api/v1/reminders

Returns computed dashboard reminders.

Examples:
- irrigation not recorded today
- cutting may be due
- yield missing after cutting
- emergence date missing after planting
- season end not recorded

Reminders can be computed server-side or client-side in Phase 1, but server-side is preferred later.

---

## Security Note

Manual-event write endpoints must not use the firmware upload key. Use dashboard/operator authentication or a separate dashboard write token.


---

# Core Architecture Rule — Data Separation (Non-Negotiable)

The system enforces strict separation between three data domains:

1. Sensor Data (`sensor_readings`)
2. Agronomic Manual Data (`agronomic_events`)
3. System Logs (`system_events`)

## Rules

- These datasets MUST NOT be merged at storage level.
- They MUST NOT share tables or schemas.
- They MUST NOT be displayed as a single dataset.

## Integration Strategy

Integration happens ONLY at:

- Chart overlays
- Time-aligned analytics
- Insight generation
- Cross-navigation between pages

## Forbidden

- Joining readings + logs into one table
- Treating agronomic events as sensor data
- Mixing logs into agronomy workflows

## Allowed

- Overlay irrigation on moisture chart
- Overlay fertilization on EC chart
- Link logs to readings via time window
- Show confidence layer combining all sources

## Guiding Principle

"Separate at storage, integrate at interpretation."

