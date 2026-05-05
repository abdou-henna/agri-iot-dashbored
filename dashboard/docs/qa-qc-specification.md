# QA/QC Specification — Phase 7 Deterministic Processing

**Project:** Smart Farm IoT Dashboard  
**Scope:** Sensor, event, upload, and agronomic data quality control  
**Status:** Implementation specification  
**AI involvement:** None. This layer is deterministic only.

---

## Approved folder placement

Phase 7/8 documentation in this file maps to the existing dashboard structure under `dashboard/src/` only.
Do not introduce parallel roots such as `dashboard/core/`, `dashboard/ai/`, or `dashboard/modules/`.

## 1. Purpose

This document defines the quality-control rules that must run before feature engineering, alerting, or Gemini interpretation.

The QC layer protects the system from incorrect conclusions caused by:

- missing data
- duplicate uploads
- wrong timestamps
- impossible sensor values
- stuck sensors
- spikes or sudden jumps
- node outages
- unreliable agronomic event timing

The output of this layer is not a narrative. It is a structured set of flags, scores, and clean windows used by later deterministic modules.

---

## 2. Scope

QC applies to four data domains:

| Domain | QC focus |
|---|---|
| `sensor_readings` | measurement validity, missingness, duplicates, flatlines, spikes |
| `system_events` | reliability penalties, fault windows, event severity mapping |
| `uploads` | transfer freshness, ingestion delay, duplicate-upload risk |
| `agronomic_events` | timing confidence, event completeness, window validity |

---

## 3. Output Model

Every QC function must produce deterministic outputs.

```ts
interface QCFlag {
  code: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  domain: 'sensor' | 'system' | 'upload' | 'agronomy';
  node_id?: 'MAIN' | 'N2' | 'N3';
  start_time: string;
  end_time?: string;
  message: string;
  details?: Record<string, unknown>;
}
```

Every data window must also expose:

```ts
interface WindowQuality {
  score: number; // 0..1
  level: 'high' | 'medium' | 'low' | 'invalid';
  missing_pct: number;
  flags: QCFlag[];
}
```

---

## 4. Timestamp QC

### 4.1 Canonical timestamp check

Each row must use the correct time field:

| Domain | Required timestamp |
|---|---|
| sensor | `measured_at` |
| system | `event_time` |
| upload | upload timestamps only for pipeline diagnostics |
| agronomy | `started_at`, `ended_at` |

### 4.2 Invalid timestamp flags

| Flag | Trigger | Severity |
|---|---|---|
| `BAD_TIMESTAMP_NULL` | Required timestamp is missing | error |
| `BAD_TIMESTAMP_FUTURE` | Timestamp is beyond allowed future tolerance | error |
| `BAD_TIMESTAMP_ORDER` | End time before start time | error |
| `BAD_TIMESTAMP_DRIFT_SUSPECTED` | Device time differs strongly from upload/server time | warning |

### 4.3 Future tolerance

Default assumption:

```text
future_tolerance_minutes = 10
```

ASSUMPTION: This tolerance may be adjusted after real RTC drift data is reviewed.

---

## 5. Duplicate Detection

### 5.1 Sensor duplicate key

Preferred duplicate identity:

```text
record_id
```

Fallback identity:

```text
node_id + measured_at + node_seq + metric payload hash
```

### 5.2 Duplicate flags

| Flag | Trigger | Action |
|---|---|---|
| `DUPLICATE_RECORD_ID` | Same `record_id` appears more than once | Keep first canonical row; flag duplicates |
| `DUPLICATE_MEASUREMENT` | Same node/time/payload appears multiple times | Deduplicate for metrics |
| `DUPLICATE_UPLOAD_SUSPECTED` | Same upload content appears repeatedly | Flag upload/session reliability |

### 5.3 Rule

Duplicates must not distort:

- averages
- min/max
- irrigation response deltas
- reliability scores
- Gemini summaries

---

## 6. Missing Data QC

### 6.1 Expected sampling interval

Current expected sampling interval:

