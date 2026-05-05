# Implementation Plan

---

## Recommended Frontend Stack

| Layer | Recommendation | Rationale |
|---|---|---|
| Framework | React 18 + Vite | Fast build, broad ecosystem, easy Render Static Site deployment |
| Language | TypeScript | Catches field-name mismatches against data_contract at compile time; strongly recommended given the nullable-field complexity |
| Routing | React Router v6 | Client-side routing for 9 pages; no SSR required |
| Data fetching | TanStack Query (React Query) | Caching, background refetch, loading/error states with minimal boilerplate |
| Chart library | Recharts | Pure React, composable, handles gaps in data natively via `connectNulls={false}`; free; good TypeScript types |
| Styling | Tailwind CSS | Utility-first, no CSS file management, good responsive primitives |
| State management | React Context only | No global state beyond user preferences; avoid Redux overhead |
| Date handling | date-fns | Lightweight, tree-shakeable; handles UTC/local conversion cleanly |
| Testing | Vitest + React Testing Library | Same build toolchain as Vite; no Jest config overhead |

**Alternative chart library:** Apache ECharts (via echarts-for-react) if more complex interactions are needed (e.g. brush zoom, large dataset downsampling). ECharts is heavier but handles 10k+ point datasets better than Recharts.

**Do not use:** D3 directly (too low-level for this scope); Chart.js (less composable with React); Next.js (SSR not needed; adds deployment complexity).

---

## TypeScript Data Types

Define types from `data_contract.md` before writing any component:

```typescript
// Types sourced from data_contract.md — do not add fields not in the DB schema

type NodeId = 'MAIN' | 'N2' | 'N3';
type NodeType = 'soil' | 'weather' | 'main';
type ReadingStatus = 'ok' | 'partial' | 'missing' | 'error' | 'duplicate';
type EventSeverity = 'info' | 'warning' | 'error' | 'critical';
type BatteryStatus = 'not_measured' | 'ok' | 'low' | 'critical';

interface SensorReading {
  record_id: string;
  upload_id: string | null;
  gateway_id: string;
  node_id: NodeId;
  node_type: NodeType;
  node_seq: number | null;
  frame_id: number | null;
  measured_at: string;      // ISO 8601
  received_at: string;      // ISO 8601
  rssi: number | null;
  snr: number | null;
  battery_mv: null;         // always null
  battery_percent: null;    // always null
  battery_status: 'not_measured';
  soil_temperature_c: number | null;
  soil_moisture_percent: number | null;
  soil_ec_us_cm: number | null;
  // soil_ph and soil_salinity intentionally omitted — always null, never displayed
  air_temperature_c: number | null;
  air_humidity_percent: number | null;
  air_pressure_hpa: number | null;
  status: ReadingStatus;
  error_code: string | null;
}

interface SystemEvent {
  event_id: string;
  upload_id: string | null;
  gateway_id: string;
  node_id: NodeId | null;
  event_type: string;
  severity: EventSeverity;
  event_time: string;       // ISO 8601
  received_at: string;      // ISO 8601
  message: string | null;
  details: Record<string, unknown> | null;
  error_code: string | null;
}

interface AggregatePoint {
  bucket_start: string;     // ISO 8601
  avg: number | null;
  min: number | null;
  max: number | null;
  count: number;
  missing_count: number;
}

interface UploadRecord {
  upload_id: string;
  gateway_id: string;
  started_at: string;
  finished_at: string | null;
  received_at: string;
  source: string;
  records_count: number;
  events_count: number;
  status: string;
  notes: string | null;
  raw_summary: { readings_count: number; events_count: number } | null;
}
```

---

## API Integration Plan

Create a thin `src/api/` layer that wraps all fetch calls. Components never call `fetch()` directly.

