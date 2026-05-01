# Data Contract

Source of truth: `WebService/sql/001_init.sql` + `002_patch.sql` + firmware upload payload.
No field may be displayed in the dashboard unless it exists in one of these sources.

---

## Pivot / Node Mapping

| Dashboard label | `node_id` | `node_type` | Physical source |
|---|---|---|---|
| Pivot 1 | `"MAIN"` | `"soil"` | Main Node RS485 local soil sensor |
| Pivot 2 | `"N2"` | `"soil"` | Node2 ESP32-C3 RS485 soil sensor via LoRa |
| Weather | `"N3"` | `"weather"` | Node3 ESP32-C3 BME280 via LoRa |
| Gateway | `"GW01"` | — | Main Node ESP32 gateway |

Weather data belongs to neither pivot. It is shared environmental context.

---

## sensor_readings Table — Full Field Reference

### Always-present fields

| Column | Type | Description |
|---|---|---|
| `record_id` | TEXT UNIQUE | Format: `GW01-N2-00000124`, `GW01-N3-00004511` |
| `upload_id` | TEXT NULL | Upload session that inserted this row (nullable per migration 002) |
| `gateway_id` | TEXT | Always `"GW01"` in current deployment |
| `node_id` | TEXT | `"MAIN"`, `"N2"`, or `"N3"` |
| `node_type` | TEXT | `"soil"`, `"weather"`, or `"main"` |
| `node_seq` | INTEGER NULL | Sequence counter from node firmware; increments per successful reading |
| `frame_id` | BIGINT NULL | 10-minute cycle identifier (`unix_epoch / 600`); 0 if RTC lost power |
| `measured_at` | TIMESTAMPTZ | RTC timestamp added by Main Node at receive time |
| `received_at` | TIMESTAMPTZ | Server wall-clock time when row was inserted |
| `status` | TEXT | `ok`, `partial`, `missing`, `error`, `duplicate` |
| `created_at` | TIMESTAMPTZ | DB row creation time |

### Communication quality (LoRa only — NULL for MAIN local readings)

| Column | Type | Notes |
|---|---|---|
| `rssi` | INTEGER NULL | LoRa received signal strength (dBm); negative values, e.g. −90 |
| `snr` | REAL NULL | LoRa signal-to-noise ratio (dB) |

> **Assumption A1:** MAIN (Pivot 1 local RS485) readings will have `rssi = NULL` and `snr = NULL` because no LoRa link is involved. The firmware does not set these fields for local readings. **Open question:** confirm that `rssi`/`snr` are explicitly omitted in the MAIN upload payload.

### Battery (always NULL / "not_measured" in current hardware)

| Column | Type | Notes |
|---|---|---|
| `battery_mv` | INTEGER NULL | Always NULL — no voltage measurement hardware on any node |
| `battery_percent` | REAL NULL | Always NULL — same reason |
| `battery_status` | TEXT | Always `"not_measured"` |

Do not display battery fields. They carry no information in the current hardware revision.

### Soil sensor fields (Pivot 1 and Pivot 2 only)

| Column | Type | Populated by | Range validated by firmware |
|---|---|---|---|
| `soil_temperature_c` | REAL NULL | MAIN, N2 | −20 to 80 °C (N2) / −20 to 80 °C (MAIN) |
| `soil_moisture_percent` | REAL NULL | MAIN, N2 | 0 to 100 % |
| `soil_ec_us_cm` | REAL NULL | MAIN, N2 | 0 to 20000 µS/cm |
| `soil_ph` | REAL NULL | **NEVER** | Column exists in schema; always NULL; sensor does not provide pH |
| `soil_salinity` | REAL NULL | **NEVER** | Column exists in schema; always NULL; sensor does not provide salinity |

> **Design rule:** `soil_ph` and `soil_salinity` must never appear in any dashboard UI element. They are permanently NULL.

### Weather sensor fields (Weather node only)

