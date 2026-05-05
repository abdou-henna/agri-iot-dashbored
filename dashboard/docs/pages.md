# Page Definitions

Nine pages. Each definition covers: purpose, primary data sources, key components, and navigation context.

---

## 1. Overview

**Purpose:** First page a user sees. Answers "is the system healthy and current?"

**Primary data sources:**
- `GET /api/v1/status` → last-seen per node, recent warnings/errors, gateway metadata
- `GET /api/v1/uploads` → most recent upload record

**Key components:**
- Last upload timestamp ("Last synced: 2026-04-25 10:30 UTC") + age warning if > 24h
- Per-node status card: N2, N3, MAIN — shows last `measured_at`, last `status`, signal quality if applicable
- KPI cards — latest values: Pivot 1 soil temp, Pivot 1 moisture, Pivot 2 soil temp, Pivot 2 moisture, air temp, air humidity, air pressure
- Recent events strip — last 5 events with severity ≥ warning
- Mini sparkline for each KPI (last 24h)

**Navigation:** Top of sidebar. Entry point from any external link.

**Empty state:** No data yet uploaded — show a clear prompt "No data received. Trigger an upload from the field device."

---

## 2. Pivot 1 Soil

**Purpose:** Full sensor view for the Main Node local RS485 soil sensor (physical location: main pivot point).

**Primary data sources:**
- `GET /api/v1/readings?node_id=MAIN&node_type=soil`
- `GET /api/v1/events?node_id=MAIN` (for anomaly overlay)

**Key components:**
- Time-range selector (24h / 7d / 30d / custom)
- Three time-series charts: soil temperature, soil moisture, soil EC
- Daily summary table: avg / min / max per day
- Status breakdown: count of ok / partial / error / missing readings per selected period
- Event overlay markers on charts (sensor_error events)
- Empty / missing-data indicators (gaps in line where status=missing)

**Pivot identity:** Node ID = "MAIN" | Node type = "soil" | Source = local RS485

**Caveats displayed:** "Pivot 1 data may be unavailable while RS485 register map is being configured." (handles the current placeholder state where local sensor returns sensor_error every cycle)

---

## 3. Pivot 2 Soil

**Purpose:** Full sensor view for Node2 remote soil sensor (physical location: second pivot).

**Primary data sources:**
- `GET /api/v1/readings?node_id=N2&node_type=soil`
- `GET /api/v1/events?node_id=N2`

**Key components:** Identical structure to Pivot 1 Soil page:
- Time-range selector
- Three time-series charts: soil temperature, soil moisture, soil EC
- Daily summary table
- Status breakdown
- Event overlay (node_missing, packet_parse_failed events)
- LoRa signal quality sub-chart (rssi + snr over time) — unique to remote nodes
- Missing-data indicators

**Pivot identity:** Node ID = "N2" | Node type = "soil" | Source = LoRa

---

## 4. Weather

**Purpose:** View environmental conditions from Node3 BME280 sensor. Weather is shared context, not attributed to a specific pivot.

**Primary data sources:**
- `GET /api/v1/readings?node_id=N3&node_type=weather`
- `GET /api/v1/events?node_id=N3`

**Key components:**
- Time-range selector
- Three time-series charts: air temperature, air humidity, air pressure
- Daily summary table: avg / min / max per day
- Status breakdown (ok / error / missing per day)
- LoRa signal quality sub-chart (rssi + snr)
- Event overlay (BME280_NOT_FOUND, node_missing events)
- Missing-data indicators

**Weather identity:** Node ID = "N3" | Node type = "weather" | Sensor = BME280

---

## 5. Pivot Comparison

**Purpose:** Direct side-by-side comparison of Pivot 1 and Pivot 2 soil metrics. Identify which pivot is drier, hotter, or more conductive. Support irrigation decisions.

**Primary data sources:**
- `GET /api/v1/readings?node_type=soil` (returns both MAIN and N2)

**Key components:**
- Time-range selector (same range applied to both pivots simultaneously)
- Dual-line soil temperature chart: Pivot 1 (solid) vs Pivot 2 (dashed)
- Dual-line soil moisture chart: same encoding
- Dual-line soil EC chart: same encoding
- Delta panel: numeric difference between Pivot 1 and Pivot 2 for each metric at latest reading
- Missing-data is shown per-pivot as gaps — never hidden
- Legend consistently: Pivot 1 = blue, Pivot 2 = green (same color system site-wide)

**Design constraint:** Both pivots must use identical Y-axis scales for each metric. No auto-scaling that makes one pivot appear more stable than the other.

---

## 6. Upload History

**Purpose:** Audit log of all upload sessions. Answer "when was data last pushed, how much was transferred, did any uploads fail?"

**Primary data sources:**
- `GET /api/v1/uploads` (new endpoint — see api_requirements.md)

**Key components:**
- Sortable table: upload_id, started_at, received_at, records_count, events_count, inserted vs duplicate breakdown, status
- Per-row expand: show raw_summary JSONB, notes
- Upload success/failure bar chart over time (daily)
- Gap detection: highlight calendar days with no upload
- Link from each upload row to the Logs/Events page pre-filtered to that upload_id