```
src/
  api/
    readings.ts       — getReadings(), getReadingsAggregate(), getReading()
    events.ts         — getEvents(), getEventsAggregate()
    uploads.ts        — getUploads()
    status.ts         — getStatus()
    nodes.ts          — getNodes()
    client.ts         — shared fetch wrapper, base URL, error normalization
  hooks/
    useReadings.ts    — wraps TanStack Query + readings.ts
    useEvents.ts
    useUploads.ts
    useStatus.ts
    useAggregate.ts   — generic aggregate hook parameterized by metric + node
  types/
    api.ts            — TypeScript interfaces from data_contract.md
```

The `client.ts` module reads `VITE_API_BASE_URL` from the environment. For local dev this is `http://localhost:3000`; for production it is the Render WebService URL.

---

## Build Phases

### Phase 0 — Foundation (Week 1)
- [ ] Vite + React + TypeScript scaffold
- [ ] Tailwind CSS configured
- [ ] Sidebar + routing for all 9 pages (empty page stubs)
- [ ] `src/api/client.ts` with base URL, error handling
- [ ] TypeScript types from data_contract.md
- [ ] Settings page (localStorage, time zone, dark mode)

### Phase 1 — Data and Logs (Weeks 2–3)
- [ ] WebService: enhance GET /api/v1/readings to include missing fields (node_seq, frame_id, error_code, status filter)
- [ ] WebService: enhance GET /api/v1/events to include error_code, upload_id filter, node_id filter
- [ ] `useReadings` and `useEvents` hooks with TanStack Query
- [ ] Logs/Events page: full table, filters, expand panel, export CSV
- [ ] Overview page: sync status bar, node status cards, recent alerts strip (no sparklines yet)

### Phase 2 — Soil and Weather Charts (Weeks 4–5)
- [ ] WebService: add GET /api/v1/readings/aggregate endpoint
- [ ] `useAggregate` hook
- [ ] Recharts time-series component with gap handling (null point = break in line)
- [ ] Anomaly marker component (red dot on error/partial points)
- [ ] Pivot 1 Soil page: three charts + daily summary table + status breakdown
- [ ] Pivot 2 Soil page: same + RSSI/SNR charts
- [ ] Weather page: three charts + daily summary + RSSI/SNR
- [ ] KPI sparklines on Overview

### Phase 3 — Comparison and History (Week 6)
- [ ] Pivot Comparison page: dual-line charts, delta panel
- [ ] Soil-weather correlation scatter (conditional on range ≥ 7d)
- [ ] WebService: add GET /api/v1/uploads
- [ ] Upload History page: table + upload success/failure bar chart

### Phase 4 — System Health and Polish (Week 7)
- [ ] WebService: add GET /api/v1/nodes
- [ ] System Health page: gateway card, node cards, RSSI/SNR trend, error code frequency, severity donut
- [ ] Cross-links: event row → pivot page with time filter; upload row → events filter
- [ ] Responsive adjustments for mobile and tablet
- [ ] Empty states for all pages

### Phase 5 — Hardening (Week 8)
- [ ] API error states and retry UI on all pages
- [ ] Loading skeletons (avoid layout shift during data fetch)
- [ ] Unit tests for data transformation utilities (aggregate bucketing, null gap detection)
- [ ] Integration tests for API layer (mock service worker)
- [ ] Accessibility audit: keyboard navigation, ARIA labels on charts
- [ ] Performance: verify chart render time < 200ms for 7d at 10-min resolution (~1008 points)

---

## Testing Strategy

| Layer | Tool | What to test |
|---|---|---|
| TypeScript types | `tsc --noEmit` in CI | Type errors in API layer and component props |
| Unit tests | Vitest | `aggregateReadings()` bucketing logic, null gap detection, date formatting, filter URL param serialization |
| Component tests | React Testing Library | Filter bar state, table expand/collapse, page empty state rendering |
| API layer tests | msw (Mock Service Worker) | Correct query params sent, error responses handled, TanStack Query retry behavior |
| E2E tests | Playwright | Critical paths: Overview loads, Pivot 2 chart renders with gap, Logs filter works, export download |