```text
10 minutes
```

ASSUMPTION: This can be made configurable per node later.

### 6.2 Missing calculation

For each node and time window:

```text
expected_count = window_duration_minutes / 10
missing_count = expected_count - valid_count
missing_pct = missing_count / expected_count
```

### 6.3 Missing flags

| Flag | Trigger | Severity |
|---|---|---|
| `MISSING_READING` | Expected reading absent | warning |
| `MISSING_NODE_WINDOW` | Node absent for multiple expected intervals | warning/error depending duration |
| `MISSING_SENSOR_VALUE` | Row exists but metric is null | warning |
| `MISSING_AGRONOMIC_CONTEXT` | Required event context absent for analysis | info/warning |

### 6.4 Missing data rule

```text
Missing values must remain null.
They must never be converted to zero.
```

---

## 7. Physical Plausibility QC

### 7.1 Sensor limits

| Metric | Valid range | Flag if outside |
|---|---:|---|
| `soil_moisture_percent` | 0 to 100 | `IMPOSSIBLE_SOIL_MOISTURE` |
| `soil_temperature_c` | -20 to 80 | `IMPOSSIBLE_SOIL_TEMPERATURE` |
| `soil_ec_us_cm` | 0 to 20000 | `IMPOSSIBLE_SOIL_EC` |
| `air_temperature_c` | -40 to 85 | `IMPOSSIBLE_AIR_TEMPERATURE` |
| `air_humidity_percent` | 0 to 100 | `IMPOSSIBLE_AIR_HUMIDITY` |
| `air_pressure_hpa` | 300 to 1200 | `IMPOSSIBLE_AIR_PRESSURE` |
| `rssi` | -140 to -20 | `IMPOSSIBLE_RSSI` |
| `snr` | -30 to 30 | `IMPOSSIBLE_SNR` |

### 7.2 Handling

Impossible values must be excluded from metric computation unless explicitly requested for diagnostics.

They remain visible as flagged raw rows in debug views.

---

## 8. Flatline Detection

### 8.1 Purpose

Flatline detection identifies stuck sensors, frozen data pipelines, or repeated copied values.

### 8.2 Rule

A metric is flagged when its value remains exactly or near-exactly constant across a minimum duration.

Default thresholds:

| Metric | Minimum duration | Tolerance |
|---|---:|---:|
| Soil moisture | 6 hours | 0.1 % |
| Soil temperature | 6 hours | 0.1 °C |
| Soil EC | 6 hours | 5 µS/cm |
| Air temperature | 6 hours | 0.1 °C |
| Air humidity | 6 hours | 0.5 % |
| Air pressure | 12 hours | 0.1 hPa |

ASSUMPTION: Thresholds should be validated with real deployment data.

### 8.3 Output

```ts
flatline_flag: boolean
flatline_metric: string
flatline_duration_minutes: number
```

---

## 9. Spike and Step Detection

### 9.1 Purpose

Detect sudden implausible jumps likely caused by sensor noise, parsing errors, or communication corruption.

### 9.2 Spike flags

| Flag | Example trigger |
|---|---|
| `SPIKE_SOIL_MOISTURE` | moisture changes too sharply between adjacent readings |
| `SPIKE_SOIL_TEMPERATURE` | soil temperature jump exceeds plausible rate |
| `SPIKE_EC` | EC jump inconsistent with moisture/context |
| `SPIKE_WEATHER` | air temperature/RH jumps outside plausible short-term range |

### 9.3 Default thresholds

Initial conservative values:

| Metric | Adjacent-change warning threshold |
|---|---:|
| Soil moisture | > 20 percentage points / 10 min |
| Soil temperature | > 5 °C / 10 min |
| Soil EC | > 5000 µS/cm / 10 min |
| Air temperature | > 7 °C / 10 min |
| Air humidity | > 30 percentage points / 10 min |
| Pressure | > 10 hPa / 10 min |

ASSUMPTION: These are first-pass QC thresholds and must be tuned with field data.

---

## 10. System Event Consistency QC