| Column | Type | Populated by | Range validated by firmware |
|---|---|---|---|
| `air_temperature_c` | REAL NULL | N3 | −40 to 85 °C |
| `air_humidity_percent` | REAL NULL | N3 | 0 to 100 % |
| `air_pressure_hpa` | REAL NULL | N3 | 300 to 1200 hPa |

### Diagnostic fields

| Column | Type | Notes |
|---|---|---|
| `error_code` | TEXT NULL | Set when `status != 'ok'`; e.g. `SOIL_SENSOR_NO_RESPONSE`, `BME280_NOT_FOUND` |
| `raw_payload` | JSONB NULL | Full JSON as stored; for deep debug only |

---

## system_events Table — Full Field Reference

| Column | Type | Description |
|---|---|---|
| `event_id` | TEXT UNIQUE | Format: `EVT-GW01-YYYYMMDD-HHMMSS-NNN` |
| `upload_id` | TEXT NULL | Upload session this event arrived in |
| `gateway_id` | TEXT | Always `"GW01"` |
| `node_id` | TEXT NULL | `"N2"`, `"N3"`, `"MAIN"`, or NULL for gateway-level events |
| `event_type` | TEXT | See event type reference below |
| `severity` | TEXT | `info`, `warning`, `error`, `critical` |
| `event_time` | TIMESTAMPTZ | RTC timestamp when event occurred on device |
| `received_at` | TIMESTAMPTZ | Server wall-clock time when row was inserted |
| `message` | TEXT NULL | Human-readable description |
| `details` | JSONB NULL | Structured extra data (e.g. `{"drift_s": 47}`) |
| `error_code` | TEXT NULL | Machine-readable error code (e.g. `NODE_TIMEOUT`) |

### Known event_type values (from firmware)

| `event_type` | Severity | Source | Meaning |
|---|---|---|---|
| `upload_started` | info | MAIN | Manual upload triggered by button press |
| `upload_retry` | info | MAIN | HTTP POST attempt N of 3 |
| `upload_success` | info | MAIN | Upload confirmed by server (HTTP 200) |
| `upload_failed` | error | MAIN | All retry attempts exhausted or WiFi timeout |
| `packet_received` | info | MAIN | LoRa packet successfully parsed from N2 or N3 |
| `packet_parse_failed` | error | MAIN | LoRa packet JSON parse error |
| `node_missing` | warning | MAIN | Node did not transmit within expected window |
| `unknown_packet` | warning | MAIN | Received packet from unrecognized node ID |
| `rtc_init_failed` | error | MAIN | DS3231 not found on I2C at boot |
| `rtc_lost_power` | warning | MAIN | DS3231 reports power was lost since last set |
| `rtc_drift_detected` | info | MAIN | Drift exceeds 30 s threshold — correction applied |
| `rtc_sync_applied` | info | MAIN | RTC corrected from server_time |
| `rtc_sync_rejected` | warning | MAIN | server_time invalid or year out of range |
| `lora_init_failed` | error | MAIN | LoRa SX1278 begin() failed |
| `sensor_error` | error | MAIN | Local RS485 soil sensor (Pivot 1) failed |
| `gesture_detected` | info | MAIN | Button gesture recognized (long-press or 4-click) |
| `false_button_wake` | warning | MAIN | EXT0 wake with no valid gesture |
| `time_sync` | info | MAIN | (legacy) RTC synchronized from server |

---

## uploads Table — Field Reference

