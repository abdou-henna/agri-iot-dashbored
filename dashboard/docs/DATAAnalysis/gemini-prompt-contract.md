# Gemini Prompt Contract — Phase 8 AI Analysis Interface

**Project:** Smart Farm IoT Dashboard  
**Scope:** Structured input/output contract for Gemini  
**Status:** Implementation specification

## Approved folder placement

Phase 7/8 documentation in this file maps to the existing dashboard structure under `dashboard/src/` only.
Do not introduce parallel roots such as `dashboard/core/`, `dashboard/ai/`, or `dashboard/modules/`.

---

## 1. Purpose

This document defines the exact contract for sending processed Phase 7 summaries to Gemini and receiving safe Phase 8 interpretations.

Gemini must receive only:

- precomputed metrics
- reliability scores
- QC limitations
- agronomic context summaries

Gemini must not receive raw rows or compute base metrics.

---

## 2. Gemini System Role

```text
You are an agronomic data interpretation assistant for an alfalfa IoT monitoring dashboard.
You explain processed, quality-controlled metrics.
You do not clean raw data, compute primary metrics, invent missing measurements, or make definitive diagnoses.
You must preserve uncertainty and confidence levels from the input.
```

---

## 3. Input Contract

### 3.1 Top-level shape

```json
{
  "schema_version": "1.0",
  "analysis_type": "weekly_summary | event_analysis | alert_explanation | pivot_comparison",
  "time_window": {
    "from": "ISO UTC",
    "to": "ISO UTC",
    "timezone": "string"
  },
  "crop_context": {
    "crop": "alfalfa",
    "season_status": "active | inactive | unknown",
    "days_since_last_cut": 12,
    "known_limitations": []
  },
  "soil_water": {},
  "irrigation": {},
  "weather": {},
  "ec_trend": {},
  "agronomic_context": {},
  "reliability": {},
  "alerts": [],
  "forbidden_claims": []
}
```

---

## 4. Required Input Sections

### 4.1 Soil water

```json
{
  "soil_water": {
    "pivot_1": {
      "node_id": "MAIN",
      "latest_moisture_percent": 38.2,
      "daily_drop_rate": -0.12,
      "trend": "drying | stable | wetting | unknown",
      "confidence": "medium",
      "limitations": ["No field-capacity calibration"]
    },
    "pivot_2": {
      "node_id": "N2",
      "latest_moisture_percent": 41.0,
      "daily_drop_rate": -0.09,
      "trend": "drying",
      "confidence": "medium",
      "limitations": []
    }
  }
}
```

### 4.2 Irrigation

```json
{
  "irrigation": {
    "recent_sessions": [
      {
        "started_at": "ISO UTC",
        "ended_at": "ISO UTC or null",
        "target_scope": "pivot_1 | pivot_2 | both_pivots | unknown",
        "confidence": "exact | estimated | unknown",
        "response": {
          "pivot_1_delta": 4.2,
          "pivot_2_delta": 2.1,
          "window_quality": "medium",
          "limitations": []
        }
      }
    ]
  }
}
```

### 4.3 Weather

```json
{
  "weather": {
    "heat_hours": {
      "above_30c": 6,
      "above_35c": 1,
      "above_38c": 0
    },
    "vpd": {
      "daily_avg_kpa": 1.8,
      "high_vpd_hours": 4,
      "confidence": "medium"
    },
    "limitations": ["No wind or solar radiation; ET not computed"]
  }
}
```

### 4.4 EC trend

```json
{
  "ec_trend": {
    "pivot_1": {
      "ec_baseline_drift_us_cm": 120,
      "trend": "up | down | stable | unknown",
      "confidence": "low",
      "limitations": ["Raw EC is not ECe"]
    },
    "pivot_2": {}
  }
}
```

### 4.5 Reliability

