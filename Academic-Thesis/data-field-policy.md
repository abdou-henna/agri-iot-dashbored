# Data Field Policy — Thesis Writing Guardrails

## Purpose

This policy defines which data fields and system capabilities may be described in the thesis. It prevents unsupported agronomic, AI, or data-quality claims.

## Canonical domains

| Domain | Time field | Thesis role |
|---|---|---|
| `sensor_readings` | `measured_at` | Sensor charts, trends, analytics, pivot comparison |
| `system_events` | `event_time` | Firmware/backend diagnostics, recovery, upload, reliability evidence |
| `uploads` | transfer/upload metadata only | Audit trail and offline/batch transfer evidence |
| `agronomic_events` | `started_at` / `ended_at` | Irrigation, cutting, fertilization, yield records, notes |

## Supported sensor interpretation

### Soil

The thesis may discuss:

- Soil moisture trend.
- Soil temperature context.
- Soil electrical conductivity as a relative/contextual signal.
- Pivot 1 vs Pivot 2 comparison.
- Missing data and reliability.

The thesis must not claim:

- Official salinity class.
- Laboratory-grade EC interpretation.
- pH measurement.
- NPK measurement.
- Nutrient diagnosis.

### Weather

The thesis may discuss:

- Air temperature.
- Humidity.
- Atmospheric pressure.
- Weather context for sensor interpretation.

The thesis must not claim:

- Evapotranspiration computation.
- Rainfall, wind, or solar radiation analysis unless sensors are later added.

## Agronomic events

Manual agronomic events may be described as context:

- Irrigation events.
- Cutting/yield records.
- Fertilization events.
- Field notes.

They must not be described as automatic agronomic decisions or predictive outputs.

## AI boundary

Gemini must be described only as an interpretation layer:

- It explains deterministic analytics outputs.
- It does not compute primary analytics.
- It does not mutate data.
- It does not fill missing data.
- It does not diagnose disease.
- It does not predict yield.
- It is accessed only through the backend proxy.

## Firmware mode policy

The thesis must explain the field motivation for each mode:

| Mode | Allowed thesis description |
|---|---|
| Power Saving Mode | Created because field power is unstable and battery replacement is impractical; uses deep sleep, relay control, forced measurement, limited radio use. |
| Recovery Mode | Created after observing that a missed communication could desynchronize a node and prevent normal reconnection; uses retry/recovery and logs events. |
| Upload Mode | Created because continuous Internet is difficult in the field; triggered by long continuous push-button press. |
| RTC Sync Mode | Created to protect measurement-time integrity; triggered by four consecutive push-button presses. |
| Local Storage Mode | Stores readings/events locally on SD to avoid data loss during offline periods. |
| Diagnostic Logging Mode | Records system events for troubleshooting and reliability discussion. |

## Screenshot policy

- `Academic-Thesis/DashBoredImages/` contains accepted final dashboard screenshots.
- `Academic-Thesis/validation_package/02_validation_evidence/dashboard_screenshots/` contains accepted validation screenshots.
- Do not use screenshots as proof of agronomic truth; use them as interface and validation evidence.

## Unsupported claims

Do not claim:

- Disease diagnosis.
- Yield prediction.
- Automatic irrigation prescription.
- ET calculation.
- Official salinity classification.
- Nutrient diagnosis.
- Full commercial deployment performance.
- Warning-free build if only non-blocking warnings are documented.