System events must influence confidence.

| Event type / condition | QC effect |
|---|---|
| `node_missing` | Increase missing penalty for that node/window |
| `sensor_error` | Mark affected sensor window low-confidence |
| `packet_parse_failed` | Penalize node reliability |
| `rtc_lost_power` | Flag timestamp confidence until sync recovered |
| `rtc_sync_applied` | Record time correction context |
| `upload_failed` | Pipeline warning, not agronomic stress |
| `lora_init_failed` | Critical operational reliability issue |

---

## 11. Event Window Completeness QC

### 11.1 Irrigation window quality

For each irrigation event:

Required windows:

```text
pre_window = 24h before irrigation start
post_window = 6h to 24h after irrigation end
```

Minimum quality:

```text
at least 60% expected sensor coverage in both windows
```

Flags:

| Flag | Trigger |
|---|---|
| `IRRIGATION_PRE_WINDOW_INCOMPLETE` | insufficient pre-event data |
| `IRRIGATION_POST_WINDOW_INCOMPLETE` | insufficient post-event data |
| `IRRIGATION_EVENT_TIME_UNCERTAIN` | event confidence not exact |
| `IRRIGATION_NO_END_TIME` | active or incomplete irrigation session |

### 11.2 Cutting window quality

For cutting analysis:

- cutting date must exist
- previous cutting date required for interval length
- sensor data after cutting required for regrowth context

Flags:

| Flag | Trigger |
|---|---|
| `CUTTING_INTERVAL_UNKNOWN` | no previous cut |
| `CUTTING_DATE_ESTIMATED` | confidence is not exact |
| `REGROWTH_WINDOW_INCOMPLETE` | missing post-cut sensor/weather data |

---

## 12. Agronomic Event QC

| Event category | Required fields | QC flags |
|---|---|---|
| irrigation | `started_at`, preferably `ended_at` | missing end, invalid duration, low confidence |
| cutting | `started_at` | missing previous cut, low confidence |
| fertilization | fertilizer name/type if available | missing product info, low confidence |
| yield | amount + unit + cutting reference if available | missing unit, missing area, low confidence |
| season_setup | start date | missing season start, invalid end |
| field_note | timestamp + note | low confidence if vague |

---

## 13. Upload Freshness QC

Upload QC is operational only.

| Flag | Trigger | Meaning |
|---|---|---|
| `STALE_UPLOAD` | last upload older than threshold | Dashboard may not contain latest SD data |
| `STALE_MEASUREMENT` | newest `measured_at` older than threshold | Field collection may have stopped |
| `UPLOAD_DELAY_HIGH` | upload time much later than measurement time | Batch delay; not crop condition |

Important:

```text
stale_upload != stale_measurement
```

These must remain separate dashboard concepts.

---

## 14. Window Quality Score

Default scoring model:

```text
score = 1.0
score -= missing_pct * 0.50
score -= duplicate_pct * 0.20
score -= flatline_penalty
score -= spike_penalty
score -= system_event_penalty
score -= event_confidence_penalty
```

Clamp:

```text
0 <= score <= 1
```

Level mapping:

| Score | Level |
|---:|---|
| 0.85–1.00 | high |
| 0.60–0.84 | medium |
| 0.30–0.59 | low |
| < 0.30 | invalid |

ASSUMPTION: Weights are initial implementation values and should be versioned.

---

## 15. QC Output for Gemini

Gemini may receive only summarized QC outputs:

```json
{
  "window_quality": "medium",
  "node_reliability_score": 0.78,
  "main_limitations": [
    "post-irrigation window incomplete",
    "N2 missing data 18%"
  ]
}
```

Gemini must not receive raw QC implementation details unless needed for explanation.

---

## 16. Acceptance Criteria

QC is complete when:

- all sensor metrics can be flagged independently
- missing values remain null
- duplicate rows are excluded from metrics
- impossible values are excluded from metrics
- event windows expose quality scores
- node reliability can be computed per window
- Gemini inputs include confidence and limitations

---

End of document.
