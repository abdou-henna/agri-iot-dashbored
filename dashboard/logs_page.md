# Logs / Events Page — Detailed Specification

The Logs/Events page is a first-class diagnostic tool, not an afterthought. It is the primary interface for tracing a chart anomaly back to a root cause.

---

## Design Principle

Events and readings are always kept separate. The logs page shows only `system_events` rows. Readings are accessible via cross-links from event rows — never embedded in the events table itself.

---

## Page Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  FILTERS BAR                                                    │
│  [Severity ▾] [Node ▾] [Event Type ▾] [Error Code ▾] [Date ▾] │
│  [Upload ID ▾]                         [Clear filters] [Export] │
├─────────────────────────────────────────────────────────────────┤
│  MINI HISTOGRAM — events per day (stacked by severity)          │
├─────────────────────────────────────────────────────────────────┤
│  EVENTS TABLE (paginated, 50 rows per page)                     │
│  [event rows — see table columns below]                         │
├─────────────────────────────────────────────────────────────────┤
│  PAGINATION BAR                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Filter Controls

| Filter | Type | Values | Notes |
|---|---|---|---|
| Severity | Multi-select chips | info / warning / error / critical | Default: all enabled; one click to toggle one severity |
| Node | Dropdown | MAIN / N2 / N3 / (gateway-level = no node) | NULL node_id = gateway-level events |
| Event Type | Searchable dropdown | all known event_type values | Type-ahead on input |
| Error Code | Searchable dropdown | all distinct error_code values | NULL = no error code |
| Date range | Date-picker range | from / to, TIMESTAMPTZ | Defaults to last 7d |
| Upload ID | Text input | free-text match against upload_id | For tracing events from a specific upload session |

All filters are ANDed. URL query params reflect active filters so pages are shareable/bookmarkable.

---

## Recommended Table Columns

| Column | Field | Format | Notes |
|---|---|---|---|
| Time | `event_time` | `YYYY-MM-DD HH:mm:ss UTC` | Sortable; default sort = DESC |
| Severity | `severity` | Colored badge: INFO / WARN / ERROR / CRITICAL | info=grey, warning=orange, error=red, critical=dark red |
| Node | `node_id` | Text; "—" if NULL | |
| Event Type | `event_type` | Monospace text | |
| Error Code | `error_code` | Monospace text; "—" if NULL | |
| Message | `message` | Truncated to 80 chars; click to expand | |
| ▶ | Expand button | | Opens detail panel inline |

Do not show `event_id`, `upload_id`, `gateway_id`, `received_at` in the collapsed row — they appear in the expanded panel.

---

## Expanded Row — Detail Panel

Clicking ▶ on a row expands it inline (accordion pattern):

```
┌─ Event Detail ─────────────────────────────────────────────────┐
│  event_id:    EVT-GW01-20260425-100039-001                     │
│  gateway_id:  GW01                                             │
│  upload_id:   UPL-GW01-20260425-103000                         │
│  received_at: 2026-04-25T10:30:15Z                             │
│                                                                 │
│  Full message:                                                  │
│  "RTC drift exceeds threshold — applying correction"            │
│                                                                 │
│  Details (JSON):                                                │
│  {                                                              │
│    "drift_s": 47                                               │
│  }                                                              │
│                                                                 │
│  [View nearby readings →]   [Filter by this upload_id →]       │
└─────────────────────────────────────────────────────────────────┘
```

The "View nearby readings" link navigates to the Pivot 1 or Pivot 2 page (based on node_id), pre-filtered to a ±5-minute window around `event_time`. This is the primary mechanism for tracing a log entry to a sensor anomaly.

---

## Reading ↔ Log Relation

Events and readings are linked by:

1. **Shared `upload_id`** — every reading and every event in the same upload session share the same `upload_id`. Filtering events by upload_id shows everything that arrived in one button-press.

2. **Shared `node_id` + `event_time` ≈ `measured_at`** — a `node_missing` event at T and a `status=missing` reading at T are the same physical absence, recorded in two tables. The logs page surfaces the event; the pivot page surfaces the reading gap. Neither is the canonical truth; both confirm the same problem.

3. **Error codes** — a `sensor_error` event from MAIN with `error_code=LOCAL_RS485_TIMEOUT` corresponds to a missing or error-status reading from node_id=MAIN in the same frame.

Do not merge these into one row. Surface the link as a navigation action, not by mixing table data.

---

## Bug Investigation Workflow

A recommended trace workflow for the field engineer:

```
1. Open Logs / Events
2. Filter severity = error + warning, date = last 7d
3. Sort by event_time ASC to read chronologically

4. See "node_missing" warning for N2 at 2026-04-25 09:50
5. Click ▶ to confirm error_code = NODE_TIMEOUT
6. Click "View nearby readings →"

7. Land on Pivot 2 Soil page, zoomed to 09:45–09:55
8. Confirm gap in soil moisture chart at that timestamp
9. Look at RSSI chart — was signal poor in that hour?

10. Return to Logs, filter event_type = packet_received for N2
11. See last successful packet was at 09:40 (seq=123)
12. Next packet is at 10:00 (seq=124) — one cycle missed
13. Root cause: N2 missed one 10-min cycle, possibly sensor warmup delay or LoRa collision
```

This workflow requires:
- Cross-linking from event row to readings page with time filter
- RSSI chart on Pivot 2 page
- node_seq visible in readings (needs API change — see api_requirements.md)

---

## Export

- **Format:** CSV download
- **Fields exported:** event_time, severity, node_id, event_type, error_code, message, details (stringified JSON), event_id, upload_id
- **Scope:** applies current active filters
- **Filename:** `events_YYYYMMDD_YYYYMMDD.csv`

---

## Empty States

| Condition | Message shown |
|---|---|
| No events match filters | "No events found for the selected filters. Try widening the date range or clearing some filters." |
| No events at all in DB | "No events have been received yet. Upload data from the field device to populate this log." |
| API error | "Could not load events. Check WebService connectivity." (with retry button) |

---

## Performance Notes

- Default page size: 50 events per page
- Pagination: cursor-based preferred (keyset on event_time + event_id) to avoid offset degradation on large tables
- Mini histogram query: one separate aggregation query (count + severity group by day), not computed from the main event list
- Event timeline chart (L-1) in charts.md uses a separate, lighter query scoped to the current filter set


---

# Revision Addendum — Relationship With Agronomic Events

The Logs / Events page remains dedicated to technical `system_events`.

Manual agronomic events must not be mixed into the technical logs table.

## Separation Rule

| Data kind | Table / source | UI location |
|---|---|---|
| Sensor readings | `sensor_readings` | Soil, Weather, Comparison |
| Technical events | `system_events` | Logs / Events, System Health |
| Manual agronomic events | `agronomic_events` | Daily Operations, Agronomy pages, chart overlays |

## Cross-Linking

Technical events may link to agronomic context when useful.

Example:
- sensor anomaly after fertilization → chart overlay shows fertilization marker
- node missing during irrigation → Logs row links to nearby irrigation session

But the records remain separate.
