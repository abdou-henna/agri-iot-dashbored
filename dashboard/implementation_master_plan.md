# Smart Farm IoT Dashboard — Implementation Master Plan

---

## Cross-Phase Constraints (Enforced in Every Phase)

The following rules are non-negotiable and must be verified at every phase gate:

- **WebService is the exclusive data access layer.** The frontend never connects to PostgreSQL directly. All data flows through `src/api/client.ts` → WebService REST endpoints.
- **Three data domains are never merged.** `sensor_readings`, `agronomic_events`, and `system_events` remain separated at storage, API, hook, state, and UI layers. Integration occurs only through chart overlays, cross-navigation, and derived view models.
- **Time semantics are enforced at the field boundary.** `measured_at` drives all sensor charts. `event_time` drives the logs page. `started_at`/`ended_at` drives agronomy. `received_at` and `upload.started_at` are restricted to Upload History and debug panels. UTC→local conversion happens in the UI only, via `src/utils/time.ts`. The database and API always receive and return UTC.
- **The dashboard reflects batch upload reality.** It is not real-time. The Overview page always shows both "last measurement time" and "last upload time" as distinct indicators. No polling loop implies live data.
- **The frontend architecture is fixed.** Folder structure, hook naming, query key conventions, and component boundaries defined in `frontend_architecture.md` are followed exactly. No component calls `fetch()` directly.

---

## Phase 1 — Foundation & Backend P0 Enhancements

### Goal
Establish the full technical skeleton: project scaffold, API client, TypeScript types, routing shell, time utilities, and the WebService enhancements that every subsequent phase depends on. No page is fully functional yet, but the data pipeline from PostgreSQL to browser component is proven end-to-end with real data on the Overview page.

### Scope

**Frontend:**
- React 18 + Vite + TypeScript project scaffold
- Tailwind CSS configured with the defined color system (Pivot 1 blue, Pivot 2 green, Weather amber, Error red, Missing grey, Warning orange)
- React Router v6 with routes for all 14 pages returning empty stubs
- `src/api/client.ts` with `apiGet`, `apiPost`, `apiPatch` — base URL from `VITE_API_BASE_URL`, JSON error normalization, timeout handling
- `src/types/` — complete TypeScript interfaces for `SensorReading`, `SystemEvent`, `AgronomicEvent`, `AggregatePoint`, `UploadRecord`, `NodeHealth`, `StatusResponse`, all union types (`NodeId`, `NodeType`, `ReadingStatus`, `EventSeverity`, `AgroCategory`, `TargetScope`, `TimeConfidence`)
- `src/utils/time.ts` — `formatDisplayTime()`, `formatDisplayDate()`, `toChartTime()`, `getCurrentDisplayTimezone()` — UTC input, local/farm output, no conversion in any other file
- `src/hooks/useStatus.ts`, `src/hooks/useUploads.ts` — TanStack Query wrappers with query keys `['status']` and `['uploads', filters]`
- `src/api/status.api.ts`, `src/api/uploads.api.ts` — thin wrappers over `client.ts`
- Overview page: sync status bar (last upload time from `uploads.started_at`, last measurement time from status latest_readings.measured_at, stale warning if > 24h), node status cards (MAIN/N2/N3), KPI cards with latest values (no sparklines yet), recent alerts strip (last 5 events severity ≥ warning)
- Settings page: timezone selector (UTC / browser local / fixed farm), default date range, chart theme — all persisted to localStorage; active timezone inherited by every page via React Context
- Global shell: sidebar navigation for all 14 pages, top bar with page title and timezone indicator ("All times shown in Africa/Algiers"), mobile hamburger collapse
- TanStack Query provider, QueryClient with `staleTime = 30_000` for status, `staleTime = 300_000` for aggregate data

**WebService (Render, existing Node.js/Express):**
- Enhance `GET /api/v1/readings`: add `node_seq`, `frame_id`, `error_code`, `upload_id`, `received_at` to SELECT; add `status` filter param; add `upload_id` filter param; add `offset` pagination param; exclude `raw_payload` from default response; cap `limit` at 1000
- Enhance `GET /api/v1/events`: add `error_code`, `upload_id`, `received_at` to SELECT; add `node_id` filter param; add `error_code` filter param; add `upload_id` filter param; add `offset` pagination param
- Add `GET /api/v1/uploads`: query `uploads` table, params: `gateway_id`, `from`, `to` (filter on `received_at`), `limit` (default 50), `offset`; return `raw_summary` JSONB; display count uses `raw_summary.readings_count` not `records_count`
- Confirm CORS headers allow `VITE_API_BASE_URL` origin for all dashboard GET endpoints

### Dependencies
- Render PostgreSQL database with `001_init.sql` and `002_patch.sql` already applied — verified by successful WebService health check
- `database_connection.private.md` credentials confirmed accessible to WebService environment variables
- WebService currently deployed on Render with `/api/v1/readings`, `/api/v1/events`, `/api/v1/status` functional

### Deliverables
- Deployed Vite project (Render Static Site or local `npm run dev`)
- `src/api/client.ts` with proven connection to live WebService
- All 14 route stubs returning page-name placeholders
- `src/utils/time.ts` with passing unit tests for UTC→local conversion, null handling, and timezone switching
- Overview page rendering live data: last upload time (from `/uploads`), last measurement time (from `/status`), node cards, KPI latest values, recent alert strip
- WebService `/readings`, `/events`, `/uploads` returning enhanced field sets confirmed in browser network tab

### Success Criteria
- `tsc --noEmit` passes with zero errors across all type files
- Overview page loads in < 2 seconds on a cold cache against production WebService
- Timezone switching in Settings updates all displayed timestamps on Overview without page reload
- "Last upload" and "last measurement" are shown as distinct labeled values — never collapsed into one
- `GET /api/v1/readings?status=missing&limit=10` returns records including `node_seq`, `frame_id`, `error_code`
- `GET /api/v1/uploads?limit=5` returns records including `raw_summary`
- No component imports from `pg` or any database driver

---