| Column | Type | Description |
|---|---|---|
| `upload_id` | TEXT UNIQUE | Format: `UPL-GW01-YYYYMMDD-HHMMSS` |
| `gateway_id` | TEXT | Always `"GW01"` |
| `started_at` | TIMESTAMPTZ | Upload session start (device RTC time) |
| `finished_at` | TIMESTAMPTZ NULL | Upload session end (device RTC time; NULL if not set) |
| `received_at` | TIMESTAMPTZ | Server wall-clock receipt time |
| `source` | TEXT | Always `"esp32"` |
| `records_count` | INTEGER | Readings in this upload |
| `events_count` | INTEGER | Events in this upload |
| `status` | TEXT | `received`, `processing`, `completed`, `failed` |
| `notes` | TEXT NULL | Optional operator note |
| `raw_summary` | JSONB NULL | `{readings_count: N, events_count: N}` |

---

## gateways Table — Field Reference

| Column | Type | Description |
|---|---|---|
| `gateway_id` | TEXT UNIQUE | `"GW01"` |
| `name` | TEXT NULL | Optional human name |
| `created_at` | TIMESTAMPTZ | First seen |
| `last_seen_at` | TIMESTAMPTZ NULL | Last time upserted |
| `last_upload_at` | TIMESTAMPTZ NULL | Last successful upload completion time |
| `last_upload_id` | TEXT NULL | Last upload_id |
| `firmware_version` | TEXT NULL | `"gw-1.0.0"` |

---

## nodes Table — Field Reference

| Column | Type | Description |
|---|---|---|
| `node_id` | TEXT UNIQUE | `"MAIN"`, `"N2"`, `"N3"` |
| `node_type` | TEXT | `"soil"`, `"weather"`, `"main"` |
| `name` | TEXT NULL | Optional human name |
| `gateway_id` | TEXT | `"GW01"` |
| `created_at` | TIMESTAMPTZ | First seen |
| `last_seen_at` | TIMESTAMPTZ NULL | Last time upserted |
| `last_seq` | INTEGER NULL | Last sequence number received |

---

## Sample Normalized Records

### Pivot 2 soil reading (N2, status=ok)

```json
{
  "record_id": "GW01-N2-00000124",
  "gateway_id": "GW01",
  "node_id": "N2",
  "node_type": "soil",
  "node_seq": 124,
  "frame_id": 274080,
  "measured_at": "2026-04-25T09:50:20Z",
  "rssi": -94,
  "snr": 7.5,
  "battery_mv": null,
  "battery_percent": null,
  "battery_status": "not_measured",
  "soil_temperature_c": 21.4,
  "soil_moisture_percent": 38.2,
  "soil_ec_us_cm": 1450,
  "soil_ph": null,
  "soil_salinity": null,
  "air_temperature_c": null,
  "air_humidity_percent": null,
  "air_pressure_hpa": null,
  "status": "ok",
  "error_code": null
}
```

### Weather reading (N3, status=ok)

```json
{
  "record_id": "GW01-N3-00004511",
  "gateway_id": "GW01",
  "node_id": "N3",
  "node_type": "weather",
  "node_seq": 4511,
  "frame_id": 274080,
  "measured_at": "2026-04-25T10:00:39Z",
  "rssi": -90,
  "snr": 8.1,
  "battery_mv": null,
  "battery_percent": null,
  "battery_status": "not_measured",
  "soil_temperature_c": null,
  "soil_moisture_percent": null,
  "soil_ec_us_cm": null,
  "soil_ph": null,
  "soil_salinity": null,
  "air_temperature_c": 24.3,
  "air_humidity_percent": 48.5,
  "air_pressure_hpa": 1012.8,
  "status": "ok",
  "error_code": null
}
```

### Missing-node reading (N2, status=missing)

```json
{
  "record_id": "GW01-N2-MISSING-274081",
  "gateway_id": "GW01",
  "node_id": "N2",
  "node_type": "soil",
  "node_seq": null,
  "frame_id": 274081,
  "measured_at": "2026-04-25T10:10:05Z",
  "rssi": null,
  "snr": null,
  "soil_temperature_c": null,
  "soil_moisture_percent": null,
  "soil_ec_us_cm": null,
  "status": "missing",
  "error_code": "NODE_TIMEOUT"
}
```

---