**Statuses displayed:**
- `received` — server acknowledged
- `completed` — all records processed (if status is updated post-insert)
- `failed` — server-side failure

---

## 7. Logs / Events

**Purpose:** Full diagnostic log. Primary tool for bug investigation and field troubleshooting. See `logs_page.md` for detailed specification.

**Primary data sources:**
- `GET /api/v1/events` (extended — see api_requirements.md)

**Key components:**
- Chronological event timeline
- Severity filter chips: info / warning / error / critical
- Additional filters: node_id, event_type, error_code, date range, upload_id
- Expandable row: shows `details` JSONB, `message`, `error_code`
- Reading cross-link: if event has a node_id and event_time, offer a link to the nearest reading in that time window
- Export to CSV

---

## 8. System Health

**Purpose:** Technical overview for the engineer. Covers hardware health, LoRa link quality trends, firmware versions, and boot stability.

**Primary data sources:**
- `GET /api/v1/status`
- `GET /api/v1/readings` (for RSSI/SNR trend)
- `GET /api/v1/events` (for rtc_lost_power, lora_init_failed, rtc_drift_detected)

**Key components:**
- Gateway card: firmware_version, last_seen_at, last_upload_at
- Node cards (N2, N3, MAIN): node_type, last_seen_at, last_seq
- RSSI trend chart: N2 and N3 over time
- SNR trend chart: N2 and N3 over time
- Boot-related events list: rtc_lost_power, rtc_init_failed, lora_init_failed (last 30d)
- RTC sync history: rtc_drift_detected, rtc_sync_applied events (last 30d)
- Node sequence gap detector: highlight frames where seq jumped unexpectedly

---

## 9. Settings

**Purpose:** User preferences. No backend writes.

**Components:**
- Display time zone (default: UTC; options: UTC, local browser time, user-selected)
- Default date range on page load (last 24h / 7d / 30d)
- Chart theme (light / dark)
- Dashboard language (reserved; single language initially)
- About panel: WebService version, DB schema version, last schema migration date

Settings are stored in localStorage. No server persistence required.

---

## Navigation Structure

```
Sidebar (always visible, collapsible on mobile)
├── Overview
├── Soil
│   ├── Pivot 1
│   ├── Pivot 2
│   └── Comparison
├── Weather
├── Diagnostics
│   ├── Upload History
│   ├── Logs / Events
│   └── System Health
└── Settings
```

Active page is highlighted. Sidebar collapses to icon-only on screens < 768px.


---

# Revision Addendum — New Agronomic Pages

## 10. Daily Operations

**Purpose:** Fast mobile-first page for daily field work, especially irrigation.

**Primary data sources:**
- `agronomic_events` where `event_category='irrigation'`
- latest `sensor_readings`
- latest upload/status endpoint

**Key components:**
- Active irrigation session card:
  - Start irrigation
  - End irrigation
  - active timer
  - target scope: Pivot 1 / Pivot 2 / both pivots / unknown
- Backfill irrigation form:
  - date
  - start time
  - end time or duration
  - note
- Quick field note button
- Last upload timestamp
- Latest soil moisture for both pivots

**Mobile priority:** This page must be reachable in one tap from the mobile Overview.

---

## 11. Field Setup / Season

**Purpose:** Store low-frequency crop context.

**Fields:**
- Planting date
- Emergence date
- Season start date
- Season end date
- Soil type per farm or pivot
- Optional calibrated moisture thresholds:
  - field capacity
  - refill point
  - wilting point

**Clarification:** Emergence date refers to emergence after planting only. Regrowth after cutting is handled through cutting/regrowth analytics, not as a new emergence date.

---

## 12. Cutting & Yield

**Purpose:** Track alfalfa cutting cycles and production.

**Key components:**
- cutting timeline
- cutting interval in days
- reminders:
  - soft reminder after configured day threshold
  - stronger reminder when overdue
- yield per cutting entry
- season yield summary derived from all cutting yields

**Rule:** Yield is entered after each cutting. Seasonal yield is calculated, not manually duplicated unless a final adjustment is needed.

---

## 13. Fertilization

**Purpose:** Record fertilizer applications and explain later EC or growth changes.

**Fields:**
- date/time
- target scope
- fertilizer type
- product name
- amount + unit
- application method
- regular vs exceptional
- reason if exceptional
- notes

**Analytics use:** Fertilization markers can be overlaid on EC charts. The dashboard must not infer nutrient status directly from EC.

---

## 14. Field Notes

**Purpose:** Timestamped manual observations.

**Note types:**
- general
- damage
- suspected disease
- suspected pest
- yellowing
- equipment issue
- irrigation issue
- weather damage
- other

**Usage:** Notes appear in an agronomic timeline and can be overlaid on charts for anomaly explanation.

---

## Updated Navigation Structure

```text
Sidebar / Mobile Navigation
├── Overview
├── Daily Operations
├── Soil
│   ├── Pivot 1
│   ├── Pivot 2
│   └── Comparison
├── Weather
├── Agronomy
│   ├── Field Setup / Season
│   ├── Cutting & Yield
│   ├── Fertilization
│   └── Field Notes
├── Diagnostics
│   ├── Upload History
│   ├── Logs / Events
│   └── System Health
└── Settings
```


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

