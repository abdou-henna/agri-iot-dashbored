# Time Semantics & Dashboard Time Policy

## 1. Purpose

This document defines how time must be understood, stored, displayed, and interpreted in the IoT agricultural monitoring dashboard.

The system contains multiple kinds of timestamps. They do **not** mean the same thing.

The dashboard must always distinguish between:

1. **Measurement time** — when the sensor reading actually happened.
2. **Gateway/RTC time** — the official field timestamp assigned by the Main Node.
3. **Upload time** — when the stored data was sent to the WebService.
4. **Server received time** — when the backend received and inserted the data.
5. **Technical cycle time** — frame/cycle identifiers used internally by firmware.

The most important rule:

```text
Dashboard charts and agronomic interpretation MUST use real measurement time, not upload time.
```

---

## 2. Why This Matters

The system is offline-first.

This means the ESP32 nodes collect data in the field and store it locally on SD card. The data may be uploaded hours later or even days later.

Example:

```text
Sensor measured soil moisture at 06:10
Data was uploaded at 18:30
Server inserted row at 18:30
```

If the dashboard uses upload time, the chart will incorrectly show that the soil moisture was measured at 18:30.

That would destroy the agricultural meaning of the data.

Correct behavior:

```text
Show the reading at 06:10
Show the upload event separately at 18:30
```

---

## 3. Official Time Definitions

## 3.1 measured_at

### Meaning

```text
The real time when the measurement occurred or was accepted by the Main Node.
```

For LoRa nodes:

```text
Node2 / Node3 sends packet
Main Node receives it
Main Node assigns RTC timestamp
```

For Main Node local soil:

```text
Main Node reads local RS485 soil sensor
Main Node assigns RTC timestamp
```

### Dashboard Usage

`measured_at` is the primary timestamp for:

- soil charts
- weather charts
- pivot comparison
- irrigation response analysis
- cutting/regrowth analysis
- heat stress analysis
- EC trend analysis
- missing data timelines

### Rule

```text
All sensor charts MUST use measured_at on the X-axis.
```

---

## 3.2 event_time

### Meaning

```text
The real time when a system event or agronomic event occurred.
```

For technical logs:

```text
node_missing
sensor_error
upload_started
rtc_sync_applied
```

For manual agronomic events:

```text
irrigation started
irrigation ended
cutting performed
fertilization applied
field note recorded
```

### Dashboard Usage

`event_time`, `started_at`, and `ended_at` are used for:

- event timelines
- chart overlays
- irrigation bands
- cutting markers
- fertilization markers
- field notes
- logs page

---

## 3.3 received_at

### Meaning

```text
The time when the WebService received and inserted the record.
```

This is server-side time.

It does not represent when the reading happened.

### Correct Usage

Use `received_at` for:

- backend diagnostics
- upload auditing
- debugging delayed uploads
- detecting server ingestion time
- comparing device time vs server time

### Forbidden Usage

Do not use `received_at` as the chart timestamp for sensor readings.

Incorrect:

```text
soil moisture chart X-axis = received_at
```

Correct:

```text
soil moisture chart X-axis = measured_at
```

---

## 3.4 upload.started_at / upload.finished_at

### Meaning

Upload session timing.

It describes when the Main Node attempted to send stored data to the WebService.

### Correct Usage

Use upload time for:

- Upload History page
- Last Upload / Last Sync indicator
- upload success/failure charts
- upload delay diagnostics

### Important

Upload time is not measurement time.

One upload may contain readings from many previous measurement cycles.

---

## 3.5 frame_id

### Meaning

A technical 10-minute cycle identifier.

Usually derived from:

```text
unix_epoch / 600
```

or an equivalent firmware cycle counter.

### Correct Usage

Use `frame_id` for:

- grouping records from the same measurement cycle
- debugging missing nodes
- correlating readings and events in the same cycle
- recovery system analysis

### Forbidden Usage

Do not display `frame_id` as the main user-facing time.

It is useful for engineers, not farm operators.

---

## 4. Time Source Hierarchy

The system must follow this priority:

| Priority | Source | Usage |
|---:|---|---|
| 1 | Main Node RTC / DS3231 | Official field time for readings/events |
| 2 | Server time from successful upload | Used to correct RTC |
| 3 | Server `received_at` | Backend ingestion/audit time only |
| 4 | frame_id / cycle number | Technical correlation only |