## Phase 2 — Core Sensor Dashboard (Partial Deployment Target)

### Goal
Deploy the first fully usable version of the dashboard. After this phase, farm operators and engineers can inspect all sensor data, identify missing readings, and see signal quality trends. The system is **partially usable from this point forward** — Phases 3–7 add capability, not prerequisites for core sensor viewing.

### Scope

**WebService:**
- Add `GET /api/v1/readings/aggregate`: params `node_id`, `metric`, `from`, `to`, `bucket` (`10min`|`1hour`|`1day`); SQL using `date_trunc` + `AVG/MIN/MAX/COUNT` + `COUNT(*) FILTER (WHERE status = 'missing') AS missing_count`; metric column selected dynamically from validated allowlist (`soil_temperature_c`, `soil_moisture_percent`, `soil_ec_us_cm`, `air_temperature_c`, `air_humidity_percent`, `air_pressure_hpa`, `rssi`, `snr`); `measured_at` is the grouping timestamp for all buckets
- Add `GET /api/v1/nodes`: returns all rows from `nodes` table

**Frontend — hooks and API modules:**
- `src/hooks/useReadings.ts` — `['readings', filters]` query key, calls `/readings` with node_id + date range + status filter
- `src/hooks/useReadingAggregates.ts` — `['readingsAggregate', nodeId, metric, range, bucket]` query key, automatic bucket selection: `10min` for ≤ 24h range, `1hour` for ≤ 7d, `1day` for > 7d
- `src/hooks/useEvents.ts` — `['events', filters]` query key, calls `/events` with node_id + severity + date range
- `src/hooks/useNodes.ts` — `['nodes']` query key
- `src/utils/chartData.ts` — `toTimeSeriesPoints()` transforms aggregate response into `TimeSeriesPoint[]`; null metric value or `status=missing` produces `{ value: null }` — never zero, never interpolated; `connectNulls={false}` enforced on every Recharts LineChart

**Frontend — chart components (`src/components/charts/`):**
- `ChartFrame` — wraps chart with title, expand button, time-range selector slot
- `TimeRangeSelector` — chip group: 24h / 7d / 30d / Custom; emits ISO range pair; state lifted to page level so all charts on a page share one range
- `MetricLineChart` — single-series line chart; `measured_at` → local time on X-axis via `toChartTime()`; grey segment marker at null/missing points; red dot markers at `status=error` or `status=partial`; configurable Y-axis min/max (fixed per spec: moisture 0–100, temperature −20/−40 to 80/85, EC 0–20000, pressure 950–1050 expandable, RSSI −60 to −120, SNR −20 to +15); reference threshold line optional; clicking anomaly marker emits event for inline log panel (not page navigation)
- `DualMetricChart` — two series on shared Y-axis; used for Pivot Comparison and RSSI/SNR dual-node; identical Y-axis scale enforced — no per-series auto-scaling
- `DailyBandChart` — min/max shaded area + avg center line; one panel per metric; X-axis: calendar days from `measured_at`
- `StatusDistributionChart` — stacked bar per calendar day; segments: ok (blue) / partial (yellow) / error (red) / missing (grey); Y-axis: reading count
- `EmptyChartState` — "No data in selected range" with retry button
- `DataConfidenceStrip` — placeholder strip reserved for Phase 6; renders null in this phase

**Frontend — pages:**
- Pivot 1 Soil: time-range selector; `useReadingAggregates(node_id='MAIN')` for soil_temperature_c, soil_moisture_percent, soil_ec_us_cm; three `MetricLineChart`; daily summary table (avg/min/max per calendar day from aggregate `1day` bucket); `StatusDistributionChart`; stat pills showing latest reading value + status; caveat banner "Pivot 1 data may be unavailable while RS485 sensor is being configured" when all readings have `status=error`; `useEvents(node_id='MAIN')` for anomaly overlay markers
- Pivot 2 Soil: identical structure scoped to `node_id='N2'`; additional RSSI and SNR `MetricLineChart` below status distribution; `useReadingAggregates(node_id='N2', metric='rssi')` and `metric='snr'`; −110 dBm reference line on RSSI chart; 0 dB reference line on SNR chart
- Weather: scoped to `node_id='N3'`; three `MetricLineChart` for air_temperature_c, air_humidity_percent, air_pressure_hpa; `DailyBandChart`; `StatusDistributionChart`; dual RSSI/SNR charts; `useEvents(node_id='N3')` for anomaly overlay; weather is never labeled "Pivot N weather" anywhere on this page
- Pivot Comparison: `useReadingAggregates` called for both MAIN and N2 on same time range; three `DualMetricChart` (Pivot 1 solid blue, Pivot 2 dashed green); C-4 delta panel showing P1−P2 numeric difference with direction arrow at latest shared timestamp; C-5 scatter plot (soil_moisture_percent vs air_temperature_c, both pivots) rendered only when date range ≥ 7d; never average or merge Pivot 1 and Pivot 2 into a single data series; pivot identity labels use display names not node_ids in UI
- Overview: add KPI sparklines (O-1) using `useReadingAggregates(last_24h, bucket='1hour')` per metric per node; sparklines have no axis labels, proportional height only; flat grey fill for null/missing segments

**Responsive behavior this phase:**
- Mobile (< 768px): charts take full viewport width; time-range selector above chart; table columns collapse; KPI cards 2-column grid
- Tablet: 3-column KPI grid; sidebar icon rail

### Dependencies
- Phase 1 complete: `client.ts`, all TypeScript types, time utilities, routing shell, WebService `/readings` enhancements
- `GET /api/v1/readings/aggregate` deployed to WebService before frontend chart hooks are wired

### Deliverables
- All four sensor pages functional with live data
- Pivot Comparison dual-line charts with fixed shared Y-axis
- All chart components in `src/components/charts/` — reusable, data-domain aware, receiving prepared `TimeSeriesPoint[]` view models
- `GET /api/v1/nodes` endpoint live
- Updated Overview with sparklines

