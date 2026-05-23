# Chapter 3 Writing Brief — Part B: Dashboard, Analytics, AI, Deployment, Validation, and Limitations

This file instructs the future writing skill how to write the second half of Chapter 3. Do not draft final thesis prose here.

## Part B coverage

Part B covers sections 3.9 to 3.17.

## 3.9 Dashboard Implementation

Use final dashboard screenshots from:

- `Academic-Thesis/DashBoredImages/Overview.png`
- `Academic-Thesis/DashBoredImages/Pivot.png`
- `Academic-Thesis/DashBoredImages/Comparison.png`
- `Academic-Thesis/DashBoredImages/Weather.png`
- `Academic-Thesis/DashBoredImages/FieldNotes.png`
- `Academic-Thesis/DashBoredImages/Insights.png`
- `Academic-Thesis/DashBoredImages/AiInsight.png`
- `Academic-Thesis/DashBoredImages/ProcessedData .png`

Must explain:

- Dashboard as visualization and monitoring layer.
- Overview page.
- Soil/pivot monitoring.
- Weather context.
- Pivot comparison.
- Diagnostics and upload traceability.
- Agronomic events and field notes.
- Insights and processed data transparency.

Do not describe UI as final commercial product; describe it as implemented dashboard interface for monitoring, validation, and interpretation.

## 3.10 Deterministic Analytics Layer

Must explain:

- Cleaning.
- Quality control.
- Metrics.
- Reliability scoring.
- Deterministic alerts.
- Analytics snapshots.
- Incremental reuse and cursor processing if relevant.

Must state:

- Deterministic analytics are authoritative.
- AI does not compute primary analytics.
- Missing values and low reliability remain visible.

Use figure:

- `Academic-Thesis/Diagrams/Activity Diagram.png`
- `validation_package/05_api_and_analytics/qc_reliability_flowchart.md` if converted or described as table/flow.

Suggested tables:

- `tab:qc-rules`
- `tab:reliability-factors`

## 3.11 Processed Data Viewer

Use figure:

- `Academic-Thesis/DashBoredImages/ProcessedData .png`

Must explain:

- Read-only transparency layer.
- Raw, cleaned, processed values when available.
- QC flags.
- Reliability indicators.
- Deterministic alerts.
- Safe export.
- It is not an editing interface.

## 3.12 AI Interpretation Layer

Use figure:

- `Academic-Thesis/DashBoredImages/AiInsight.png`

Must explain:

- Gemini is accessed through backend proxy only.
- Input is processed snapshot/analytics context, not unrestricted frontend direct API calls.
- Reliability gate is applied before interpretation.
- Gemini gives narrative explanation only.
- Gemini does not mutate data, fill missing values, compute analytics, diagnose disease, or predict yield.

## 3.13 Field Deployment

Use:

- Physical node photos.
- Component photos.
- Validation package.

Must explain:

- Physical assembly.
- Field-oriented deployment intention.
- Node roles.
- Manual operation: long press for upload, four presses for RTC sync.
- Use cautious language if exact field duration is limited.

Figures:

- MAIN node front/back.
- Second node front/back.
- Weather node front/back.
- Component photos only when they support the section.

## 3.14 Data Analysis and Results

Use:

- Validation CSV files.
- Dashboard screenshots.
- final validation evidence.
- processed data export.

Must discuss:

- Soil moisture trends.
- Soil temperature and EC as supported monitoring fields.
- Pivot comparison.
- Weather context.
- Missing data and node reliability.
- Upload history.
- Manual agronomic event context if available.

Do not claim calibration-based agronomic thresholds unless project evidence provides them.

## 3.15 Validation and Testing

Use:

- `validation_package/02_validation_evidence/final_validation_evidence.md`
- `validation_package/02_validation_evidence/validation_summary.md`
- `validation_package/02_validation_evidence/validation_table.csv`
- validation screenshots.
- serial alignment files.

Must organize validation into:

1. Firmware/hardware validation.
2. Communication validation.
3. Local storage and upload validation.
4. Backend ingestion validation.
5. Dashboard validation.
6. Analytics/Processed Data Viewer validation.
7. AI interpretation boundary validation.

Use screenshots:

- `01_pivot_comparison_expanded_24h.png`
- `02_weather_air_humidity_7d.png`
- `03_uploads_per_day.png`
- `04_weather_air_temperature_7d.png`

## 3.16 Limitations

Must include:

- No pH implementation in thesis scope.
- No NPK implementation.
- No evapotranspiration computation.
- No disease diagnosis.
- No yield prediction.
- EC is a relative trend/context signal, not official salinity classification.
- Field duration/scope limited to available evidence.
- AI interpretation is non-authoritative.
- Additional calibration would be needed for stronger agronomic conclusions.

Use `Academic-Thesis/limitations.md` and `validation_package/06_thesis_support/limitations.md`.

## 3.17 Chapter Summary

Summarize how the implementation responds to the gaps identified in Chapter 2:

- Offline-first.
- Low-power.
- Recovery.
- RTC time integrity.
- Alfalfa-focused data collection.
- Dashboard and analytics.
- AI interpretation boundary.