---

## 5. Dashboard Time Rules

## 5.1 Sensor Charts

All sensor charts must use:

```text
sensor_readings.measured_at
```

Examples:

- Pivot 1 soil moisture over time
- Pivot 2 soil temperature over time
- EC trend
- air temperature
- humidity
- pressure
- RSSI/SNR trends

---

## 5.2 Logs Page

Technical logs must use:

```text
system_events.event_time
```

But the expanded detail panel may also show:

```text
received_at
upload_id
```

to help debugging.

---

## 5.3 Upload History Page

Upload History must use:

```text
uploads.started_at
uploads.finished_at
uploads.received_at
```

It must clearly label them:

```text
Device upload start
Device upload finish
Server received
```

---

## 5.4 Agronomic Events

Manual agronomic events must use real field timing:

| Event | Required time fields |
|---|---|
| irrigation | `started_at` + `ended_at` if possible |
| cutting | `started_at` |
| fertilization | `started_at` |
| field note | `started_at` |
| planting date | `started_at` |
| emergence date | `started_at` |
| season start/end | `started_at` |

Irrigation must not be recorded only as “done today” because timing and duration matter.

Correct irrigation model:

```text
start time + end time OR start time + duration
```

---

## 6. Last Upload / Last Sync

The dashboard must always display the last successful upload time.

Recommended label:

```text
Last data upload
```

or:

```text
Last sync from field device
```

This value comes from:

```text
gateways.last_upload_at
```

or the latest successful row in:

```text
uploads
```

### Important UX Rule

The Overview page must show both:

```text
Latest measurement time
Last upload time
```

Because they mean different things.

Example:

```text
Latest measurement: 2026-05-01 06:10 UTC
Last upload:        2026-05-01 18:30 UTC
```

This means:

```text
The system measured data at 06:10 and uploaded it at 18:30.
```

---

## 7. Stale Data Logic

A dashboard can be stale for two different reasons.

## 7.1 Measurement Stale

The field device has not collected recent data.

Condition example:

```text
now - latest measured_at > expected interval threshold
```

Meaning:

```text
Sensor/network/field collection may have stopped.
```

## 7.2 Upload Stale

The field device may still be collecting data, but it has not uploaded recently.

Condition example:

```text
now - last_upload_at > 24 hours
```

Meaning:

```text
Dashboard may not reflect the latest SD card data.
```

### UI Rule

Display these separately:

```text
Data collection freshness
Upload freshness
```

Do not collapse them into one status.

---

## 8. Time Zone Policy

## 8.1 Storage

All timestamps in the database should be stored in UTC.

```text
TIMESTAMPTZ / ISO 8601 UTC
```

Example:

```text
2026-05-01T06:10:00Z
```

## 8.2 Display

The dashboard may allow the user to choose:

- UTC
- local browser time
- farm timezone

But the selected display timezone must be shown clearly in the UI.

Example:

```text
All times shown in UTC
```

or:

```text
All times shown in Africa/Algiers
```

## 8.3 Default Recommendation

For engineering/debugging:

```text
UTC
```

For farm operator daily use:

```text
farm local time
```

The dashboard settings should allow switching.

---

## 9. RTC Lost Power / Invalid Time

If the RTC lost power or time is invalid, the system may generate readings with incorrect timestamps.

Relevant events:

```text
rtc_lost_power
rtc_sync_rejected
rtc_sync_applied
time_uncertain
```

### Dashboard Rule

If time is uncertain:

- show a warning banner
- mark affected readings with a time-confidence warning
- do not silently treat them as accurate
- keep them visible, but reduce confidence

Example UI message:

```text
Warning: RTC lost power. Some timestamps may be unreliable until next successful upload time sync.
```

---

## 10. Integration With Analytics

Analytics must use real event/measurement timing.

Examples:

## 10.1 Irrigation Response

Correct:

```text
Compare soil moisture before and after irrigation.started_at / irrigation.ended_at
```

Incorrect:

```text
Compare soil moisture against upload.received_at
```

## 10.2 Cutting / Regrowth

Correct:

```text
days_since_cutting = measured_at - cutting.started_at
```

Incorrect:

```text
days_since_cutting = received_at - cutting.started_at
```

## 10.3 Heat Stress Hours

Correct:

