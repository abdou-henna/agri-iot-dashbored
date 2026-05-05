# Phase 7 & Phase 8 — Implementation Addendum

This document extends the existing project plan by introducing a **new Phase 7 (Deterministic Data Processing Layer)** and **Phase 8 (AI Interpretation Layer)**.

⚠️ Important:
- These phases MUST be inserted **before** the previous Phase 7 (validation/testing phase).
- The previous Phase 7 should be renamed to a later phase (e.g., Phase 9).

---

# 🧱 Phase 7 — Data Cleaning & Processing (Deterministic Layer)

## 🎯 Objective
Build a **fully deterministic, auditable data pipeline** that transforms raw IoT data into:
- Clean data
- Quality-controlled signals
- Reliable metrics
- Confidence scores

This layer is **mandatory before any AI usage**.

---

## 🔒 Core Principles

- Strict **domain separation**:
  - sensor_readings → `measured_at`
  - system_events → `event_time`
  - agronomic_events → `started_at` / `ended_at`
- Missing data must NEVER be converted to zero
- All processing must be deterministic (no AI involvement)
- Every output must include a confidence/reliability component

---

## 🧹 Data Cleaning Rules

### 1. Timestamp Validation
- Enforce monotonic time ordering
- Detect future timestamps
- Normalize UTC and local time

### 2. Deduplication
- Remove duplicate rows using:
  - node_id
  - timestamp
  - payload hash

### 3. Missing Data Handling
- Preserve missing values explicitly:
  - `is_missing`
  - `missing_reason`

### 4. Physical Plausibility Checks
- Remove impossible values (e.g., moisture < 0 or > 100)

### 5. Flatline Detection
- Detect sensors stuck at constant values
- Output:
  - `flatline_flag`
  - `flatline_duration`

### 6. Spike / Step Detection
- Detect abnormal jumps using short-window derivatives

### 7. Event Window Validation
- Validate pre/post data completeness for irrigation and cutting events

---

## 📊 Feature Engineering (Metrics)

### Core Metrics

- Moisture drop rate
- Irrigation response delta (pre/post)
- Irrigation response lag
- Heat stress hours
- VPD (from temperature + humidity)
- EC baseline drift (trend only)
- Missing data percentage
- Cutting interval length

---

## 📈 Reliability Layer

### Node Reliability Score
Computed from:
- Missing data %
- Flatline duration
- Spike frequency
- System errors
- Communication quality (if available)

Output:
- `node_reliability_score`

---

## 📦 Output Structure

The deterministic layer produces structured summaries:

- Aggregated metrics (hourly/daily)
- Event-based metrics (irrigation, cutting)
- Reliability scores
- Context features (days since cut, last irrigation)

---

## ⚙️ System Components

### Core Services
- Data cleaning service
- QC engine
- Feature engineering service
- Aggregation service
- Reliability scoring service

---

# 🤖 Phase 8 — AI Interpretation Layer (Gemini)

## 🎯 Objective
Use AI ONLY for:
- Interpretation
- Pattern explanation
- Risk summarization
- Hypothesis generation

AI must NOT perform computation or data correction.

---

## 🔒 AI Constraints

Gemini MUST NOT:
- Clean or modify raw data
- Compute base metrics
- Infer missing environmental variables (rain, wind, etc.)
- Convert EC to ECe
- Diagnose disease or nutrients
- Provide exact irrigation prescriptions

---

## 📥 AI Input

Gemini receives ONLY processed summaries:

- Soil water metrics
- Irrigation analysis
- Weather stress indicators
- EC trends (relative only)
- Reliability scores
- Agronomic event context

---

## 📤 AI Output

Gemini generates:

- Summary of current conditions
- Key risks
- Observations
- Hypotheses (non-definitive)
- Confidence level (based on input reliability)

---

## 🧠 AI Responsibilities

- Explain relationships between:
  - irrigation
  - soil moisture
  - weather stress
  - cutting cycles
- Highlight anomalies and patterns
- Provide cautious insights using language like:
  - “may indicate”
  - “possible trend”

---

## ⚙️ Integration Design

- AI consumes ONLY precomputed features
- AI outputs are layered on top of deterministic results
- Confidence from Phase 7 must propagate into AI outputs

---

# 🧭 Implementation Order

1. Domain separation rules
2. Data cleaning pipeline
3. QC and reliability scoring
4. Feature engineering (metrics)
5. Aggregation layer
6. Structured output generation
7. AI input mapping
8. Gemini integration

---

# ⚠️ Critical Notes

- Phase 7 is the **foundation of trust** in the system
- Phase 8 is **interpretation only, not computation**
- Any violation of these boundaries leads to incorrect agronomic conclusions

---

End of document.