### Success Criteria
- **Partial deployment gate:** Pivot 1, Pivot 2, Weather, Comparison, and Overview pages all render with live data from production WebService; farm operator can answer "is each pivot in range right now?" without navigating off Overview
- Missing readings appear as visible breaks in chart lines — no interpolation across null points; confirmed by checking a known `status=missing` record produces a gap
- Pivot Comparison Y-axes are identical for each metric — zooming one series does not rescale the other
- `air_temperature_c` chart on Weather page X-axis timestamps match `measured_at` values returned by API, not `received_at` — verified by cross-referencing network response with chart tooltip
- `soil_ph` and `soil_salinity` do not appear anywhere in the UI — grep confirms no reference in component files
- Battery fields do not appear anywhere in the UI
- 30-day view for any metric loads in < 3 seconds using the aggregate endpoint (not raw readings)
- `tsc --noEmit` still passes; no new TypeScript errors

---

## Phase 3 — Diagnostics & Upload Audit

### Goal
Complete the read-only diagnostic layer. Engineers can trace a chart anomaly to its root cause through the Logs/Events page, audit upload sessions, and inspect system health without leaving the dashboard.

### Scope

**WebService:**
- Add `GET /api/v1/events/aggregate`: params `from`, `to`, `node_id` (optional), `gateway_id` (optional); returns `{ points: [{ day, info, warning, error, critical }] }` using `date_trunc('day', event_time)` group by; `event_time` is the grouping timestamp
- Add `GET /api/v1/readings/:record_id`: returns full `sensor_readings` row including `raw_payload` JSONB; used by System Health deep debug only

**Frontend — hooks:**
- `src/hooks/useEventsAggregate.ts` — `['eventsAggregate', filters]` query key; calls `/events/aggregate`

**Frontend — Logs / Events page:**
- Filter bar: severity multi-select chips (info/warning/error/critical, all enabled by default); node dropdown (MAIN / N2 / N3 / gateway-level); event_type searchable dropdown; error_code searchable dropdown; date range picker defaulting to last 7d; upload_id text input; Clear filters button; all filters ANDed; active filters reflected in URL query params (shareable/bookmarkable)
- `L-2` mini histogram above table: stacked bar per calendar day using `useEventsAggregate`; clicking a day bar sets the date filter to that day — separate query from the main event list, not computed from it
- Events table: columns: event_time (converted to local time via `formatDisplayTime()`; sortable; default DESC), severity badge, node_id, event_type (monospace), error_code (monospace; "—" if null), message (truncated 80 chars); `event_id`, `upload_id`, `gateway_id`, `received_at` hidden in collapsed row
- Expanded row detail panel: `event_id`, `gateway_id`, `upload_id`, `received_at` (labeled "Server received"), full message, `details` JSONB rendered as formatted code block; "View nearby readings →" link navigates to matching Pivot or Weather page pre-filtered to ±5-minute window around `event_time` using `node_id` to determine destination; "Filter by this upload_id →" sets upload_id filter
- Pagination: 50 events per page; offset-based for Phase 3, cursor-based migration deferred to Phase 7
- Export: CSV download of current filtered set — fields: `event_time`, `severity`, `node_id`, `event_type`, `error_code`, `message`, `details` (stringified), `event_id`, `upload_id`; filename `events_YYYYMMDD_YYYYMMDD.csv`
- Empty states: no matches, no events in DB, API error with retry button
- Mobile: table collapses to card rows; hidden columns: node, upload_id; visible: time + severity badge + event_type + expand button

**Frontend — Upload History page:**
- Sortable table: `upload_id`, `started_at` (labeled "Device upload start"), `received_at` (labeled "Server received"), `raw_summary.readings_count` (authoritative count, not `records_count`), `events_count`, `status`; expand row shows `raw_summary` JSONB, `notes`, `finished_at`
- Page header banner: "This page shows when data was transferred, not when measurements occurred." — permanent, not dismissable
- `U-1` bar chart: successful vs failed uploads per calendar day grouped by `received_at` date; grey gap for days with no upload; data from `/uploads`
- `U-2` bar chart: readings count per upload session (X = `received_at`); tooltip shows `upload_id`, `events_count`
- Gap detection: calendar days with no upload row highlighted in grey in U-1
- "Filter logs by this upload →" link from each table row navigates to Logs page with upload_id prefilled
- `useUploads` with date range params; `staleTime = 60_000`

**Frontend — System Health page:**
- Gateway card: `firmware_version`, `last_seen_at`, `last_upload_at` — from `/status`
- Node cards (MAIN, N2, N3): `node_type`, `last_seen_at`, `last_seq` — from `/nodes`
- `H-1` RSSI dual-line chart: N2 (green) and N3 (amber) on shared dBm scale — calls `useReadingAggregates` for both nodes; `measured_at` on X-axis
- `H-2` SNR dual-line chart: same nodes
- `H-5` event severity donut: counts from `useEventsAggregate` for 30d, all nodes combined; separate per-node donuts expandable on click
- `H-6` error code frequency: horizontal bar chart sorted by count DESC; source: `useEvents` with `limit=1000` filtered to error_code IS NOT NULL for 30d; counted and sorted client-side
- Boot events list: `rtc_lost_power`, `rtc_init_failed`, `lora_init_failed`, `rtc_drift_detected`, `rtc_sync_applied` events last 30d shown as simple count-labeled list
- Node sequence gap detector: from raw `/readings` with `node_id` filter for 7d, sorted by `node_seq` — highlight rows where `node_seq` skips more than 1; rendered as a warning table
- "View raw payload" button per node: calls `/readings/:record_id` for the node's latest reading, renders `raw_payload` JSONB in a code block modal; debounced, error handled

### Dependencies
- Phase 1: enhanced `/events` endpoint with `error_code`, `upload_id`, `received_at`, `node_id` filter
- Phase 1: `/uploads` endpoint
- Phase 2: `useReadingAggregates` hook (reused for RSSI/SNR on System Health)
- `/events/aggregate` and `/readings/:record_id` endpoints deployed before Logs histogram and deep debug are wired

