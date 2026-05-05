# Feature Engineering Specification — Phase 7 Metrics Layer

**Project:** Smart Farm IoT Dashboard  
**Scope:** Deterministic metric computation after QA/QC  
**Status:** Implementation specification  
**AI involvement:** None

---

## Approved folder placement

Phase 7/8 documentation in this file maps to the existing dashboard structure under `dashboard/src/` only.
Do not introduce parallel roots such as `dashboard/core/`, `dashboard/ai/`, or `dashboard/modules/`.

## 1. Purpose

This document defines the metrics computed after data-domain separation and QA/QC.

The feature-engineering layer converts clean, quality-scored data into structured agronomic and operational features for:

- dashboard modules
- alert rules
- reliability summaries
- Gemini input mapping

All metrics must be deterministic, auditable, timestamp-faithful, and confidence-tagged.

---

## 2. Input Requirements

Feature engineering may use only cleaned and QC-scored inputs:

| Input | Required condition |
|---|---|
| `sensor_readings` | valid `measured_at`, QC flags applied |
| `system_events` | valid `event_time`, severity mapped |
| `agronomic_events` | valid `started_at` / `ended_at`, confidence mapped |
| `uploads` | used only for freshness diagnostics |

Raw rows with critical QC errors must be excluded from normal metric computation.

---

## 3. Shared Output Pattern

Every metric output must include:

```ts
interface MetricOutput<T> {
  metric_name: string;
  domain: 'sensor' | 'system' | 'upload' | 'agronomy' | 'derived';
  time_window: {
    from: string;
    to: string;
  };
  value: T;
  unit?: string;
  confidence: {
    score: number;
    level: 'high' | 'medium' | 'low' | 'invalid';
    reasons: string[];
  };
  source_fields: string[];
}
```

---

## 4. Aggregation Metrics

### 4.1 Hourly aggregation

For each node and metric:

```text
bucket = 1 hour
compute min, max, avg, count, missing_count
```

Used by:

- chart display
- weather stress summaries
- Gemini summaries
- daily rollups

### 4.2 Daily aggregation

For each node and metric:

```text
bucket = 1 day
compute min, max, avg, count, missing_count
```

Used by:

- daily reports
- reliability scoring
- heat-stress hours
- EC drift
- trend summaries

### 4.3 Missing values

Metrics must not coerce missing values to zero.

If a bucket has no valid values:

```ts
avg = null
min = null
max = null
count = 0
```

---

## 5. Soil Water Metrics

### 5.1 Current moisture status

Input:

- `soil_moisture_percent`
- `node_id`
- `measured_at`

Output:

```ts
current_moisture_percent
latest_measured_at
confidence
```

Interpretation:

- valid as relative status
- absolute stress label requires calibration

### 5.2 Moisture drop rate

Formula:

```text
drop_rate = (theta_t2 - theta_t1) / delta_hours
```

Recommended window:

```text
6h to 7d
```

Output unit:

```text
percentage points per hour
```

Use:

- drying trend
- pivot comparison
- weather-demand context

Caution:

A faster drop rate may indicate crop water use, high atmospheric demand, shallow refill, sensor depth effects, or data quality issues.

### 5.3 Calibrated depletion fraction

Formula:

```text
depletion_fraction = (FC - theta) / (FC - PWP)
```

Required metadata:

- field capacity or local full point
- permanent wilting point or refill point
- sensor depth
- soil texture/profile

Status:

```text
Deferred until calibration metadata exists.
```

Before calibration, use trend-only moisture analysis.

---

## 6. Irrigation Effectiveness Metrics

### 6.1 Event window definition

For each irrigation session:

```text
pre_window = 24h before started_at
post_window = 6h to 24h after ended_at
```

If `ended_at` is null:

```text
analysis_status = incomplete
```

### 6.2 Irrigation response delta

Formula:

```text
response_delta = median(theta_post_window) - median(theta_pre_window)
```

Output:

```ts
{
  irrigation_event_id,
  node_id,
  response_delta_percent_points,
  pre_median,
  post_median,
  window_quality,
  confidence
}
```

Interpretation:

- positive delta suggests sensed-zone wetting
- weak/no delta may indicate under-refill, deep water movement, sensor placement, timing error, or missing data

### 6.3 Irrigation response lag

Formula:

```text
response_lag = time_of_peak_moisture_after_irrigation - irrigation_end_time
```

If `ended_at` is unavailable, use `started_at` with downgraded confidence.

### 6.4 Under-response flag

Trigger:

```text
response_delta <= historical_low_response_threshold
```

Requires:

- historical baseline OR configurable threshold
- adequate window quality

Without baseline, output only descriptive context.

---

## 7. Weather Stress Metrics

