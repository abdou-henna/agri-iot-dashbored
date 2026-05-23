# Test Scenarios and Validation Plan

## Purpose

This document defines the test scenarios used to validate the Smart Farm IoT monitoring and deterministic analytics platform. It is intended for Chapter 5 of the thesis and should be used to build validation tables, explain observed behavior, and connect the implementation to measurable evidence.

## Validation Dataset

The current validation package uses the following evidence files:

| Evidence file | Role in validation |
|---|---|
| `readings_2026-05-06_to_2026-05-11_1500.csv` | Sensor reading validation for MAIN, N2, and N3 |
| `events_2026-05-06_to_2026-05-11_1500.csv` | System and operational event validation |
| `agronomic_events_2026-05-06_to_2026-05-11_1500.csv` | Manual agronomic context validation |
| `uploads_2026-05-06_to_2026-05-11_1500.csv` | Upload-session validation |
| `upload_queue_2026-05-06_to_2026-05-11_1500.jsonl` | Offline queue and upload payload evidence |
| Processed MAIN soil moisture CSV | Processed Data Viewer and analytics-lineage validation |
| Dashboard screenshots | Visual validation of dashboard charts and upload view |
| Firmware serial transcript | Firmware behavior evidence for RTC, SD, LoRa, ACK, sleep, and upload mode |

## Dataset Summary

| Data domain | Number of records | Time range | Notes |
|---|---:|---|---|
| Sensor readings | 2433 | 2026-05-06 00:00 UTC to 2026-05-11 15:00 UTC | Equal records for MAIN, N2, and N3; all marked `ok` in the provided CSV |
| System events | 8 | 2026-05-08 07:20 UTC to 2026-05-11 08:25 UTC | Includes irrigation-completed events, node-missing events, and one heat-stress warning |
| Agronomic events | 6 | 2026-05-08 05:10 UTC to 2026-05-11 06:35 UTC | Includes irrigation, fertilization, and field note records |
| Upload sessions | 6 | 2026-05-06 to 2026-05-11 | All provided upload records have status `processed` |

## Scenario 1 — Sensor Data Acquisition Across Three Nodes

**Objective:** Verify that the system stores measurements from the three sensing sources: MAIN, N2, and N3.

| Item | Description |
|---|---|
| Input evidence | `readings_2026-05-06_to_2026-05-11_1500.csv` |
| Expected result | Records exist for MAIN, N2, and N3 across the validation period |
| Observed result | The readings file contains 811 records for each node: MAIN, N2, and N3 |
| Validation status | Pass |
| Thesis use | Demonstrates multi-node data acquisition and storage |

## Scenario 2 — Domain Separation Between Soil and Weather Data

**Objective:** Verify that soil data and weather data remain separated by node and metric type.

| Item | Description |
|---|---|
| Input evidence | Sensor readings CSV |
| Expected result | MAIN and N2 provide soil-related measurements, while N3 provides weather measurements |
| Observed result | MAIN and N2 are used for soil context; N3 is used for air temperature, humidity, and pressure context |
| Validation status | Pass |
| Thesis use | Supports the data model and dashboard design sections |

## Scenario 3 — Timestamp Semantics for Sensor Charts

**Objective:** Verify that sensor analysis is based on `measured_at`, not upload time.

| Item | Description |
|---|---|
| Input evidence | Sensor readings CSV, dashboard screenshots |
| Expected result | Chart time axes correspond to measurement timestamps |
| Observed result | Sensor records include `measured_at` covering the validation period, and dashboard charts display time-based trends over the same period |
| Validation status | Pass, with visual confirmation |
| Thesis use | Supports the time-semantics policy and chart validation discussion |

## Scenario 4 — Upload Session Recording

**Objective:** Validate that upload sessions are recorded independently from measurement timestamps.

| Item | Description |
|---|---|
| Input evidence | `uploads_2026-05-06_to_2026-05-11_1500.csv`, upload chart screenshot |
| Expected result | Upload records are available by day and can be visualized in the Upload History page |
| Observed result | Six upload-session records are present, all with status `processed`; the dashboard screenshot shows uploads per day |
| Validation status | Pass |
| Thesis use | Demonstrates upload auditability and offline-first data transfer behavior |

## Scenario 5 — Manual Agronomic Event Recording

**Objective:** Verify that human-entered agronomic context is stored separately from automatic sensor readings.

| Item | Description |
|---|---|
| Input evidence | `agronomic_events_2026-05-06_to_2026-05-11_1500.csv` |
| Expected result | Irrigation, fertilization, and field notes exist in the agronomic event domain |
| Observed result | The dataset includes four irrigation events, one fertilization event, and one field note |
| Validation status | Pass |
| Thesis use | Supports the manual agronomic context layer and demonstrates that the platform is more than a sensor dashboard |

## Scenario 6 — Irrigation Event Context

**Objective:** Verify that irrigation records can be aligned with sensor readings for interpretation.

| Item | Description |
|---|---|
| Input evidence | Agronomic events CSV and sensor readings CSV |
| Expected result | Irrigation events contain field timing that can be compared with soil moisture trends |
| Observed result | Irrigation events include `started_at` and `ended_at` fields, while soil readings provide time-series moisture values |
| Validation status | Pass |
| Thesis use | Enables discussion of pre/post irrigation analysis without claiming automatic irrigation control |

## Scenario 7 — System Event Logging

**Objective:** Verify that operational events are stored separately from sensor readings.