```json
{
  "reliability": {
    "overall_confidence": "medium",
    "nodes": {
      "MAIN": {
        "score": 0.91,
        "level": "high",
        "reasons": []
      },
      "N2": {
        "score": 0.72,
        "level": "medium",
        "reasons": ["18% missing readings"]
      },
      "N3": {
        "score": 0.88,
        "level": "high",
        "reasons": []
      }
    }
  }
}
```

---

## 5. Forbidden Claims List

Every prompt input must include a forbidden list.

```json
{
  "forbidden_claims": [
    "Do not diagnose disease.",
    "Do not infer NPK or pH.",
    "Do not convert raw EC to ECe.",
    "Do not compute ET.",
    "Do not give exact irrigation amount.",
    "Do not claim yield prediction from sensors alone."
  ]
}
```

---

## 6. Output Contract

Gemini must return valid JSON only.

```json
{
  "summary": "string",
  "confidence": "high | medium | low",
  "key_observations": [
    {
      "title": "string",
      "description": "string",
      "confidence": "high | medium | low",
      "evidence": ["string"],
      "limitations": ["string"]
    }
  ],
  "risks": [
    {
      "title": "string",
      "severity": "info | warning | error",
      "confidence": "high | medium | low",
      "explanation": "string",
      "recommended_checks": ["string"],
      "limitations": ["string"]
    }
  ],
  "hypotheses": [
    {
      "text": "string",
      "confidence": "high | medium | low",
      "not_a_diagnosis": true
    }
  ],
  "not_claimed": ["string"]
}
```

---

## 7. Required Prompt Template

```text
You are an agronomic data interpretation assistant for an alfalfa IoT dashboard.

Use ONLY the provided processed summary.
Do NOT compute new metrics.
Do NOT clean data.
Do NOT infer missing measurements.
Do NOT diagnose disease, nutrients, pH, NPK, salinity class, ET, or yield.
Do NOT convert raw EC to ECe.
Do NOT give exact irrigation amounts.

Preserve the confidence levels and limitations from the input.
If confidence is low, use cautious wording.
If calibration is missing, explicitly say the conclusion is trend/context only.

Return valid JSON matching the required output schema.

INPUT:
{{processed_summary_json}}
```

---

## 8. Validation Rules for Gemini Output

After Gemini responds, the application must validate:

- output is valid JSON
- required keys exist
- confidence values are allowed enums
- no forbidden claim appears
- no EC-to-ECe conversion appears
- no disease/nutrient diagnosis appears
- every risk has limitations
- every hypothesis has `not_a_diagnosis: true`

If validation fails:

```text
Reject Gemini output and show deterministic summary only.
```

---

## 9. Safe Example Output

```json
{
  "summary": "The last 7 days show moderate drying pressure with medium confidence because Pivot 2 has missing readings.",
  "confidence": "medium",
  "key_observations": [
    {
      "title": "Pivot 2 drying trend",
      "description": "Pivot 2 dried faster than Pivot 1 during the selected window.",
      "confidence": "medium",
      "evidence": ["Higher computed moisture drop rate for Pivot 2"],
      "limitations": ["No calibrated refill threshold is available"]
    }
  ],
  "risks": [],
  "hypotheses": [
    {
      "text": "This may indicate different soil water availability or sensor placement between pivots.",
      "confidence": "medium",
      "not_a_diagnosis": true
    }
  ],
  "not_claimed": [
    "No calibrated water-stress diagnosis was made.",
    "No ET or salinity class was computed."
  ]
}
```

---

## 10. Rejection Examples

Reject output if it says:

```text
The field is saline at ECe 4.0 dS/m.
The crop has nitrogen deficiency.
Irrigate 25 mm tomorrow.
The crop has disease.
The yield will be 8 tons.
```

---

## 11. Acceptance Criteria

Gemini prompt contract is ready when:

- input is summary-only
- output is strict JSON
- validation can reject unsafe outputs
- confidence is preserved
- limitations are mandatory
- AI cannot override deterministic metrics

---

End of document.
