# Reliability Scoring Specification — Phase 7 Confidence Layer

**Project:** Smart Farm IoT Dashboard  
**Scope:** Node reliability, window confidence, and analysis readiness  
**Status:** Implementation specification

## Approved folder placement

Phase 7/8 documentation in this file maps to the existing dashboard structure under `dashboard/src/` only.
Do not introduce parallel roots such as `dashboard/core/`, `dashboard/ai/`, or `dashboard/modules/`.

---

## 1. Purpose

Reliability scoring converts technical data quality into a clear confidence layer.

The dashboard must not present agronomic insights with the same confidence when:

- data is complete and stable
- a node is missing often
- timestamps are suspicious
- sensor values are flatlined
- packets are weak or noisy
- agronomic event timing is estimated

This document defines how to compute reliability scores and how to propagate them into metrics, alerts, and Gemini summaries.

---

## 2. Scoring Types

| Score | Scope | Purpose |
|---|---|---|
| `node_reliability_score` | per node + time window | Measures trust in a node's data stream |
| `window_quality_score` | per analysis window | Measures whether a metric window is usable |
| `event_confidence_weight` | per agronomic event | Measures trust in operator-entered timing/details |
| `overall_analysis_confidence` | per summary | Final confidence given to dashboard/Gemini |

---

## 3. Score Range

All scores use:

```text
0.0 = unusable
1.0 = fully reliable
```

Level mapping:

| Score | Level | Meaning |
|---:|---|---|
| 0.85–1.00 | high | Safe for normal interpretation |
| 0.60–0.84 | medium | Usable with caveats |
| 0.30–0.59 | low | Descriptive only; avoid strong conclusions |
| < 0.30 | invalid | Do not generate agronomic conclusions |

---

## 4. Node Reliability Score

### 4.1 Inputs

For each node and time window:

- expected reading count
- actual valid reading count
- missing count
- duplicate count
- impossible-value count
- flatline duration
- spike count
- system-event faults
- RSSI/SNR quality if applicable

### 4.2 Default formula

```text
score = 1.0
score -= missing_penalty
score -= duplicate_penalty
score -= impossible_value_penalty
score -= flatline_penalty
score -= spike_penalty
score -= system_event_penalty
score -= radio_quality_penalty
score = clamp(score, 0, 1)
```

### 4.3 Penalty definitions

| Penalty | Default calculation |
|---|---|
| Missing | `missing_pct * 0.45` |
| Duplicate | `duplicate_pct * 0.15` |
| Impossible values | `impossible_pct * 0.30` |
| Flatline | up to `0.25` by duration |
| Spikes | up to `0.20` by frequency |
| System faults | up to `0.30` by severity |
| Radio quality | up to `0.15` for remote nodes |

ASSUMPTION: These weights are initial defaults and should be versioned after field validation.

---

## 5. Missing Data Penalty

```text
missing_pct = missing_count / expected_count
missing_penalty = missing_pct * 0.45
```

Severity guide:

| Missing % | Meaning |
|---:|---|
| 0–5% | excellent |
| 5–15% | acceptable |
| 15–30% | degraded |
| >30% | low reliability |

---

## 6. Flatline Penalty

Flatlines reduce reliability because they may indicate stuck sensors or frozen data.

Default:

| Flatline duration | Penalty |
|---:|---:|
| < 3h | 0 |
| 3–6h | 0.05 |
| 6–12h | 0.15 |
| >12h | 0.25 |

Caution:

Some variables naturally change slowly. Pressure and EC should be treated more conservatively than moisture or temperature.

---

## 7. Spike Penalty

```text
spike_rate = spike_count / valid_count
spike_penalty = min(spike_rate * 0.50, 0.20)
```

Spikes do not always mean the node is bad; they may indicate real events such as irrigation. Therefore:

- moisture spikes near irrigation are penalized less
- isolated spikes are flagged but not catastrophic
- repeated unexplained spikes reduce reliability

---

## 8. System Event Penalty

| Event severity | Suggested penalty |
|---|---:|
| info | 0 |
| warning | 0.05 |
| error | 0.15 |
| critical | 0.30 |

Event penalties apply only if the event is relevant to the node/window.

Examples:

- `node_missing` for `N2` penalizes N2 only.
- `rtc_lost_power` affects all timestamp-dependent windows until sync is restored.
- `upload_failed` affects pipeline freshness but not historical measurement values.

---

## 9. Radio Quality Penalty

Remote nodes only: `N2`, `N3`.

### 9.1 RSSI guide

| RSSI | Interpretation | Penalty |
|---:|---|---:|
| > -90 dBm | good | 0 |
| -90 to -105 dBm | acceptable | 0.03 |
| -105 to -115 dBm | weak | 0.08 |
| < -115 dBm | very weak | 0.15 |

### 9.2 SNR guide

| SNR | Interpretation | Penalty |
|---:|---|---:|
| > 5 dB | good | 0 |
| 0 to 5 dB | acceptable | 0.03 |
| -5 to 0 dB | weak | 0.08 |
| < -5 dB | noisy | 0.15 |

Use the higher of RSSI/SNR penalties, not necessarily the sum, to avoid over-penalizing the same radio condition.

ASSUMPTION: These values are first-pass LoRa reliability guides and should be adjusted after field data.

---

## 10. Event Confidence Weight

Agronomic event confidence affects causal interpretation.

| Event confidence | Weight | Meaning |
|---|---:|---|
| `exact` | 1.00 | Full confidence |
| `estimated` | 0.70 | Use cautiously |
| `unknown` | 0.40 | Context only |

Example:

An irrigation response metric based on an estimated irrigation start time should not produce a strong conclusion.

---

## 11. Window Quality Score

Window quality combines:

- node reliability
- event confidence
- window completeness
- relevant system faults

Formula:

```text
window_quality_score = min(
  node_reliability_score,
  event_confidence_weight,
  completeness_score
) - critical_fault_penalty
```

Clamp to 0..1.

This conservative `min()` behavior is intentional: one weak component can invalidate a causal interpretation.

---

## 12. Overall Analysis Confidence

For multi-node summaries:

```text
overall_confidence = weighted average of relevant window scores
```

But if any required component is invalid:

```text
overall_confidence <= low
```

Example:

- Pivot comparison requires both MAIN and N2.
- If N2 reliability is invalid, comparison confidence is invalid or low even if MAIN is excellent.

---

## 13. Confidence Messages

Every score should map to user-readable reasons.

Examples:

```text
High confidence: 96% data coverage, no major faults.
Medium confidence: 18% missing readings in selected window.
Low confidence: post-irrigation data incomplete.
Invalid: RTC timestamp fault detected and no sync confirmation.
```

---

## 14. Gemini Propagation

Gemini input must include:

```json
{
  "confidence": {
    "overall": "medium",
    "score": 0.72,
    "reasons": [
      "N2 missing data 18%",
      "irrigation event time estimated"
    ]
  }
}
```

Gemini must reflect this confidence in wording.

Examples:

| Confidence | Required wording style |
|---|---|
| high | “The data indicates...” |
| medium | “The data suggests...” |
| low | “A possible pattern is...” |
| invalid | “No reliable conclusion can be drawn...” |

---

## 15. Dashboard Usage

Reliability scores should appear in:

- System Health page
- insight cards
- alert cards
- Gemini summaries
- metric details / expandable sections

Reliability must not be hidden.

---

## 16. Acceptance Criteria

Reliability scoring is complete when:

- every node has a score for selected windows
- every event-based metric has a window quality score
- every Gemini input includes confidence
- low-confidence data cannot trigger strong alerts
- missing data and system faults are visible to the user

---

End of document.
