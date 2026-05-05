# Data Domain Contract — Phase 7/8 Analytics Layer

**Project:** Smart Farm IoT Dashboard  
**Scope:** Phase 7 deterministic processing and Phase 8 AI interpretation  
**Status:** Implementation specification  
**Applies to:** `sensor_readings`, `system_events`, `uploads`, `agronomic_events`

---

## Approved folder placement

Phase 7/8 documentation in this file maps to the existing dashboard structure under `dashboard/src/` only.
Do not introduce parallel roots such as `dashboard/core/`, `dashboard/ai/`, or `dashboard/modules/`.

## 1. Purpose

This document defines the non-negotiable data-domain boundaries for the analytical layer.

The goal is to prevent semantic corruption before building QC, feature engineering, reliability scoring, alerts, or Gemini interpretation.

The system contains four independent domains:

1. **Sensor readings** — physical measurements from field nodes.
2. **System events** — technical/debug/reliability logs.
3. **Upload metadata** — transfer and ingestion records.
4. **Agronomic events** — operator-entered field-management context.

These domains may be aligned for analysis, but they must never be merged into one raw dataset or treated as interchangeable.

---

## 2. Golden Rule

```text
Each domain has its own canonical timestamp.
Using the wrong timestamp invalidates the analysis.
```

| Domain | Table / Source | Canonical timestamp | Used for | Never used for |
|---|---|---|---|---|
| Sensor data | `sensor_readings` | `measured_at` | Soil, weather, EC, RSSI/SNR, sensor charts, agronomic metrics | Upload freshness, pipeline delay |
| System logs | `system_events` | `event_time` | Reliability timeline, node faults, missing-node events, debug analysis | Sensor-value trend axis |
| Upload metadata | `uploads` | `received_at`, `started_at`, `finished_at` | Sync freshness, transfer audit, ingestion delay | Crop condition, irrigation timing, weather history |
| Agronomic events | `agronomic_events` | `started_at`, `ended_at` | Irrigation sessions, cutting intervals, yield context, fertilization timeline | System reliability, sensor replacement |

---

## 3. Sensor Domain Contract

### 3.1 Source

Sensor data comes from `sensor_readings`.

Allowed node identities:

| Dashboard label | `node_id` | `node_type` | Physical meaning |
|---|---|---|---|
| Pivot 1 | `MAIN` | `soil` | Main Node local RS485 soil sensor |
| Pivot 2 | `N2` | `soil` | Remote RS485 soil sensor via LoRa |
| Weather | `N3` | `weather` | BME280 weather node |

Weather is shared environmental context. It must not be labeled as belonging to Pivot 1 or Pivot 2.

### 3.2 Canonical time

All sensor analysis uses:

```text
sensor_readings.measured_at
```

This applies to:

- soil moisture trends
- soil temperature trends
- soil EC trends
- air temperature trends
- relative humidity trends
- pressure trends
- RSSI/SNR trends
- missing-data timelines
- irrigation response windows
- VPD calculations
- cutting/regrowth context windows

### 3.3 Valid sensor variables

| Variable | Source node(s) | Valid interpretation |
|---|---|---|
| `soil_moisture_percent` | `MAIN`, `N2` | Relative soil-water trend and irrigation response signal |
| `soil_temperature_c` | `MAIN`, `N2` | Root-zone / establishment thermal context |
| `soil_ec_us_cm` | `MAIN`, `N2` | Relative EC trend only; not official salinity |
| `air_temperature_c` | `N3` | Weather stress context, VPD input |
| `air_humidity_percent` | `N3` | VPD input and humidity context |
| `air_pressure_hpa` | `N3` | Weather QC / context only |
| `rssi`, `snr` | LoRa nodes | Communication quality, not crop physiology |

### 3.4 Forbidden sensor interpretations

The current sensor stack must not claim:

- pH status
- NPK / nutrient status
- laboratory ECe
- crop ET / reference ET
- rainfall-driven wetting
- disease diagnosis
- exact yield
- exact growth stage
- root depth
- plant height

---

## 4. System Events Domain Contract

### 4.1 Source

System logs come from `system_events`.

### 4.2 Canonical time

All system event analysis uses:

```text
system_events.event_time
```

### 4.3 Valid uses

System events may be used to compute:

- missing-node windows
- node reliability penalties
- upload failure context
- RTC drift context
- sensor-error windows
- LoRa failure context
- dashboard confidence warnings

### 4.4 Invalid uses

System events must not be used as:

- soil moisture values
- missing sensor value replacements
- crop stress observations by themselves
- agronomic event records