### Deliverables
- Logs/Events page: full filter set, paginated table, expand panel, CSV export, "View nearby readings" cross-link, mini histogram
- Upload History page: table, U-1 and U-2 charts, upload_id → logs cross-link
- System Health page: gateway card, node cards, RSSI/SNR dual-line charts, error frequency chart, severity donut

### Success Criteria
- Bug investigation workflow from `logs_page.md` executes end-to-end: filter by severity, expand event, click "View nearby readings →", land on Pivot 2 page zoomed to correct time window, RSSI chart visible in the same view
- `event_time` is the X-axis timestamp in the logs histogram and table — not `received_at` — verified by comparing a known event's `event_time` against displayed time
- Upload History table displays `raw_summary.readings_count` not `records_count` — verified against a known upload where `records_count = 0` and `raw_summary.readings_count > 0`
- The permanent "this page shows transfer time, not measurement time" banner is present and cannot be dismissed
- CSV export of filtered events downloads with correct filename format and correct field set
- System Health RSSI chart uses `measured_at` on X-axis, confirmed by network tab showing `/readings/aggregate` call with `metric=rssi`

---

## Phase 4 — Agronomic Data Layer & Mobile-Critical Irrigation Flow

### Goal
Add the agronomic data domain from scratch: database migration, WebService CRUD endpoints, and the highest-priority mobile flows. After this phase, farm operators can record irrigation start/end in under 10 seconds on a phone. The Daily Operations page becomes the fastest path in the app.

### Scope

**Database migration (WebService, new SQL file `003_agronomic.sql`):**
- Create `agronomic_events` table with all required columns: `agro_event_id` (TEXT UNIQUE, format `AGRO-GW01-YYYYMMDD-HHMMSS-NNN`), `gateway_id`, `event_category`, `event_type`, `target_scope`, `started_at` (TIMESTAMPTZ), `ended_at` (TIMESTAMPTZ NULL), `created_at`, `updated_at` (NULL), `entered_by` (NULL), `source` (always `'manual'`), `confidence`, `details` (JSONB), `notes` (NULL)
- Index: `(gateway_id, event_category, started_at DESC)`
- Index: `(event_category, event_type)`
- This table is fully isolated — no foreign keys to `sensor_readings` or `system_events`

**WebService — agronomic endpoints:**
- `GET /api/v1/agronomic-events`: params `event_category`, `event_type`, `target_scope`, `from`, `to` (filter on `started_at`), `limit` (default 100), `offset`; returns `{ events: AgronomicEvent[], count: number }`
- `POST /api/v1/agronomic-events`: creates event; server assigns `agro_event_id` and `created_at`; validates `event_category` against allowlist; requires `started_at`, `event_category`, `event_type`, `target_scope`, `confidence`, `source='manual'`; `details` must be valid JSON
- `PATCH /api/v1/agronomic-events/:agro_event_id`: partial update; server sets `updated_at = now()`; all fields optional; `started_at` and `ended_at` validated so `ended_at > started_at`
- `DELETE /api/v1/agronomic-events/:agro_event_id`: hard delete in Phase 4; soft delete deferred to Phase 7
- `POST /api/v1/agronomic-events/irrigation/start`: shortcut — creates `irrigation_session` with `ended_at = null`, `confidence = 'exact'`, `started_at = now()` if not provided; returns full event including `agro_event_id`
- `POST /api/v1/agronomic-events/irrigation/:agro_event_id/end`: patches `ended_at`; validates `ended_at > started_at`; computes and writes `details.duration_min`; returns updated event
- `GET /api/v1/reminders`: computes and returns active reminders client-deferred for this phase — stub returns `{ reminders: [] }` for now; Phase 5 populates
- Authentication: all write endpoints (`POST`, `PATCH`, `DELETE`) require a dashboard write token via `Authorization: Bearer <token>` header — separate from firmware `x-api-key`; GET endpoints remain public for Phase 4, token added in Phase 7

**Frontend — hooks:**
- `src/hooks/useAgronomicEvents.ts` — `['agronomicEvents', filters]` query key; calls `GET /api/v1/agronomic-events`; cache invalidated after any mutation
- `src/hooks/useIrrigationSession.ts` — specialized hook returning: active session (latest `irrigation` event with `ended_at = null`), today's completed sessions, mutation functions `startIrrigation()` and `endIrrigation()`; uses `useAgronomicEvents` as data source; `staleTime = 15_000` (short — irrigation status must feel current)
- Mutations use TanStack Query `useMutation`; on success, invalidate `['agronomicEvents']` and `['reminders']`; do not invalidate sensor reading queries

**Frontend — forms (`src/components/forms/`):**
- All forms use React Hook Form + Zod
- `IrrigationStartForm`: fields: `target_scope` (dropdown, default `both_pivots`), `started_at` (datetime-local, default now), `confidence` (radio: exact/estimated, default exact), `notes` (optional textarea); Zod schema validates `started_at` is a valid ISO timestamp; submits to `POST /api/v1/agronomic-events/irrigation/start`; two-tap mobile flow: tap "Start Irrigation" → bottom sheet opens → tap "Start" → sheet closes → timer appears
- `IrrigationEndForm`: fields: `ended_at` (datetime-local, default now), `notes`; Zod validates `ended_at > started_at` (client-side, then server-side); submits to `PATCH /api/v1/agronomic-events/irrigation/:id/end`
- `IrrigationBackfillForm`: fields: `started_at` (date + time), `ended_at` (date + time) OR `duration_min` (integer), `target_scope`, `confidence`, `notes`; Zod validates either `ended_at` or `duration_min` present; `ended_at > started_at`; submits to `POST /api/v1/agronomic-events`
- `FieldNoteForm`: fields: `note_type` (dropdown from defined allowlist: general/damage/disease_suspected/pest_suspected/yellowing/equipment_issue/irrigation_issue/weather_damage/other), `target_scope`, `severity` (low/medium/high/critical), `started_at` (default now), `notes` (required, min 5 chars); submits to `POST /api/v1/agronomic-events`

