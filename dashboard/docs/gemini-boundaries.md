# Gemini Boundaries — AI Interpretation Safety Contract

**Project:** Smart Farm IoT Dashboard  
**Scope:** Phase 8 Gemini interpretation layer  
**Status:** Implementation specification

## Approved folder placement

Phase 7/8 documentation in this file maps to the existing dashboard structure under `dashboard/src/` only.
Do not introduce parallel roots such as `dashboard/core/`, `dashboard/ai/`, or `dashboard/modules/`.

---

## 1. Purpose

This document defines what Gemini is allowed and forbidden to do.

The system is intentionally designed as:

```text
Deterministic computation first.
AI interpretation second.
```

Gemini must never become the source of truth for raw data cleaning, metric computation, thresholds, or agronomic diagnosis.

---

## 2. Core Principle

```text
Gemini explains processed data.
Gemini does not create trusted data.
```

Phase 7 produces:

- cleaned data summaries
- QC flags
- feature metrics
- reliability scores
- confidence levels
- limitations

Phase 8 consumes those outputs and creates:

- summaries
- explanations
- cautious hypotheses
- prioritized observations

---

## 3. Allowed Gemini Tasks

Gemini may:

1. Summarize recent conditions.
2. Compare Pivot 1 and Pivot 2 using precomputed deltas.
3. Explain irrigation response summaries.
4. Explain weather stress context.
5. Explain why confidence is high/medium/low.
6. Highlight possible interactions between irrigation, cutting, weather, and reliability.
7. Generate cautious hypotheses using language like:
   - “may indicate”
   - “could be associated with”
   - “suggests, with medium confidence”
8. Produce user-facing narrative from deterministic metrics.
9. Recommend what data to verify next.

---

## 4. Forbidden Gemini Tasks

Gemini must not:

- clean raw data
- deduplicate rows
- fill missing values
- convert missing values to zero
- compute primary metrics from raw data
- invent rainfall, wind, solar radiation, ET, disease, nutrients, yield, or growth stage
- convert raw EC to ECe
- assign official salinity classes from raw EC
- diagnose disease
- diagnose nutrient deficiency
- infer pH or NPK
- provide exact irrigation amount without calibration
- override deterministic alert severity
- hide uncertainty

---

## 5. Input Boundary

Gemini input must contain summaries only.

Allowed input:

```json
{
  "time_window": {},
  "soil_water": {},
  "irrigation": {},
  "weather": {},
  "ec_trend": {},
  "cutting_context": {},
  "reliability": {},
  "limitations": []
}
```

Forbidden input:

- raw database rows
- raw LoRa payloads
- raw unflagged time series
- hidden missing values
- database credentials
- API keys
- private operator data not needed for interpretation

---

## 6. Output Boundary

Gemini output must be structured and constrained.

Required output shape:

```ts
interface GeminiInsightOutput {
  summary: string;
  key_observations: string[];
  risks: Array<{
    title: string;
    severity: 'info' | 'warning' | 'error';
    confidence: 'high' | 'medium' | 'low';
    explanation: string;
    limitations: string[];
  }>;
  hypotheses: string[];
  recommended_checks: string[];
  not_claimed: string[];
}
```

---

## 7. Confidence Language Rules

Gemini wording must match confidence.

| Confidence | Allowed language |
|---|---|
| high | “The processed data indicates...” |
| medium | “The data suggests...” |
| low | “A possible pattern is...” |
| invalid | “No reliable conclusion can be drawn...” |

Gemini must not use high-certainty wording for low-confidence metrics.

---

## 8. EC / Salinity Boundary

Allowed:

```text
EC increased relative to its recent baseline.
This may indicate a change in soluble ions, moisture conditions, or sensor environment.
```

Forbidden:

```text
The soil salinity is X dS/m ECe.
Alfalfa yield loss is Y%.
This field is officially saline.
```

Reason:

Current EC is raw in-situ sensor EC in µS/cm, not saturated-paste ECe.

---

## 9. Water Stress Boundary

Allowed before calibration:

```text
Pivot 2 is drying faster than its recent baseline.
```

Forbidden before calibration:

```text
Pivot 2 is below the alfalfa stress threshold.
```

Allowed after calibration:

```text
The calibrated depletion metric is below the configured refill point for 8 hours.
```

---

## 10. Disease Boundary

Allowed:

```text
Cool and humid conditions can be favorable for some diseases, but the system cannot diagnose disease without scouting or imagery.
```

Forbidden:

```text
The crop has disease.
```

---

## 11. Nutrient Boundary

Allowed:

```text
A fertilization event was recorded 5 days before irrigation. This may be relevant context for later observations.
```

Forbidden:

```text
The crop is deficient in nitrogen/phosphorus/potassium.
```

---

## 12. Yield Boundary

Allowed:

```text
Recorded yield was lower after a shorter cutting interval and higher heat burden, but this is observational and not proof of causality.
```

Forbidden:

```text
The sensors predict exact yield.
```

---

## 13. Recommendation Boundary

Gemini may recommend checks:

- verify irrigation duration
- inspect sensor placement
- check missing node logs
- confirm cutting date
- collect soil texture/calibration data
- perform soil/tissue tests if nutrient questions arise

Gemini must not issue hard operational commands unless deterministic rules explicitly support them.

Forbidden:

```text
Irrigate exactly 20 mm now.
Apply fertilizer.
Apply pesticide.
```

---

## 14. Refusal / Downgrade Behavior

If input lacks required confidence or calibration, Gemini must downgrade.

Example:

```text
The system cannot determine water stress threshold because field capacity/refill calibration is missing. It can only report relative drying trend.
```

---

## 15. Acceptance Criteria

Gemini integration is safe when:

- Gemini input contains no raw data
- every Gemini claim maps to a processed metric
- every risk has confidence and limitations
- forbidden diagnoses never appear
- uncalibrated outputs remain cautious
- deterministic alerts remain source of truth

---

End of document.