```text
air temperature grouped by measured_at
```

---

## 11. UI Requirements

## 11.1 Overview Page

Must show:

```text
Latest measurement time
Last upload time
Upload age
Data age
Timezone
```

Example:

```text
Latest field measurement: 06:10
Last upload: 18:30
Dashboard updated from upload 2h ago
Times shown in Africa/Algiers
```

## 11.2 Chart Tooltips

Every tooltip must show:

```text
Measured at: <time>
Received at: <time>  // optional, debug mode
Upload ID: <id>      // optional, debug mode
```

Default operator mode should emphasize measured time.

## 11.3 Logs Detail Panel

Logs detail may show both:

```text
Event time
Server received time
Upload ID
```

## 11.4 Upload History

Upload History must clearly state:

```text
This page shows data transfer time, not sensor measurement time.
```

---

## 12. Dataset Separation With Time

Time is also part of the separation between datasets:

| Dataset | Primary time field | Meaning |
|---|---|---|
| `sensor_readings` | `measured_at` | sensor measurement time |
| `system_events` | `event_time` | technical event time |
| `agronomic_events` | `started_at` / `ended_at` | manual field operation time |
| `uploads` | `started_at` / `finished_at` / `received_at` | upload session time |
| `gateways` | `last_upload_at` | last successful sync |
| `nodes` | `last_seen_at` | last known node activity |

---

## 13. Non-Negotiable Rules

```text
1. Sensor charts use measured_at.
2. Technical logs use event_time.
3. Manual agronomic overlays use started_at/ended_at.
4. Upload history uses upload timestamps.
5. received_at is backend ingestion time, not field measurement time.
6. frame_id is technical correlation, not user-facing time.
7. Last upload time must be visible in the dashboard.
8. Time uncertainty must be visible, not hidden.
```

---

## 14. Final Design Principle

```text
The dashboard must show what happened in the field when it happened,
not when the server eventually received it.
```

This principle is critical for agricultural interpretation, irrigation analysis, cutting/regrowth tracking, and reliable debugging.


---

## 15. Mandatory Timezone Conversion (Critical UI Rule)

### Core Requirement

All timestamps stored in the system are in UTC.

However:

```text
The dashboard MUST convert UTC time to the user's real local time before displaying it.
```

This is a **mandatory UX rule**, not optional.

---

## Why This Is Critical

Farm operations depend on real-world time:

- irrigation happens at specific hours
- cutting is scheduled based on daylight
- temperature stress depends on actual daytime conditions

If the dashboard shows UTC directly:

```text
06:00 UTC → may actually be 07:00 or 08:00 local
```

This creates:

- wrong interpretation of irrigation timing
- incorrect understanding of heat stress
- confusion in daily operations

---

## Correct Behavior

### Storage

```text
All data remains in UTC (database level)
```

### Display

```text
All data shown in UI must be converted to local/farm time
```

---

## UI Implementation Rules

### 1. Default Display Timezone

The dashboard must default to:

```text
Farm local timezone (e.g. Africa/Algiers)
```

Not UTC.

---

### 2. Timezone Selector (Optional but Recommended)

Allow switching:

- UTC (engineering/debug mode)
- Local browser time
- Fixed farm timezone

But:

```text
Operator mode = local time by default
```

---

### 3. Labeling

The UI must always show current timezone:

```text
"All times shown in Africa/Algiers"
```

or:

```text
"All times shown in local time"
```

---

### 4. Charts

Charts must use:

```text
X-axis = measured_at converted to local time
```

NOT raw UTC.

---

### 5. Tooltips

Tooltips must display:

```text
Local time (primary)
UTC time (optional, debug mode)
```

Example:

```text
Measured at: 08:10 (local)
UTC: 06:10
```

---

### 6. Logs Page

Logs should display:

```text
event_time (converted to local)
```

With optional UTC in expanded panel.

---

### 7. Upload Page

Upload times should also be converted:

```text
Upload at: 18:30 (local)
```

---

## Engineering Note

Conversion should happen:

- either in frontend (recommended)
- or backend (if centralized formatting is needed)

But:

```text
The database must remain UTC-only
```

---

## Non-Negotiable Rule

```text
UTC is for storage.
Local time is for humans.
```

---

## Final Principle

```text
A farmer must see time as it happened in the field,
not as stored in the database.
```