**Frontend — Daily Operations page (mobile-first):**
- Irrigation Quick Card: if no active session → show "No irrigation running" + "Start Irrigation" button + "Backfill Irrigation" link; if active session → show "Irrigation running", elapsed timer ticking in real time, target scope label, "End Irrigation" button; end-irrigation bottom sheet appears on tap
- "Start Irrigation" taps into a bottom sheet (not a separate page) — target scope selector + timestamp field + Start button; 2 taps from page open to irrigation recorded
- "Backfill Irrigation" opens `IrrigationBackfillForm` in a bottom sheet or modal
- "Add Field Note" quick action: one-tap → `FieldNoteForm` bottom sheet; timestamp defaults to now
- Last upload time card (from `useStatus`) and latest soil moisture cards for Pivot 1 and Pivot 2 (from `useStatus` latest_readings)
- Reminder placeholders: "No irrigation recorded today" shown if today's completed irrigation count is zero — neutral wording, not prescriptive
- Page accessible in one tap from mobile Overview via persistent bottom navigation "Irrigation" tab

**Frontend — mobile shell:**
- Mobile bottom navigation bar (< 768px): Home / Irrigation / Soil / Agronomy / Logs — always visible
- Desktop sidebar unchanged, gains "Daily Operations" entry directly below Overview
- "Irrigation" bottom nav tab links directly to Daily Operations page

**Overview page — mobile irrigation card:**
- Irrigation status card added to Overview mobile layout above node status cards: shows active session timer if running, "Start Irrigation" if not; one-tap into Daily Operations
- Stale upload warning and stale measurement warning shown as separate banners — never collapsed

### Dependencies
- Phase 1 complete: `client.ts`, TypeScript types, routing
- Phase 3 complete: `/events` enhancements (needed so reminders can cross-link to logs in Phase 5)
- `003_agronomic.sql` migration applied to Render PostgreSQL before any agronomic endpoints are tested
- Dashboard write token provisioned and stored in WebService environment variable before `POST` endpoints are deployed

### Deliverables
- `agronomic_events` table live in PostgreSQL, isolated from other tables
- `GET/POST/PATCH/DELETE /api/v1/agronomic-events` endpoints live
- Irrigation start/end/backfill shortcuts live
- Daily Operations page functional on mobile: irrigation start in ≤ 2 taps, irrigation end in ≤ 2 taps, backfill in ≤ 5 fields
- Field Note quick entry functional
- Mobile bottom navigation present on all pages < 768px
- Irrigation card on mobile Overview linking to Daily Operations

### Success Criteria
- Irrigation start flow benchmarked: from Daily Operations page open to `POST /api/v1/agronomic-events/irrigation/start` response in ≤ 2 taps, ≤ 5 seconds on a mid-range phone on a 4G connection
- Active irrigation timer on Daily Operations page updates in real time without page reload
- `ended_at < started_at` on end-irrigation form shows inline validation error before submit; server also rejects with HTTP 400
- `agronomic_events` table confirms no foreign key constraints to `sensor_readings` or `system_events`
- `DELETE /api/v1/agronomic-events/:id` on a non-existent ID returns HTTP 404
- Sensor reading queries are NOT invalidated after an irrigation event is created — TanStack Query devtools confirm `['readings', ...]` cache untouched
- All agronomic mutations require `Authorization: Bearer <token>` header; GETs are public
- `started_at` stored in DB as UTC; Daily Operations page displays it in local/farm time

---

## Phase 5 — Season Management & Periodic Agronomy

### Goal
Complete the agronomic context layer with season lifecycle tracking, cutting and yield management, fertilization records, and the field notes timeline. Reminder logic becomes operational. The Agronomy section of the sidebar is fully functional.

### Scope

**WebService:**
- `GET /api/v1/reminders`: compute and return active reminders from `agronomic_events` queries:
  - `irrigation_not_recorded_today`: no completed `irrigation_session` with `started_at` date = today
  - `cutting_reminder`: days since latest `cutting` event; soft reminder threshold 20d, strong threshold 25d
  - `yield_missing_for_cutting`: latest `cutting` event exists but no `yield_per_cutting` with matching `cutting_number` in `details`
  - `emergence_missing_after_planting`: `planting_date` event exists and `emergence_date` missing and days since planting > configurable threshold (default 7d)
  - Returns `{ reminders: [{ type, message, action, severity }] }`
  - All comparisons use `started_at` UTC; reminder wording is neutral ("No irrigation recorded today", not "You must irrigate")

**Frontend — Field Setup / Season page:**
- Season context form sections: Planting Date, Emergence Date (only after planting, not after each cutting — enforced in UI by hiding field until planting exists), Season Start, Season End (optional until entered), Soil Type per scope (farm/pivot_1/pivot_2)
- Soil calibration thresholds: Field Capacity %, Refill Point %, Wilting Point % — all optional; Zod validates `wilting_point < refill_point < field_capacity` if any are present; when absent, moisture charts display "trend only" label without threshold lines
- All fields submit to `POST /api/v1/agronomic-events` with appropriate `event_category = 'season_setup'`; existing events loaded via `useAgronomicEvents({ event_category: 'season_setup' })` and used to pre-populate fields
- Display: current season summary card showing planting → emergence → season start → (season end if set) timeline

**Frontend — Cutting & Yield page:**
- Cutting timeline: chronological list of `cutting` events; each shows cutting number, date (`started_at` in local time), days since previous cutting; cutting interval counter
- "Record Cutting" form: `started_at` (default now), `cutting_number` (suggested = previous + 1, editable), `target_scope`, `notes`; confirms cutting number before saving
- Reminder card: "N days since last cutting" with soft/strong thresholds from `GET /api/v1/reminders`; "Record cutting" CTA
- `A-9` yield bar chart: one bar per cutting, Y-axis = yield value; cumulative season yield shown as running total annotation; data from `yield_per_cutting` events
- Yield entry form per cutting: `cutting_number`, `yield_value`, `yield_unit` (dropdown: ton/kg/bales/custom), `confidence` (exact/estimated), `notes`; reminder after each cutting recorded: "Enter yield for cutting #N"
- `event_category = 'cutting'` and `event_category = 'yield'` are separate POST requests — never merged