A `node_missing` event can reduce confidence in a sensor window, but it cannot imply water stress.

---

## 5. Upload Domain Contract

### 5.1 Source

Upload metadata comes from `uploads` and gateway status fields.

### 5.2 Valid uses

Uploads are used only for operational pipeline analysis:

- last sync / last upload
- data transfer delay
- ingestion success/failure
- upload session audit
- stale-dashboard warnings

### 5.3 Forbidden uses

Upload timestamps must never be used as:

- sensor chart X-axis
- irrigation time
- crop condition timestamp
- weather timestamp
- agronomic event timestamp

```text
A record uploaded today may describe a measurement from yesterday.
```

---

## 6. Agronomic Events Domain Contract

### 6.1 Source

Agronomic records come from `agronomic_events`.

### 6.2 Canonical time

Agronomic analysis uses:

```text
started_at
ended_at
```

depending on event type.

| Event category | Required time semantics |
|---|---|
| Irrigation | `started_at` and preferably `ended_at` |
| Cutting | `started_at` date; time-of-day usually not meaningful |
| Fertilization | `started_at` |
| Yield | associated cutting date or event date |
| Season setup | start/end dates |
| Field note | observation timestamp |

### 6.3 Confidence propagation

Every agronomic event has confidence implications.

| `confidence` | Meaning | Analysis effect |
|---|---|---|
| `exact` | Operator knows timing/data accurately | Full weight |
| `estimated` | Approximate time or details | Downgrade causal interpretation |
| `unknown` | Timing/details uncertain | Context only; no strong conclusions |

### 6.4 Valid uses

Agronomic events may be used for:

- irrigation response windows
- cutting interval calculations
- days since last cut
- fertilizer-to-irrigation offsets
- yield-per-cut context
- season-window filtering

### 6.5 Invalid uses

Agronomic events must not be treated as sensor measurements. For example:

- Fertilization record does not prove nutrient sufficiency.
- Cutting event does not directly measure biomass.
- Irrigation event does not prove that water reached the sensor depth.

---

## 7. Cross-Domain Join Rules

Cross-domain joins are allowed only as derived views.

### 7.1 Sensor + agronomic events

Allowed:

```text
sensor_readings.measured_at within agronomic_events.started_at/ended_at window
```

Example:

- Compare soil moisture 24h before irrigation vs 6–24h after irrigation.

### 7.2 Sensor + system events

Allowed:

```text
sensor_readings.measured_at near system_events.event_time
```

Example:

- Mark a chart gap as low-confidence if a `node_missing` event exists nearby.

### 7.3 Upload + sensor

Allowed only for freshness diagnostics:

```text
latest upload time vs latest measured_at
```

Do not use upload time to position measurements.

---

## 8. Missing Data Contract

Missing data must remain explicit.

Allowed representations:

```ts
value: null
is_missing: true
missing_reason: 'node_missing' | 'sensor_error' | 'upload_gap' | 'unknown'
```

Forbidden representations:

```ts
value: 0
value: previous_value
value: interpolated_value_without_flag
```

Interpolation may be used only for internal smoothing when explicitly flagged and never as a replacement for stored truth.

---

## 9. Data Confidence Contract

Every processed output must expose confidence.

Minimum fields:

```ts
interface DataConfidence {
  score: number; // 0..1
  level: 'high' | 'medium' | 'low' | 'invalid';
  reasons: string[];
}
```

Confidence is reduced by:

- missing data
- duplicate rows
- timestamp errors
- flatline flags
- spike flags
- system errors
- low agronomic event confidence
- missing calibration metadata

---

## 10. AI Boundary

Gemini may consume only processed summaries that follow this contract.

Gemini must not receive:

- raw unvalidated rows
- raw packet payloads
- hidden missing-data gaps
- unflagged interpolated values
- uncalibrated EC as salinity class
- uncalibrated soil moisture as absolute stress threshold

---

## 11. Implementation Requirements

Any Phase 7 or Phase 8 implementation must satisfy:

- no direct database access from React components
- no timestamp mixing
- no domain merging in hooks/state
- no use of `received_at` for sensor charts
- no pH/salinity/NPK UI unless real data and schema support exist
- no AI computation of deterministic metrics

---

## 12. Acceptance Criteria

This contract is implemented correctly when:

- every chart uses the correct canonical timestamp
- every feature-engineered metric declares its source domain
- every cross-domain metric declares its join rule
- every output includes confidence
- missing values remain missing
- upload freshness and measurement freshness are displayed separately
- Gemini input contains no raw data and no unsafe fields

---

End of document.
