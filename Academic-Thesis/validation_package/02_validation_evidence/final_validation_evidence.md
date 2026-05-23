# Final Validation Evidence Notes

## Evidence included

1. Sensor readings export covering `2026-05-06T00:00:00+00:00` to `2026-05-11T15:00:00+00:00`.
2. Upload session export with `6` processed sessions and `3` total upload errors.
3. Manual agronomic events export containing irrigation, fertilization, and field note events.
4. Processed data export containing deterministic processing status, reliability score, alert references, and limitations.
5. Firmware serial transcript aligned with the uploaded data window.
6. Real dashboard screenshots provided by the project owner for thesis validation evidence.

## What this evidence can support in the thesis

- The system stores and exports sensor readings for MAIN, N2, and N3.
- The system preserves measurement time through `measured_at`.
- Manual agronomic events such as irrigation, fertilization, and field notes exist as a separate context layer.
- Upload sessions can be audited independently of measurement timestamps.
- Processed data exposes reliability and limitations, supporting the transparency objective of the Processed Data Viewer.

## What this evidence must not overclaim

- It must not claim pH support unless separately validated.
- It must not claim official salinity class or ECe conversion.
- It must not claim disease diagnosis, ET calculation, or yield prediction.
- Only the screenshots under `02_validation_evidence/dashboard_screenshots/` should be presented as live dashboard screenshots.
- It must not present the aligned serial transcript as an unmodified raw hardware capture.

## Real dashboard screenshots included

- `dashboard_screenshots/01_pivot_comparison_expanded_24h.png` — expanded pivot comparison chart.
- `dashboard_screenshots/02_weather_air_humidity_7d.png` — seven-day air humidity chart.
- `dashboard_screenshots/03_uploads_per_day.png` — uploads per day chart.
- `dashboard_screenshots/04_weather_air_temperature_7d.png` — seven-day air temperature chart.