**Frontend — Fertilization page:**
- Fertilization timeline: chronological list of fertilization events with key detail summary
- "Record Fertilization" form: `started_at`, `target_scope`, `fertilizer_type` (dropdown + free text), `product_name` (optional), `amount` (optional), `unit` (optional), `application_method`, `is_regular` (boolean toggle), `reason` (required when `is_regular = false` — Zod conditional validation), `notes`
- Events stored as `event_category = 'fertilization'` in `agronomic_events`

**Frontend — Field Notes page:**
- Agronomic field notes timeline (NOT the system Logs page — strict separation)
- Chronological list of `field_note` events with note_type badge, scope, severity, and notes text
- Filter by note_type, target_scope, date range
- "Add field note" button opens `FieldNoteForm` (reused from Phase 4)
- This page never shows `system_events` rows

**Frontend — Reminders (global):**
- `src/hooks/useReminders.ts` — `['reminders']` query key; calls `GET /api/v1/reminders`; `staleTime = 60_000`
- Reminder cards rendered on Daily Operations page and relevant Agronomy pages
- Overview page shows count badge on "Agronomy" sidebar section when active reminders > 0
- Reminders invalidated after any agronomic mutation

**Sidebar navigation update:**
- "Agronomy" group expands with: Field Setup / Season, Cutting & Yield, Fertilization, Field Notes
- Mobile bottom nav "Agronomy" tab links to Field Setup as entry point

### Dependencies
- Phase 4 complete: `agronomic_events` table, all CRUD endpoints, `useAgronomicEvents` hook, form components
- `GET /api/v1/reminders` deployed before Cutting & Yield reminder cards are wired

### Deliverables
- Field Setup / Season page: season lifecycle form with calibration thresholds; conditional emergence date field
- Cutting & Yield page: cutting timeline, yield bar chart (A-9), yield entry forms, reminder integration
- Fertilization page: timeline + form with conditional validation
- Field Notes page: agronomic-only timeline, never mixing system_events
- `GET /api/v1/reminders` endpoint computing 4 reminder types server-side
- `useReminders` hook with `staleTime = 60_000`

### Success Criteria
- Emergence date field is hidden when no planting date event exists in `agronomic_events`; appears after planting is recorded
- "Record Cutting" form default cutting number is previous + 1; operator can override; Zod prevents non-integer or negative values
- Fertilization form prevents save when `is_regular = false` and `reason` is empty — enforced by Zod on client and validated on server
- Field Notes page network tab shows `GET /api/v1/agronomic-events?event_category=field_note` — not `GET /api/v1/events` (system events)
- `GET /api/v1/reminders` response contains `irrigation_not_recorded_today` reminder when confirmed no completed irrigation exists for today's date in `agronomic_events`
- Soil calibration thresholds absent → moisture chart renders with no threshold lines and displays "trend only — no calibration data" label in chart subtitle; thresholds present → refill point and field capacity reference lines appear

---

## Phase 6 — Alfalfa Analytics & Chart Overlays

### Goal
Integrate the three data domains at the visual interpretation layer. Agronomic events appear as contextual overlays on sensor charts without entering the sensor data arrays. Alfalfa-specific analytical charts provide decision support while respecting the boundary between measured values, manual context, and derived indicators.

### Scope

**Frontend — overlay system (`src/utils/overlays.ts`, `src/hooks/useChartOverlays.ts`):**
- `toChartOverlays(agronomicEvents: AgronomicEvent[]): ChartOverlay[]` — transforms agronomy events into typed overlays; each overlay has `id`, `type`, `startsAt` (UTC), `endsAt` (UTC or null), `label`, `targetScope`, `source: 'agronomic_events'`
- Overlay types: `irrigation_band` (blue shaded region from `started_at` to `ended_at`; if `ended_at` null, draw dashed half-band to current time), `cutting_marker` (purple vertical line at `started_at`), `fertilization_marker` (green vertical line), `field_note_marker` (note icon), `technical_event_marker` (red/orange marker from `system_events`)
- `useChartOverlays(scope, timeRange)` — calls `useAgronomicEvents({ target_scope, from, to })` and `useEvents({ node_id, from, to })` separately; transforms each into `ChartOverlay[]`; merges two arrays into one overlay list; does NOT merge agronomic events and system events into the same data array — only into the same visual layer list keyed by id prefix (`AGRO-` vs `EVT-`)
- Overlays passed to `MetricLineChart` and `DualMetricChart` as a separate prop — never inserted into `TimeSeriesPoint[]`
- Tapping an `irrigation_band` overlay → opens irrigation event detail (agronomy domain); tapping a `technical_event_marker` → opens log detail panel (system domain)

**Frontend — sensor chart page updates:**
- Pivot 1 Soil, Pivot 2 Soil pages: `useChartOverlays` added; overlays rendered by `EventOverlayLayer` component inside each `ChartFrame`; `MetricLineChart` receives `overlays` prop; irrigation bands and cutting markers visible on moisture and temperature charts; fertilization markers visible on EC chart
- Weather page: no agronomic overlays (weather is shared context, not scoped to a pivot)
- Pivot Comparison: overlays for both pivots rendered per-series with correct `target_scope` filtering; "Irrigation (P1)" and "Irrigation (P2)" differentiated by overlay label