### 7.1 Heat-stress hours

Input:

- `air_temperature_c`
- `measured_at`

Default bands:

| Band | Example threshold | Interpretation |
|---|---:|---|
| warm | >= 30°C | context |
| high heat | >= 35°C | caution |
| severe heat | >= 38°C | high caution |

ASSUMPTION: These are configurable contextual bands, not universal cultivar-specific thresholds.

Output:

```ts
heat_hours_by_band
```

### 7.2 Cool / establishment hours

Input:

- `soil_temperature_c`
- planting/emergence dates if available

Use only during establishment windows.

Output:

```ts
cool_establishment_hours
favorable_root_growth_hours
```

### 7.3 VPD estimate

Formula:

```text
es = 0.6108 * exp((17.27 * T) / (T + 237.3))
VPD = es * (1 - RH / 100)
```

Required:

- paired air temperature and RH from same or aligned weather bucket

Unit:

```text
kPa
```

Limitations:

- not ET
- no wind
- no solar radiation
- no crop coefficient

---

## 8. EC / Salinity Indicator Metrics

### 8.1 EC trend

Input:

- `soil_ec_us_cm`
- `measured_at`
- `node_id`

Output:

```ts
rolling_ec_7d_median
rolling_ec_30d_median
ec_baseline_drift = median_7d - median_30d
```

### 8.2 EC–moisture interaction

Purpose:

Understand whether EC changes are associated with moisture dynamics.

Possible metric:

```text
rolling correlation between soil_ec_us_cm and soil_moisture_percent
```

Window:

```text
7d to 30d
```

Critical limitation:

```text
Raw EC is not ECe.
Do not compute official salinity class or yield loss.
```

---

## 9. Pivot Comparison Metrics

### 9.1 Latest shared comparison

For Pivot 1 (`MAIN`) and Pivot 2 (`N2`):

```text
latest shared or nearest comparable time window
```

Metrics:

- moisture difference
- temperature difference
- EC difference
- response difference after same irrigation event

### 9.2 Output

```ts
{
  metric,
  pivot_1_value,
  pivot_2_value,
  delta: pivot_1 - pivot_2,
  confidence
}
```

### 9.3 Caution

Between-pivot differences may reflect:

- true soil differences
- sensor depth differences
- irrigation distribution differences
- communication gaps
- calibration differences

---

## 10. Cutting and Regrowth Metrics

### 10.1 Cutting interval

Formula:

```text
interval_days = current_cut_date - previous_cut_date
```

Output:

```ts
cutting_number
interval_days
days_since_last_cut
confidence
```

### 10.2 Regrowth context

Post-cut window:

```text
0 to 14 days after cutting
```

Possible metrics:

- post-cut moisture drop rate
- heat-stress hours after cutting
- VPD burden after cutting
- irrigation timing after cutting

Caution:

No direct biomass or canopy measurement exists.

---

## 11. Fertilization Context Metrics

Fertilization records are context only.

Metrics:

```text
days_from_fertilization_to_irrigation
days_from_fertilization_to_cutting
ec_change_after_fertilization_context
```

Forbidden:

- nutrient deficiency diagnosis
- nutrient sufficiency claim
- NPK inference

---

## 12. Yield Context Metrics

Only if yield is manually recorded.

Metrics:

```text
yield_per_cut
yield_per_area if area exists
yield_vs_interval_context
yield_vs_pre_cut_moisture_context
yield_vs_weather_stress_context
```

Forbidden:

- exact yield prediction from current sensors alone
- causal claims without enough data

---

## 13. Reliability Features

Feature engineering must include reliability features for every analysis window:

- missing percentage
- window quality score
- node reliability score
- system-event penalties
- upload freshness indicators

These features must be included in Gemini input.

---

## 14. AI Summary Input Shape

Phase 7 output for Phase 8 should be structured like:

```json
{
  "time_window": { "from": "...", "to": "..." },
  "soil_water": { "pivot_1": {}, "pivot_2": {} },
  "irrigation": { "recent_sessions": [] },
  "weather": { "heat_hours": {}, "vpd": {} },
  "ec": { "trend_only": true, "pivot_1": {}, "pivot_2": {} },
  "agronomy": { "days_since_cut": null, "fertilization_offsets": [] },
  "reliability": { "nodes": {}, "overall_confidence": "medium" },
  "limitations": []
}
```

---

## 15. Acceptance Criteria

Feature engineering is ready when:

- all metrics declare required fields
- all metrics declare confidence
- all metrics preserve canonical timestamp semantics
- EC metrics are trend-only
- ET is not computed
- disease/nutrient/yield diagnoses are not produced
- Gemini input is summary-only

---

End of document.