No full E2E suite against production DB. E2E tests use a seeded local WebService instance.

---

## Production Considerations

### Deployment
- Dashboard SPA: Render Static Site (free tier) or any CDN (Netlify, Cloudflare Pages)
- WebService: already on Render Web Service (existing)
- Set `VITE_API_BASE_URL` to the production WebService URL via Render environment variable at build time

### Performance
- Chart data: always use `/aggregate` endpoint for ranges > 24h. Never send 30d × 144 raw points to the browser.
- TanStack Query cache: `staleTime = 5 * 60 * 1000` (5 min) for aggregate data; `staleTime = 30 * 1000` (30 s) for status endpoint
- Consider HTTP response caching (`Cache-Control: max-age=60`) on aggregate endpoints at the WebService level

### CORS
- WebService must add `Access-Control-Allow-Origin: https://your-dashboard-domain.com` (or `*` for development)
- Currently not configured; must be added before dashboard deployment

### Authentication
- Phase 1: no auth on GET endpoints (acceptable for private/internal use on a local network)
- Before internet exposure: add read-only Bearer token to all dashboard endpoints; keep write API key for firmware only
- Do not reuse the firmware `x-api-key` as a dashboard credential

### Data volume
- 144 readings/node/day × 3 nodes = 432 readings/day maximum
- 30d = ~13,000 readings — well within PostgreSQL query performance at this scale without special tuning
- Aggregate endpoint with `date_trunc` queries will remain fast even at 1 year of data (~157,000 rows)

### Missing-data handling contract
- A NULL value in a metric column is always treated as "no data" — not as zero
- A reading with `status = 'missing'` is a confirmed absence (node did not transmit), not a sensor null
- Charts must treat both as a break in the line (Recharts: set point value to `null`, `connectNulls={false}`)
- Do not impute, interpolate, or forward-fill any value


---

# Revision Addendum — Implementation Plan for Manual Agronomic Events

## New Build Phase: Agronomic Context Layer

### Phase A — Data Contract + Backend
- [ ] Add `agronomic_events` table migration
- [ ] Add GET/POST/PATCH endpoints
- [ ] Add irrigation start/end convenience endpoints or equivalent client workflow
- [ ] Add indexes on `event_category`, `event_type`, `target_scope`, `started_at`
- [ ] Keep agronomic events separate from system events

### Phase B — Mobile-First Entry UI
- [ ] Daily Operations page
- [ ] Irrigation active-session card
- [ ] Irrigation backfill form
- [ ] Field note quick form
- [ ] Last upload indicator on mobile home

### Phase C — Agronomy Pages
- [ ] Field Setup / Season page
- [ ] Cutting & Yield page
- [ ] Fertilization page
- [ ] Field Notes timeline

### Phase D — Alfalfa Analytics
- [ ] Irrigation response chart
- [ ] Heat stress hours chart
- [ ] EC trend with irrigation/fertilization overlays
- [ ] Regrowth-after-cutting view
- [ ] Yield per cutting chart
- [ ] Data confidence overlay

## Additional TypeScript Types

```typescript
type AgroCategory =
  | 'season_setup'
  | 'irrigation'
  | 'cutting'
  | 'fertilization'
  | 'yield'
  | 'field_note';

type TargetScope =
  | 'farm'
  | 'pivot_1'
  | 'pivot_2'
  | 'both_pivots'
  | 'unknown';

type TimeConfidence = 'exact' | 'estimated' | 'unknown';

interface AgronomicEvent {
  agro_event_id: string;
  gateway_id: string;
  event_category: AgroCategory;
  event_type: string;
  target_scope: TargetScope;
  started_at: string;
  ended_at: string | null;
  confidence: TimeConfidence;
  details: Record<string, unknown>;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
}
```

## Testing Additions

- irrigation start/end flow
- backfilled irrigation with estimated time
- cutting creates yield reminder
- season setup accepts missing season end
- field note overlay appears on charts
- manual events never appear in technical logs table