**Frontend — alfalfa analytical charts (`src/features/soil/`):**
- `A-1` Irrigation Response: `MetricLineChart` scoped to ±24h window around each `irrigation_session.started_at`; Pivot 1 and Pivot 2 moisture series together; rendered as a collapsible card on Pivot Comparison page; only shown when at least one irrigation event exists with a complete `ended_at`; confidence label if irrigation `confidence = 'estimated'`
- `A-2` Daily Water Stress Risk: daily status band showing low / watch / possible_stress per calendar day; computed from soil_moisture_percent trend; if no calibration thresholds exist, all days labeled "trend-based only" — never labeled "stress" without a configured refill point; rendered on Pivot 1 and Pivot 2 pages below status distribution
- `A-3` Soil Moisture vs Irrigation Timeline: `MetricLineChart` for moisture (both pivots) with `irrigation_band` overlays prominent; replaces standard moisture chart on Pivot Comparison when irrigation events exist in range; separate component `IrrigationResponseChart`
- `A-4` Alfalfa Heat Stress Hours: daily stacked bar on Weather page below `W-6`; bands: < 10°C (slow growth), 10–30°C (favorable), 30–35°C (possible heat stress), > 35°C (high heat load); computed from `air_temperature_c` readings grouped by `measured_at` day; count of readings per hour-band per day; label: "Based on air temperature measurements"
- `A-5` Emergence Suitability: soil temperature timeline with 10°C and 20°C reference bands; rendered on Pivot 1 and Pivot 2 pages only when `planting_date` event exists and `emergence_date` event does not yet exist; hidden after emergence is confirmed
- `A-6` Regrowth After Cutting: on Cutting & Yield page, for each cutting event render a 30-day window of soil moisture + air temperature starting from `cutting.started_at`; highlights environmental conditions during regrowth; reads from `useReadingAggregates` with dynamic `from`/`to` centered on cutting date
- `A-7` EC Salinity Indicator: `MetricLineChart` for `soil_ec_us_cm` with fertilization overlays; subtitle: "EC is an indicator only — not laboratory ECe unless calibrated"; on Pivot 1 and Pivot 2 EC charts with fertilization events in range
- `A-8` Fertilization Impact Window: on Fertilization page, per fertilization event: EC + moisture `MetricLineChart` from −48h to +7d around `fertilization.started_at`; rendered as collapsible card in fertilization detail; subtitle: "EC change after fertilization — does not indicate nutrient sufficiency"
- `A-10` Data Confidence Strip: `DataConfidenceStrip` component (placeholder from Phase 2 now activated); inputs: missing_count from aggregate `missing_count` field, latest `sensor_error` events in range, upload age; renders a colored strip under each chart: green (high), yellow (medium), red (low); label explains which factor reduces confidence

**Safety guardrails enforced in this phase:**
- No chart claims yield from sensor data alone
- No chart claims pH, NPK, or salinity (confirmed: no UI reference to `soil_ph` or `soil_salinity`)
- No chart claims actual crop water deficit without a configured refill point
- `A-2` and `A-5` always show their data basis label ("trend-based only", "based on soil temperature measurements")
- Alfalfa-specific charts are clearly labeled as derived indicators, not direct measurements

### Dependencies
- Phase 4 complete: `agronomic_events` data and `useAgronomicEvents` hook
- Phase 5 complete: calibration thresholds available for `A-2` threshold lines
- Phase 2 complete: all `MetricLineChart` and `DualMetricChart` components accepting `overlays` prop (reserve prop slot in Phase 2 even if unused)
- `DataConfidenceStrip` placeholder component exists from Phase 2 (renders null)

### Deliverables
- `src/utils/overlays.ts` and `src/hooks/useChartOverlays.ts` — domain-separated overlay generation
- `EventOverlayLayer` component rendering irrigation bands, cutting markers, fertilization markers, field note icons, technical event markers
- Analytical charts A-1 through A-10 implemented
- All Pivot Soil pages show agronomy overlays without mixing data sources
- Data confidence strip active on all sensor chart pages

### Success Criteria
- Irrigation band overlay on moisture chart is sourced from `GET /api/v1/agronomic-events` — not from `sensor_readings` — confirmed by network tab
- `TimeSeriesPoint[]` array passed to `MetricLineChart` contains zero entries from `agronomic_events` — only sensor metric values and nulls
- A-2 stress risk strip shows "trend-based only" label when no calibration thresholds exist in `agronomic_events`; shows refill/field-capacity lines when they exist — same chart, two different render states
- A-5 emergence suitability chart is absent on Pivot 1 page when no `planting_date` event exists; appears after planting date is entered in Field Setup
- Tapping a `cutting_marker` overlay opens an agronomy detail panel — it does NOT open the system Logs page
- Tapping a `technical_event_marker` opens the system log detail panel — it does NOT open any agronomy page
- A-8 fertilization impact window subtitle contains the calibration disclaimer text verbatim — confirmed by component render test

---

## Phase 7 — Hardening & Production Deployment

### Goal
Make the system production-ready: close all security gaps, validate performance at expected data volumes, complete error and empty states on every page, add CORS configuration, write and pass the required test suite, and execute a production deployment with explicit readiness criteria.

### Scope

**WebService — security and performance:**
- CORS: add `Access-Control-Allow-Origin` restricted to the production dashboard domain (not `*`); `OPTIONS` preflight handled for all endpoints
- Read-only Bearer token: add token check middleware to all dashboard GET endpoints; firmware `x-api-key` POST endpoint is unaffected — separate middleware chain
- Rate limiting: apply per-IP rate limiter to dashboard endpoints independently from the firmware upload endpoint
- `DELETE /api/v1/agronomic-events/:id`: migrate from hard delete to soft delete — add `deleted_at TIMESTAMPTZ NULL` column to `agronomic_events`; filter `deleted_at IS NULL` in all GETs; expose `DELETE` as a soft-delete operation; confirmation modal in UI: "Delete this manual event? This may affect chart overlays and reminders."
- Pagination: migrate Logs/Events endpoint pagination from `offset` to cursor-based (`before_id` using `event_id` keyset) to prevent performance degradation on large event tables; maintain backward compat with `offset` for Upload History

