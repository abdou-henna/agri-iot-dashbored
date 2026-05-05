# Alfalfa Agronomy Foundation — Dashboard Analysis Rules

**Project:** Smart Farm IoT Dashboard  
**Crop:** Alfalfa / Lucerne  
**Scope:** Agronomic interpretation boundaries for Phase 7 and Phase 8  
**Status:** Implementation specification

## Approved folder placement

Phase 7/8 documentation in this file maps to the existing dashboard structure under `dashboard/src/` only.
Do not introduce parallel roots such as `dashboard/core/`, `dashboard/ai/`, or `dashboard/modules/`.

---

## 1. Purpose

This document translates the alfalfa research foundation into implementation rules for the dashboard.

It defines what the current IoT system can analyze safely, what requires calibration, and what must not be claimed.

---

## 2. Current Data Available

The current system provides:

### Soil sensors — Pivot 1 and Pivot 2

- soil moisture percentage
- soil temperature
- soil EC in µS/cm

### Weather node

- air temperature
- relative humidity
- barometric pressure

### System diagnostics

- missing nodes
- sensor errors
- RSSI/SNR
- upload events
- RTC/system logs

### Manual agronomic events

- irrigation sessions
- cutting events
- fertilization
- yield records if entered
- season start/end
- field notes

---

## 3. Current Data Not Available

The system does not currently measure:

- pH
- NPK
- rainfall
- wind speed
- solar radiation
- leaf wetness
- canopy temperature
- images/scouting observations
- plant height
- root depth
- lab ECe
- soil/tissue nutrient tests

Therefore, the dashboard must not infer these as facts.

---

## 4. Soil Water Interpretation

### 4.1 Valid now

The system can analyze:

- moisture trends
- drying rate
- pivot-to-pivot moisture comparison
- pre/post irrigation moisture response
- time-series gaps and reliability

### 4.2 Requires calibration

Absolute water-stress interpretation requires:

- soil texture
- sensor depth
- field capacity or local full point
- refill threshold / PWP equivalent
- installation verification

Without these, soil moisture is a relative trend, not an absolute stress diagnosis.

### 4.3 Implementation rule

Before calibration, use wording such as:

```text
Pivot 2 is drying faster than its recent baseline.
```

Do not say:

```text
Pivot 2 is below the alfalfa water-stress threshold.
```

---

## 5. Irrigation Response

### 5.1 Valid now

Irrigation response is one of the strongest supported analyses.

Metrics:

- pre/post moisture delta
- response lag
- response consistency by pivot
- poor-response flag with caveats

### 5.2 Required context

Interpretation depends on:

- irrigation timing accuracy
- irrigation duration
- sensor depth
- soil texture
- data completeness
- recent cutting status
- weather demand

### 5.3 Implementation rule

Poor response should be described cautiously:

```text
The sensed zone showed limited moisture increase after irrigation. Possible explanations include under-refill, deep infiltration, sensor placement, or event timing uncertainty.
```

Do not say:

```text
Irrigation failed.
```

---

## 6. Cutting and Regrowth

Alfalfa water use changes strongly after cutting.

After cutting:

- canopy is reduced
- water use may drop
- regrowth gradually increases water demand
- short cutting intervals may affect persistence and reserves

### 6.1 Valid metrics

- days since last cut
- cutting interval length
- post-cut moisture drop rate
- post-cut heat/VPD burden
- yield per cutting if manually recorded

### 6.2 Implementation rule

Do not treat slower drying after cutting as automatically suspicious.

Use cutting context in irrigation and moisture interpretation.

---

## 7. Weather Stress

### 7.1 Air temperature

Valid uses:

- heat-stress hours
- cool-period tracking
- establishment context
- regrowth context

Thresholds must be configurable and contextual.

### 7.2 Relative humidity and VPD

VPD can be estimated from air temperature and RH.

Valid:

- atmospheric drying pressure
- high-demand periods
- support for explaining faster soil drying

Invalid:

- ET calculation
- irrigation amount calculation

Reason:

The system lacks solar radiation and wind speed.

---

## 8. Soil Temperature

Soil temperature is especially useful for:

- establishment
- germination context
- early root growth context
- cool stress during early season

Interpretation requires:

- planting date
- emergence date if available
- sensor depth
- cultivar/local context if available

Do not predict exact growth stage from soil temperature alone.

---

## 9. EC / Salinity Interpretation

### 9.1 Critical boundary

```text
Raw soil EC in µS/cm is not saturated-paste ECe.
```

The dashboard may analyze:

- EC trend
- EC baseline drift
- EC response to moisture
- relative EC caution

The dashboard must not display:

- official salinity class
- FAO yield loss estimate
- ECe conversion
- definitive salinity diagnosis

### 9.2 Safe wording

Allowed:

```text
EC is trending upward relative to its recent baseline.
```

Forbidden:

```text
The soil salinity is above the alfalfa threshold.
```

unless calibrated ECe data exists.

---

## 10. Fertilization Interpretation

Fertilization events are context only.

Valid:

- timing offsets relative to irrigation
- timing offsets relative to cutting
- field-operation history
- possible context for EC changes

Invalid:

- nutrient deficiency diagnosis
- NPK sufficiency claim
- pH interpretation

Nutrient diagnosis requires soil and/or tissue tests.

---

## 11. Yield Interpretation

Yield records, if manually entered, are valuable.

Valid:

- yield per cutting
- yield vs cutting interval context
- yield vs pre-cut moisture context
- yield vs heat/VPD burden context

Invalid:

- exact yield prediction from current sensors alone
- causal proof from observational correlations

---

## 12. Disease Interpretation

The current system cannot diagnose disease.

It lacks:

- pathogen confirmation
- scouting data
- images
- rainfall
- leaf wetness
- canopy wetness duration

Allowed:

```text
Conditions may be favorable for some disease pressure.
```

Forbidden:

```text
Disease is present.
```

---

## 13. Valid Analysis Modules

The dashboard may safely implement:

1. Soil Water Status
2. Irrigation Effectiveness
3. Pivot Comparison
4. Weather Stress
5. VPD / Drying Pressure
6. EC Trend Indicator
7. Cutting and Regrowth Context
8. Fertilization Context
9. Yield Context
10. Data Quality and Reliability
11. Gemini Agronomic Summary from processed metrics only

---

## 14. Deferred Analyses

Defer until more data exists:

| Analysis | Required additions |
|---|---|
| ET / crop water use | solar radiation, wind, crop coefficient, better weather stack |
| Official salinity | lab ECe or calibrated transfer function |
| Nutrient diagnosis | soil/tissue tests |
| Disease detection | scouting/images/leaf wetness/rainfall |
| Growth stage detection | plant observations or canopy sensing |
| Exact yield prediction | many seasons of yield + richer agronomic data |

---

## 15. AI Interpretation Rules

Gemini may summarize:

- possible under-refill
- faster drying after high VPD
- pivot differences
- reliability limitations
- cutting context

Gemini must not diagnose:

- disease
- nutrient deficiency
- official salinity
- exact water requirement
- exact yield

---

## 16. Implementation Acceptance Criteria

The agronomic foundation is correctly implemented when:

- soil moisture is trend-only until calibration exists
- EC remains trend-only until calibrated ECe exists
- VPD is computed but ET is not
- cutting context influences interpretation
- fertilization is context only
- reliability limitations are visible
- Gemini summaries preserve uncertainty

---

End of document.
