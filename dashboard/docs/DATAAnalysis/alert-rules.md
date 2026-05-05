# Alert Rules Specification — Conservative Agronomic and Operational Alerts

**Project:** Smart Farm IoT Dashboard  
**Scope:** Phase 7 deterministic alerting and Phase 8 AI-safe interpretation  
**Status:** Implementation specification

---

## 1. Purpose

This document defines alert rules for the Smart Farm dashboard.

Alerts must be conservative. A false alert should be inconvenient, not agronomically dangerous.

The system must distinguish between:

- **Operational alerts** — system/data reliability problems.
- **Descriptive agronomic alerts** — trend or context warnings.
- **Calibrated agronomic alerts** — stronger alerts allowed only after field calibration.

---

## 2. Alert Safety Principles

1. No AI-generated alert may bypass deterministic rules.
2. Missing data must never trigger agronomic “safe” or “stress” conclusions.
3. Uncalibrated soil moisture supports trend warnings only.
4. Raw soil EC supports trend/caution only, not official salinity class.
5. Disease and nutrient alerts must remain contextual unless external field/lab data exist.
6. Upload freshness and measurement freshness must be separate.

---

## 3. Alert Output Model

```ts
interface AlertRuleOutput {
  alert_id: string;
  alert_type: string;
  domain: 'agronomic' | 'operational' | 'ai_summary';
  severity: 'info' | 'warning' | 'error' | 'critical';
  confidence: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  triggered_at: string;
  time_window?: { from: string; to: string };
  affected_scope?: 'farm' | 'pivot_1' | 'pivot_2' | 'both_pivots' | 'weather' | 'system';
  evidence: Record<string, unknown>;
  limitations: string[];
}
```

---

## 4. Operational Alerts

Operational alerts do not require agronomic calibration.

### 4.1 Missing node warning

Trigger:

```text
node has no valid readings for > expected interval threshold
```

Default:

```text
threshold = 2 expected intervals = 20 minutes
```

Severity:

| Duration | Severity |
|---:|---|
| 20–60 min | warning |
| 1–6 h | error |
| >6 h | critical |

Message:

```text
Node N2 has not reported recent data. Agronomic interpretation for Pivot 2 is reduced.
```

### 4.2 Stale upload warning

Trigger:

```text
last upload older than configured threshold
```

Default:

```text
24 hours
```

Meaning:

Dashboard may not reflect latest SD data.

Important:

This is not a crop stress alert.

### 4.3 Stale measurement warning

Trigger:

```text
latest measured_at older than expected collection threshold
```

Meaning:

Field collection may have stopped or not uploaded.

### 4.4 Low reliability warning

Trigger:

```text
node_reliability_score < 0.60
```

Severity:

| Score | Severity |
|---:|---|
| 0.30–0.60 | warning |
| <0.30 | error |

---

## 5. Soil Water Alerts

### 5.1 Trend-only drying warning

Allowed before calibration.

Trigger:

```text
moisture drop rate exceeds recent baseline by configured factor
```

Requirements:

- medium/high window quality
- no major missing-data issue
- recent baseline available

Severity:

```text
info to warning
```

Message style:

```text
Pivot 2 is drying faster than its recent baseline. This is a trend warning, not a calibrated water-stress diagnosis.
```

### 5.2 Calibrated water-stress risk

Allowed only if calibration exists.

Required metadata:

- field capacity or full point
- refill threshold or PWP
- sensor depth
- target pivot/scope

Trigger:

```text
soil moisture remains below calibrated refill point for minimum duration
```

Severity:

| Duration below refill | Severity |
|---:|---|
| short | warning |
| persistent | error |
| multi-day and high confidence | critical |

Without calibration:

```text
Do not trigger this alert.
Use trend-only drying warning instead.
```

### 5.3 Poor irrigation response

Trigger:

```text
post-irrigation moisture response is weak compared with pre-irrigation and historical response
```

Required:

- irrigation event with valid timing
- adequate pre/post sensor coverage
- sufficient window quality

Possible message:

```text
The sensed soil zone showed little moisture increase after irrigation. Possible explanations include under-refill, sensor depth mismatch, infiltration delay, or uncertain irrigation timing.
```

Forbidden:

```text
Do not say irrigation failed as fact.
```

### 5.4 Possible over-wet condition

Allowed only with calibration or strong local baseline.

Trigger:

```text
moisture remains near full/saturated-like level unusually long after irrigation
```

Message must be cautious.

---

## 6. Weather Stress Alerts

### 6.1 Heat-stress context

Trigger:

```text
air temperature exceeds configured heat band for cumulative duration
```

Default contextual bands:

| Band | Threshold | Severity |
|---|---:|---|
| warm | >= 30°C | info |
| high heat | >= 35°C | warning |
| severe heat | >= 38°C | error if persistent |

ASSUMPTION: Bands are contextual and cultivar-dependent.

### 6.2 High VPD / drying-pressure context

Trigger:

```text
VPD exceeds configured threshold or recent baseline
```

Important:

VPD is not ET. Do not convert to irrigation amount.

### 6.3 Establishment cold/temperature context

Only during planting-to-emergence window.

Required:

- planting date or season setup
- soil temperature readings

Trigger:

```text
soil temperature falls into slow-germination or non-germination contextual band
```

---

## 7. EC / Salinity Caution Alerts

### 7.1 EC upward drift caution

Trigger:

```text
7-day EC median rises above 30-day baseline by configured threshold
```

Required:

- adequate EC data
- EC/moisture context
- no major QC failure

Message:

```text
Soil EC is trending upward relative to its recent baseline. This is a provisional EC trend, not an official salinity classification.
```

Forbidden:

- salinity class
- yield loss percentage
- ECe conversion

### 7.2 EC–moisture interaction note

Trigger:

```text
EC changes strongly with moisture changes
```

Purpose:

Warn that EC interpretation may be moisture-driven.

---

## 8. Cutting and Regrowth Alerts

### 8.1 Intensive cutting interval warning

Trigger:

```text
cutting interval is shorter than configured management threshold
```

Default contextual threshold:

```text
< 28 days
```

Severity:

```text
info or warning
```

Message:

```text
This cutting interval is shorter than the typical regrowth interval used in many alfalfa systems. Interpret according to local yield/quality goals.
```

### 8.2 Missing yield follow-up

Trigger:

```text
cutting recorded but no yield record after configured time
```

Operational/agronomic context alert.

---

## 9. Fertilization Context Alerts

Allowed alerts:

- fertilizer event missing product name/type
- fertilization occurred without nearby irrigation context
- EC changed after fertilization (context note only)

Forbidden alerts:

- nutrient deficiency diagnosis
- N/P/K sufficiency
- pH diagnosis

---

## 10. Disease Risk Boundary

Current system lacks:

- rainfall
- leaf wetness
- images
- scouting observations
- pathogen confirmation

Therefore:

Allowed:

```text
Broad favorability context only.
```

Forbidden:

```text
Disease detected.
Disease outbreak predicted.
Apply fungicide.
```

---

## 11. Alert Confidence Requirements

Strong alerts require:

- high or medium reliability score
- adequate data window
- exact or acceptable event timing
- relevant calibration where required

If confidence is low:

```text
Downgrade alert severity or convert to observation.
```

---

## 12. Gemini Usage

Gemini may explain alerts but must not create new alert triggers independently.

Gemini may say:

```text
This alert may indicate under-refill, but confidence is reduced because the post-irrigation window is incomplete.
```

Gemini must not say:

```text
You must irrigate now.
```

unless deterministic rules and calibrated thresholds explicitly support a recommendation format approved by the system.

---

## 13. Acceptance Criteria

Alerting is correct when:

- operational and agronomic alerts are separated
- uncalibrated metrics only generate cautious alerts
- EC alerts never claim official salinity
- missing data triggers reliability warnings, not fake zeros
- Gemini does not create independent alert rules
- every alert includes evidence and limitations

---

End of document.