## Fields NOT Returned by Current API

The existing `GET /api/v1/readings` endpoint (`readings.service.js`) omits these columns from its SELECT:

- `node_seq`
- `frame_id`
- `upload_id`
- `error_code`
- `raw_payload`
- `received_at`

The existing `GET /api/v1/events` endpoint omits:

- `upload_id`
- `received_at`
- `error_code`

Dashboard endpoints will need to return these fields. See `api_requirements.md`.

---

## Assumptions and Open Questions

| ID | Topic | Assumption | Action needed |
|---|---|---|---|
| A1 | MAIN rssi/snr | Local RS485 readings have rssi=NULL, snr=NULL | Verify against live upload payload |
| A2 | MAIN node_id | Pivot 1 readings use node_id="MAIN", node_type="soil" | Confirm once local sensor register map is implemented and first upload made |
| A3 | soil_ph / soil_salinity | Always NULL in production; columns are schema artifacts | Never display; add DB assertion in CI if feasible |
| A4 | uploads.records_count | Set to 0 by default; may not reflect actual inserted count | Confirm whether WebService updates this post-insert or leaves it 0 |
| A5 | Multi-day uploads | Firmware uploads today's JSONL only; older days require separate button presses | Upload History page should show per-day file coverage, not just per-session |
| A6 | MAIN readings upload | Pivot 1 readings from RS485 sensor are currently a safe placeholder (sensor_error every cycle) | Dashboard should handle zero MAIN readings gracefully; not a data error |


---

# Revision Addendum — Manual Agronomic Context Data

This addendum extends the dashboard data contract with manually entered agronomic context for alfalfa. These records must not be mixed with `sensor_readings` and must not replace `system_events`.

## New Logical Entity: `agronomic_events`

Recommended backend table:

```text
agronomic_events
```

Purpose:

```text
Store manual field operations and crop-context events used to interpret sensor data.
```

## Required Columns

| Column | Type | Description |
|---|---|---|
| `agro_event_id` | TEXT UNIQUE | Stable manual-event ID |
| `gateway_id` | TEXT | Usually `GW01` |
| `event_category` | TEXT | `season_setup`, `irrigation`, `cutting`, `fertilization`, `yield`, `field_note` |
| `event_type` | TEXT | Specific event name |
| `target_scope` | TEXT | `farm`, `pivot_1`, `pivot_2`, `both_pivots`, `unknown` |
| `started_at` | TIMESTAMPTZ | Start/event time |
| `ended_at` | TIMESTAMPTZ NULL | End time for duration events such as irrigation |
| `confidence` | TEXT | `exact`, `estimated`, `unknown` |
| `details` | JSONB | Event-specific structured fields |
| `notes` | TEXT NULL | Human note |
| `created_at` | TIMESTAMPTZ | Server insert time |
| `updated_at` | TIMESTAMPTZ NULL | Last edit time |

## Event Types

| event_category | event_type | Frequency | Notes |
|---|---|---:|---|
| `season_setup` | `planting_date` | once | Alfalfa planting date |
| `season_setup` | `emergence_date` | once after planting | Not repeated after each cutting |
| `season_setup` | `season_start` | once | Start of production season |
| `season_setup` | `season_end` | once later | Entered at season close |
| `season_setup` | `soil_type` | optional | Per farm or pivot |
| `irrigation` | `irrigation_session` | daily/regular | Requires start/end or duration |
| `cutting` | `cutting` | every ~20+ days | Periodic, not first-screen daily action |
| `yield` | `yield_per_cutting` | after each cutting | Season yield is derived by sum |
| `fertilization` | `fertilization` | multiple | Regular or exceptional application |
| `field_note` | `field_observation` | anytime | Damage, suspected disease, equipment issue, etc. |

## Dashboard Rule

Manual agronomic events may be overlaid on charts as vertical markers, but they are not sensor readings and must not be aggregated as sensor data.


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