| Item | Description |
|---|---|
| Input evidence | `events_2026-05-06_to_2026-05-11_1500.csv` |
| Expected result | Events such as node-missing or heat warnings are stored as event records and not mixed into sensor rows |
| Observed result | The events dataset includes node-missing events, irrigation-completed events, and one heat-stress warning |
| Validation status | Pass |
| Thesis use | Supports diagnostics, reliability scoring, and observability discussion |

## Scenario 8 — Firmware Communication and ACK Behavior

**Objective:** Verify that MAIN receives LoRa packets and sends acknowledgements to remote nodes.

| Item | Description |
|---|---|
| Input evidence | Firmware serial transcript |
| Expected result | Serial log shows LoRa packet reception, raw payloads, ACK transmission, RSSI/SNR, and node sequence handling |
| Observed result | The serial transcript contains `packet_received`, `ack_sent`, RSSI/SNR values, sleep hints, and frame summaries |
| Validation status | Pass |
| Thesis use | Supports Chapter 3 firmware and communication workflow |

## Scenario 9 — Offline SD Persistence

**Objective:** Verify that readings are written to SD storage before or independently of upload.

| Item | Description |
|---|---|
| Input evidence | Firmware serial transcript, upload queue JSONL |
| Expected result | MAIN stores readings/events locally and later uploads queued data |
| Observed result | Serial logs show SD writes for MAIN, weather, and soil readings; upload queue evidence is available |
| Validation status | Pass |
| Thesis use | Supports offline-first architecture |

## Scenario 10 — Dashboard Chart Rendering

**Objective:** Verify that dashboard charts can visualize sensor and upload data.

| Item | Description |
|---|---|
| Input evidence | Dashboard screenshots |
| Expected result | The dashboard displays comparison charts, weather charts, and upload charts |
| Observed result | Screenshots show a pivot comparison chart, air humidity chart, air temperature chart, and uploads-per-day chart |
| Validation status | Pass |
| Thesis use | Supports Chapter 5 interface validation |

## Scenario 11 — Processed Data Export and Lineage

**Objective:** Verify that processed data can be exported for review.

| Item | Description |
|---|---|
| Input evidence | Processed MAIN soil moisture CSV |
| Expected result | A processed data export exists and can support lineage discussion |
| Observed result | A processed-data CSV for MAIN soil moisture is available for the selected analysis window |
| Validation status | Pass |
| Thesis use | Supports Processed Data Viewer and deterministic analytics transparency |

## Scenario 12 — Reliability and Missing-Node Diagnostics

**Objective:** Verify that the system can represent reliability-related events.

| Item | Description |
|---|---|
| Input evidence | System events CSV and serial transcript |
| Expected result | Missing-node or recovery-related events are visible in diagnostic evidence |
| Observed result | The events dataset contains node-missing entries; the serial transcript shows recovery-mode behavior and frame-level reception state |
| Validation status | Pass |
| Thesis use | Supports the reliability-aware processing and diagnostic dashboard sections |

## Scenario 13 — AI Boundary Validation

**Objective:** Verify that AI interpretation is not treated as deterministic computation.

| Item | Description |
|---|---|
| Input evidence | Project design rules and analytics architecture |
| Expected result | Deterministic analytics, QC, and reliability remain authoritative, while Gemini is interpretation-only |
| Observed result | The project architecture separates deterministic analytics from Gemini interpretation |
| Validation status | Design validation |
| Thesis use | Supports Chapter 4 AI interpretation boundaries |

## Scenario 14 — Unsupported Feature Protection

**Objective:** Ensure that unsupported agronomic claims are not made from available data.

| Item | Description |
|---|---|
| Input evidence | Sensor data fields, limitations document, project constraints |
| Expected result | The thesis does not claim pH, NPK, ECe, disease diagnosis, ET, or yield prediction as implemented capabilities |
| Observed result | These items are explicitly listed as limitations and must not be used as validated outcomes |
| Validation status | Pass if respected in writing |
| Thesis use | Prevents overclaiming in results and discussion |

## Consolidated Validation Table

| Scenario | Validation target | Evidence | Status |
|---:|---|---|---|
| 1 | Multi-node sensor acquisition | Sensor readings CSV | Pass |
| 2 | Soil/weather domain separation | Sensor readings CSV | Pass |
| 3 | Measurement-time chart semantics | Sensor CSV + screenshots | Pass |
| 4 | Upload session recording | Uploads CSV + screenshot | Pass |
| 5 | Manual agronomic event recording | Agronomic events CSV | Pass |
| 6 | Irrigation context alignment | Agronomic events + readings | Pass |
| 7 | System event logging | Events CSV | Pass |
| 8 | LoRa packet/ACK behavior | Serial transcript | Pass |
| 9 | Offline SD persistence | Serial transcript + JSONL queue | Pass |
| 10 | Dashboard chart rendering | Dashboard screenshots | Pass |
| 11 | Processed data export | Processed data CSV | Pass |
| 12 | Reliability diagnostics | Events CSV + serial transcript | Pass |
| 13 | AI boundary | Architecture/design evidence | Design validated |
| 14 | Unsupported feature protection | Limitations and constraints | Writing constraint |

## Notes for Thesis Writing

- These scenarios demonstrate functional feasibility and validation over the provided test window.
- They should not be presented as full-season agronomic validation.
- The dashboard screenshots are real visual evidence provided by the students.
- Generated or reconstructed serial material must be labeled clearly if it is not an original raw serial capture.
- The validation section should distinguish measured data, uploaded data, processed data, system events, and manually entered agronomic events.
