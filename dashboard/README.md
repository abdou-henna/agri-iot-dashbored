# Smart Farm IoT Dashboard — Planning Overview

## Vision

A read-only web dashboard that gives farm operators and engineers a clear, accurate view of the field sensor network. The dashboard consumes data already stored in the PostgreSQL database by the WebService. It never writes to the database and never modifies firmware behavior.

The design priority order is: **data accuracy → diagnostic clarity → visual polish**.

---

## Target Users

| User | Primary Need |
|---|---|
| Farm operator | Know whether soil moisture and temperature are in range right now, spot trends, see when the last upload happened |
| Field technician | Trace a gap in data to a specific node failure or LoRa drop; see error codes and event sequences |
| System engineer | Correlate firmware events with sensor anomalies; audit upload history; verify RTC sync |

---

## Physical System Topology

```
Pivot 1 (Main Node, node_id="MAIN")   — local RS485 soil sensor
Pivot 2 (Node 2,   node_id="N2")      — remote RS485 soil sensor over LoRa
Weather (Node 3,   node_id="N3")      — BME280 weather over LoRa
Gateway (GW01)                         — Main Node ESP32, uploads on button press
```

Pivot 1 and Pivot 2 are **independent physical locations** measuring the same three soil parameters. Weather data is **shared context** for both pivots, not duplicated per pivot.

Data arrives in batches via manual upload (button press). The dashboard is not real-time; it reflects the state as of the last upload.

---

## Main Pages

| Page | Purpose |
|---|---|
| Overview | KPI cards, last upload time, node health at a glance |
| Pivot 1 Soil | Time-series and stats for Main Node local soil sensor |
| Pivot 2 Soil | Time-series and stats for Node 2 soil sensor |
| Weather | Air temperature, humidity, and pressure from Node 3 |
| Pivot Comparison | Side-by-side soil metrics across Pivot 1 and Pivot 2 |
| Upload History | Per-upload records, inserted/duplicate counts, timestamps |
| Logs / Events | Full event timeline with severity filters and detail expansion |
| System Health | Gateway and node metadata, LoRa signal quality, boot counters |
| Settings | Time zone, display preferences, date-range defaults |

---

## Data Sources

All data is read from the PostgreSQL database via the WebService REST API.

| Table | Used for |
|---|---|
| `sensor_readings` | All chart data for soil and weather pages, pivot comparison, missing-data markers |
| `system_events` | Logs/Events page, anomaly overlay on charts, system health alerts |
| `uploads` | Upload History page, last-sync indicator on Overview |
| `gateways` | System Health — gateway firmware version, last seen, last upload |
| `nodes` | System Health — per-node last seen, last sequence number |

---

## High-Level Architecture

```
Browser
  └── Dashboard SPA (React + Vite)
        ├── useReadings() hook → GET /api/v1/readings
        ├── useEvents()   hook → GET /api/v1/events
        ├── useStatus()   hook → GET /api/v1/status
        └── useUploads()  hook → GET /api/v1/uploads  [new endpoint needed]

WebService (Node.js / Express on Render)
  └── PostgreSQL (Render managed DB)
```

The dashboard SPA is a static build deployable to any CDN or Render Static Site. It has no server-side rendering requirement.

---

## Design Rules (non-negotiable)

1. **Readings and events are separate.** Never show event rows inside a readings table or vice versa.
2. **Pivot 1 and Pivot 2 are directly comparable** on the comparison page and must use identical scales.
3. **Weather is shared context.** It appears in its own page and as an optional overlay on soil pages; it is never labeled "Pivot N weather."
4. **Missing data must be visible.** Gaps in charts are not hidden by line interpolation. Readings with `status = 'missing'` are shown as distinct markers.
5. **Errors are traceable.** Every chart anomaly (out-of-range reading, error-status point) must link to its corresponding event log entry.
6. **No NPK, pH, or salinity fields.** The schema has `soil_ph` and `soil_salinity` columns; they are always NULL and must never appear in the UI.
7. **Design for expansion.** Future additions (more nodes, additional gateways) should not require structural UI changes.


---

# Revision Addendum — Alfalfa Intelligence + Manual Context

The dashboard is now explicitly designed for an alfalfa monitoring system, while remaining technically compatible with the existing IoT data contract.

## New Product Direction

The dashboard should support three layers:

1. **Sensor layer** — soil, weather, LoRa, upload data.
2. **System observability layer** — technical events/logs.
3. **Agronomic context layer** — manual events such as planting, irrigation, cutting, fertilization, yield, and notes.

## Manual Context Pages

Add the following navigation group:

```text
Agronomy
├── Daily Operations
├── Field Setup / Season
├── Cutting & Yield
├── Fertilization
└── Field Notes
```

## Mobile-First Requirement

Most daily field actions happen on a phone. Therefore:

- Daily irrigation entry must be one of the fastest flows in the app.
- “Start irrigation” and “End irrigation” must be accessible from the mobile Overview page.
- Manual backfill must exist for forgotten entries.
- Cutting/yield/fertilization can live deeper in the app because they are less frequent.
- Last upload/sync time must be visible on Overview and mobile home.

## Alfalfa-Specific Dashboard Meaning

Charts must move beyond generic telemetry and support alfalfa-relevant interpretation:

- possible water stress
- irrigation effectiveness
- heat stress risk
- emergence suitability
- regrowth after cutting
- EC/salinity trend as a calibrated indicator
- data quality confidence

The UI must avoid unsupported claims. It must not diagnose disease, pH, NPK, yield, or growth stage without manual input or additional sensors.


---

# Core Architecture Rule — Data Separation (Non-Negotiable)

The system enforces strict separation between three data domains:

1. Sensor Data (`sensor_readings`)
2. Agronomic Manual Data (`agronomic_events`)
3. System Logs (`system_events`)

## Rules

- These datasets MUST NOT be merged at storage level.
- They MUST NOT share tables or schemas.
- They MUST NOT be displayed as a single dataset.

## Integration Strategy

Integration happens ONLY at:

- Chart overlays
- Time-aligned analytics
- Insight generation
- Cross-navigation between pages

## Forbidden

- Joining readings + logs into one table
- Treating agronomic events as sensor data
- Mixing logs into agronomy workflows

## Allowed

- Overlay irrigation on moisture chart
- Overlay fertilization on EC chart
- Link logs to readings via time window
- Show confidence layer combining all sources

## Guiding Principle

"Separate at storage, integrate at interpretation."

