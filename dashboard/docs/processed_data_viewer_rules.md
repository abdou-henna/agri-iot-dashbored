# Processed Data / Cleaned Analytics Viewer Rules

## 1. Purpose
Strict implementation guardrails for building the Processed Data / Cleaned Analytics Viewer in a future code prompt.

## 2. Non-negotiable rules
- Viewer is read-only.
- NEVER mutate raw readings.
- NEVER overwrite raw value with cleaned value.
- NEVER convert missing values to zero.
- NEVER merge raw sensor/system/agronomic/upload domains.
- NEVER use upload/received timestamps as sensor analysis time.
- NEVER label Gemini output as processed data.
- NEVER hide QC failures.
- NEVER hide reliability limitations.
- NEVER infer pH, NPK, salinity class, disease, yield, or ET.
- NEVER export secrets, raw payload secrets, API keys, or DB credentials.

## 3. Data source rules
- Use existing deterministic analytics snapshot sources and analytics utility outputs only.
- Do not add alternate side-channel data derivations.
- Keep domain identifiers explicit in every row/view model.

## 4. Time semantics rules
- Sensor analytic time reference must remain measured/observation time.
- Upload/received timestamps are metadata only and must be labeled as transfer/server-receive context.
- If both appear, show both with explicit labels; no silent fallback.

## 5. Raw/cleaned/processed terminology rules
- Raw = immutable source measurement field.
- Cleaned = deterministic derived display value from cleaning stage.
- Processed = deterministic post-cleaning status (QC/reliability/alerts/derived metrics).
- Gemini interpretation is separate and must not be renamed as processed output.

## 6. UI rules
- Place viewer in analytics/insights flow (drawer/sheet first).
- No destructive actions, no edit controls, no save/mutation CTA.
- QC, reliability, and limitation messaging must remain visible in normal reviewer path.
- Missing/null data must render as missing/null markers, not synthetic values.

## 7. Export rules
- Export must include only safe derived/reporting fields.
- Export field names must preserve lineage (raw vs cleaned vs processed).
- Exclude raw secrets, credentials, and sensitive payload internals.

## 8. Forbidden shortcuts
- Do not collapse multiple domain timestamps into one “event time.”
- Do not suppress low-reliability rows to make charts/tables look cleaner.
- Do not recalculate deterministic analytics in UI if snapshot output already exists.
- Do not route this work through Gemini transformations.

## 9. Validation requirements
- Validate viewer output against analytics snapshot contract and QA/QC/reliability/alert rule docs.
- Validate that QC failures remain visible under default filters.
- Validate that export excludes sensitive fields.
- Validate that no runtime write paths are introduced.

## 10. Future implementation prompt boilerplate
Use the following constraints in the implementation prompt:
1) Build Processed Data / Cleaned Analytics Viewer UI only (drawer/sheet first) in analytics area.
2) Reuse existing deterministic snapshot/hooks/types; do not alter deterministic algorithms.
3) Keep viewer read-only with safe export.
4) Preserve strict domain and time semantics.
5) Explicitly separate deterministic alerts from Gemini interpretation content.
6) Include tests/checks for raw immutability, missing-value handling, QC visibility, reliability limitations, and safe export.