**Frontend — error and empty states:**
- Every page component wraps its data dependencies in error boundary; API error shows "Could not load [data name]. Retry" with exponential backoff button; no silent zero values on API failure
- Every chart shows `EmptyChartState` when aggregate response returns zero points — "No data for selected range" with date range suggestion
- Every table shows empty state message when result set is zero rows
- Loading states: skeleton loaders on KPI cards, chart frames, and table rows (avoid layout shift); skeleton dimensions match actual rendered content dimensions
- Stale data warning on Overview: if `last_upload_at` > 24h ago, show amber banner "Last upload was over 24 hours ago — dashboard may not reflect latest SD card data"; if latest `measured_at` > 2h ago, show separate grey banner "No recent field measurement"
- RTC uncertainty: if `rtc_lost_power` or `rtc_sync_rejected` event exists in last 48h, show time-confidence warning banner on Pivot Soil and Weather pages: "Warning: RTC lost power. Some timestamps may be unreliable."

**Frontend — performance validation:**
- 30d soil moisture chart for N2 at `1day` bucket: confirm < 200ms render time (Recharts + 30 data points)
- 30d chart at `1hour` bucket: ≤ 720 points; confirm < 500ms render time
- Logs page initial load at 50 rows: < 1 second
- Overlay rendering with 10 irrigation events in range: no measurable chart render regression vs. no overlays

**Frontend — mobile and responsive QA:**
- Irrigation start flow on 375px viewport (iPhone SE equivalent): full flow in ≤ 2 taps from Daily Operations page
- Logs table on 375px: collapsed card rows with expand; hidden columns verified absent
- Comparison page on tablet (768px): dual-line charts maintained side-by-side above 900px; stacked below 900px
- Pinch-to-zoom on charts: enabled on mobile, reset button functional
- Bottom navigation on all pages < 768px: confirm 5 tabs present, active tab highlighted, no overflow

**Testing:**
- Unit tests (Vitest): `src/utils/time.ts` — UTC→local conversion for multiple timezones, null input handling, `toChartTime()` epoch precision; `src/utils/chartData.ts` — null/missing point produces `{ value: null }`, `status=missing` breaks the line; `src/utils/overlays.ts` — `toChartOverlays()` produces correct overlay types, `targetScope` filtering works, agronomic and system overlays remain in separate source-tagged entries; form Zod schemas — `ended_at < started_at` rejects, missing required fields reject, `wilting_point > refill_point` rejects
- Component tests (React Testing Library): `IrrigationStartForm` — submit with missing `target_scope` shows error; `IrrigationEndForm` — submit with `ended_at` before `started_at` shows error; `MetricLineChart` — renders `EmptyChartState` when passed zero points; Logs filter bar — toggling severity chip updates URL query params; mobile navigation — all 5 tabs visible at 375px width
- API layer tests (MSW — Mock Service Worker): `useReadingAggregates` sends correct query params for each bucket rule; `apiGet` error normalization on 500 returns structured error object; TanStack Query retry behavior on 503; irrigation start mutation invalidates `['agronomicEvents']` and `['reminders']` but not `['readings', ...]`

**Deployment configuration:**
- Render Static Site: `npm run build` output dir `dist`; `VITE_API_BASE_URL` set to production WebService URL as Render environment variable at build time; SPA routing: rewrite all paths to `index.html`
- WebService: `DASHBOARD_READ_TOKEN` and `DASHBOARD_WRITE_TOKEN` environment variables added; CORS `ALLOWED_ORIGIN` environment variable set to Static Site URL
- Health check: Static Site pings `/api/v1/status` on load; if unreachable, shows "WebService unavailable" banner with no misleading zero data

**Deployment readiness checklist (gate before declaring done):**
- `tsc --noEmit` passes with zero errors
- All unit and component tests pass
- No `soil_ph`, `soil_salinity`, or battery field references exist anywhere in rendered UI — grep confirms
- CORS: browser `fetch` from production Static Site domain to WebService returns 200 with correct `Access-Control-Allow-Origin` header
- Read token: unauthenticated `POST` to any agronomic write endpoint returns 401
- Overview page loads from cold cache < 2s; Pivot 2 30d aggregate chart loads < 3s
- Irrigation start flow completes end-to-end on production: POST creates record, active session card appears on Daily Operations, timer ticks
- Logs page: filter by `error_code=NODE_TIMEOUT`, expand row, "View nearby readings" navigates to correct Pivot 2 page with correct time window — confirmed manually
- "This page shows data transfer time, not measurement time" banner present on Upload History
- All times on all pages display in the configured local timezone, not UTC raw strings — confirmed by setting timezone to Africa/Algiers and verifying a known 06:10 UTC measurement displays as 07:10

### Dependencies
- All Phases 1–6 complete and passing their respective success criteria
- Production domain name confirmed for Static Site
- Render Static Site and WebService environment variables provisioned
- MSW installed as dev dependency; test infrastructure (Vitest, React Testing Library) configured from Phase 1 scaffold

### Deliverables
- Full test suite passing (unit, component, API layer)
- WebService CORS configured for production domain
- Read-only and write Bearer tokens enforced
- Soft-delete on agronomic events
- Error/empty states on all 14 pages
- Loading skeleton components on all data-dependent areas
- Stale data and RTC uncertainty banners
- Performance benchmarks recorded and passing
- Deployed production Static Site accessible at configured domain
- WebService deployed with all Phase 7 security additions

### Success Criteria
- All items in the deployment readiness checklist above are confirmed green
- No open critical or high severity bugs in any page listed in the deployment checklist
- A complete end-to-end scenario executes without errors: open Overview → see last upload age → navigate to Daily Operations → start irrigation → navigate to Pivot 2 → see RSSI chart → navigate to Logs → filter by NODE_TIMEOUT → expand row → "View nearby readings" → land on Pivot 2 with correct time filter → return to Agronomy → enter yield for latest cutting → reminder disappears
- System remains usable at zero data state: all pages render their empty states cleanly, no console errors, no blank screens

---

## Phase Dependency Summary

```
Phase 1 ──► Phase 2 ──► Phase 3
               │
               ▼
           Phase 4 ──► Phase 5 ──► Phase 6
               │                      │
               └──────────────────────┘
                          │
                          ▼
                      Phase 7
```

System is partially usable after **Phase 2** (all sensor pages functional).
Irrigation mobile flow is live after **Phase 4**.
Full alfalfa decision support is live after **Phase 6**.
Production deployment executes at **Phase 7**.
