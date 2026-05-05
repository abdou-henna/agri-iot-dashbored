# Frontend Architecture

## 1. Purpose

This document defines the frontend architecture for the Smart Farm IoT Dashboard.

The goal is to build a professional, maintainable, mobile-friendly dashboard that can be implemented now as a data dashboard, while remaining ready for future analytics and decision-support features.

This file complements:

- `data_contract.md`
- `api_requirements.md`
- `pages.md`
- `charts.md`
- `ux_wireframe.md`
- `time_semantics_dashboard_policy.md`
- `agronomic_manual_events.md`

---

## 2. Architecture Goals

The frontend must satisfy these goals:

```text
1. Preserve strict separation between data domains.
2. Use real measurement time for charts.
3. Convert UTC timestamps to local/farm time before display.
4. Support mobile-first daily operations.
5. Keep technical logs separate from agronomic events.
6. Allow manual agronomic events to overlay sensor charts without mixing datasets.
7. Make future analytics easy to add without rewriting the dashboard.
```

---

## 3. Data Domains

The frontend must treat the system as three separate data domains.

| Domain | Source | Frontend module | Main pages |
|---|---|---|---|
| Sensor data | `sensor_readings` | `readings` | Overview, Pivot 1, Pivot 2, Weather, Comparison |
| Manual agronomic data | `agronomic_events` | `agronomy` | Daily Operations, Field Setup, Cutting/Yield, Fertilization, Field Notes |
| System logs | `system_events` | `events` | Logs / Events, System Health |
| Upload metadata | `uploads`, `gateways` | `uploads`, `status` | Overview, Upload History |
| Node metadata | `nodes`, `status` | `nodes`, `status` | Overview, System Health |

## Non-negotiable rule

```text
Datasets remain separated in state, API hooks, UI pages, and table components.
Integration happens only through overlays, cross-links, and derived view models.
```

---

## 4. Recommended Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | React + Vite | Fast SPA, easy deployment |
| Language | TypeScript | Prevents field mismatch and null-handling mistakes |
| Routing | React Router | Page-level routing |
| Data fetching | TanStack Query | Caching, retries, loading/error handling |
| Styling | Tailwind CSS | Fast responsive UI |
| Charts | Recharts initially | Good React integration and sufficient for current data volume |
| Date handling | date-fns-tz or Day.js timezone | Required for UTC → local/farm display |
| Forms | React Hook Form | Reliable mobile forms |
| Validation | Zod | Validates manual agronomic forms and API responses |

---

## 5. Folder Structure

Recommended structure:

```text
src/
  app/
    App.tsx
    router.tsx
    providers.tsx

  api/
    client.ts
    readings.api.ts
    events.api.ts
    agronomy.api.ts
    uploads.api.ts
    status.api.ts
    nodes.api.ts

  hooks/
    useReadings.ts
    useReadingAggregates.ts
    useEvents.ts
    useAgronomicEvents.ts
    useUploads.ts
    useStatus.ts
    useNodes.ts
    useChartOverlays.ts
    useTimeZone.ts

  types/
    readings.ts
    events.ts
    agronomy.ts
    uploads.ts
    status.ts
    common.ts

  features/
    overview/
    soil/
    weather/
    comparison/
    agronomy/
    diagnostics/
    settings/

  components/
    layout/
    charts/
    tables/
    forms/
    feedback/
    mobile/

  utils/
    time.ts
    chartData.ts
    overlays.ts
    status.ts
    validation.ts

  config/
    constants.ts
    nodeMapping.ts
    routes.ts
```

---

## 6. Data Flow

## 6.1 Sensor chart data

```text
Page
  ↓
useReadingAggregates()
  ↓
readings.api.ts
  ↓
GET /api/v1/readings/aggregate
  ↓
normalize points
  ↓
convert timestamps to display timezone
  ↓
Chart component
```

## 6.2 Manual agronomic events

```text
Page / form
  ↓
useAgronomicEvents()
  ↓
agronomy.api.ts
  ↓
GET/POST/PATCH /api/v1/agronomic-events
  ↓
cache invalidation
  ↓
Agronomy pages + chart overlays
```

## 6.3 Logs

```text
Logs page
  ↓
useEvents()
  ↓
events.api.ts
  ↓
GET /api/v1/events
  ↓
Logs table only
```

## 6.4 Upload status

```text
Overview / Upload History
  ↓
useUploads() + useStatus()
  ↓
GET /api/v1/uploads
GET /api/v1/status
  ↓
Last upload / last sync UI
```

---

## 7. API Layer Design

Components must never call `fetch()` directly.

All network calls must go through `src/api`.

### `api/client.ts`

Responsibilities:

```text
- base URL
- headers
- JSON parsing
- error normalization
- timeout handling
- auth token later
```

Example shape:

```typescript
export async function apiGet<T>(path: string, params?: Record<string, unknown>): Promise<T>;
export async function apiPost<T>(path: string, body: unknown): Promise<T>;
export async function apiPatch<T>(path: string, body: unknown): Promise<T>;
```

---

## 8. TypeScript Data Models

## 8.1 Sensor Reading

```typescript
type NodeId = 'MAIN' | 'N2' | 'N3';
type NodeType = 'soil' | 'weather' | 'main';
type ReadingStatus = 'ok' | 'partial' | 'missing' | 'error' | 'duplicate';

interface SensorReading {
  record_id: string;
  upload_id: string | null;
  gateway_id: string;
  node_id: NodeId;
  node_type: NodeType;
  node_seq: number | null;
  frame_id: number | null;
  measured_at: string;
  received_at: string | null;
  rssi: number | null;
  snr: number | null;
  battery_mv: number | null;
  battery_percent: number | null;
  battery_status: 'not_measured';
  soil_temperature_c: number | null;
  soil_moisture_percent: number | null;
  soil_ec_us_cm: number | null;
  air_temperature_c: number | null;
  air_humidity_percent: number | null;
  air_pressure_hpa: number | null;
  status: ReadingStatus;
  error_code: string | null;
}
```

## 8.2 System Event

```typescript
type EventSeverity = 'info' | 'warning' | 'error' | 'critical';

interface SystemEvent {
  event_id: string;
  upload_id: string | null;
  gateway_id: string;
  node_id: NodeId | null;
  event_type: string;
  severity: EventSeverity;
  event_time: string;
  received_at: string | null;
  message: string | null;
  details: Record<string, unknown> | null;
  error_code: string | null;
}
```

## 8.3 Agronomic Event

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

---

## 9. Time Architecture

The frontend must follow the time policy:

```text
UTC for storage.
Local/farm time for humans.
```

## 9.1 Internal handling

API responses remain ISO UTC strings.

The frontend converts only for display:

```text
UTC ISO string → Date object → selected timezone display
```

## 9.2 Required utility functions

```typescript
formatDisplayTime(utc: string, options?: TimeFormatOptions): string
formatDisplayDate(utc: string): string
toChartTime(utc: string): number
getCurrentDisplayTimezone(): string
```

## 9.3 UI rule

Every page must show or inherit the active timezone.

Example:

```text
All times shown in Africa/Algiers
```

## 9.4 Chart rule

Charts use `measured_at` / `event_time` / `started_at` as logical time, converted to local display.

---

## 10. Chart Architecture

Charts must be generic, reusable, and data-domain aware.

Recommended components:

```text
ChartFrame
TimeRangeSelector
MetricLineChart
DualMetricChart
DailyBandChart
StatusDistributionChart
EventOverlayLayer
DataConfidenceStrip
EmptyChartState
```

## 10.1 Chart input contract

Charts should receive prepared view models, not raw API rows.

Example:

```typescript
interface TimeSeriesPoint {
  ts: string;              // UTC source timestamp
  displayTime: string;     // local/farm display
  value: number | null;
  status?: ReadingStatus;
  node_id?: NodeId;
}
```

## 10.2 Overlay contract

Manual agronomic events are transformed into overlays:

```typescript
interface ChartOverlay {
  id: string;
  type: 'irrigation_band' | 'cutting_marker' | 'fertilization_marker' | 'field_note_marker' | 'technical_event_marker';
  startsAt: string;
  endsAt?: string | null;
  label: string;
  targetScope: TargetScope;
  source: 'agronomic_events' | 'system_events';
}
```

## 10.3 Overlay rule

Overlays are visual annotations only. They must never be inserted into the sensor data array.

---

## 11. Page-Level Architecture

## 11.1 Overview

Consumes:

```text
useStatus()
useUploads()
useReadingAggregates(last 24h)
useEvents(recent warnings/errors)
```

Shows:

- latest measurement time
- last upload time
- stale upload warning
- node cards
- KPI cards
- recent warnings/errors
- quick mobile irrigation action

## 11.2 Soil pages

Consume:

```text
useReadingAggregates(node_id)
useAgronomicEvents(scope)
useEvents(node_id)
useChartOverlays()
```

Show:

- soil charts
- agronomic overlays
- technical error markers
- data confidence indicators

## 11.3 Agronomy pages

Consume:

```text
useAgronomicEvents()
```

Optionally read latest sensor context for convenience, but do not mix storage domains.

## 11.4 Logs page

Consumes only:

```text
useEvents()
```

It may cross-link to readings or agronomic events but must not display them as log rows.

---

## 12. State Management

Use TanStack Query for server state.

Avoid global stores unless required.

## 12.1 Query keys

Recommended query keys:

```typescript
['readings', filters]
['readingsAggregate', nodeId, metric, range, bucket]
['events', filters]
['agronomicEvents', filters]
['uploads', filters]
['status']
['nodes']
```

## 12.2 Cache invalidation

After manual event mutation:

```text
invalidate ['agronomicEvents']
invalidate chart overlay-related queries
invalidate reminders if implemented
```

Do not invalidate sensor readings when adding manual agronomic events.

---

## 13. Forms Architecture

All operator-entered data must use validated forms.

Recommended form stack:

```text
React Hook Form + Zod
```

Forms:

- Start irrigation
- End irrigation
- Backfill irrigation
- Cutting
- Yield per cutting
- Fertilization
- Field note
- Season setup
- Soil type / thresholds

## 13.1 Form design rule

All forms must support:

```text
- default timestamp = now
- manual timestamp override
- target scope
- notes
- exact/estimated time confidence
```

---

## 14. Mobile Architecture

The dashboard must be phone-friendly.

## 14.1 Mobile navigation

Recommended mobile bottom nav:

```text
Home
Irrigation
Soil
Agronomy
Logs
```

## 14.2 Mobile priority

Daily mobile tasks:

```text
1. See last upload time
2. Start/end irrigation
3. Backfill irrigation
4. Add field note
5. Check latest moisture
```

## 14.3 Tables on mobile

Large tables must collapse:

```text
collapsed card rows
expand for detail
hide non-essential columns
```

---

## 15. Error and Empty States

Every page must handle:

```text
loading
empty data
API error
stale data
time uncertainty
missing measurement
unauthorized access later
```

## 15.1 Empty states

Examples:

```text
No sensor readings uploaded yet.
No irrigation events recorded for this period.
No technical events match these filters.
```

## 15.2 Error states

API failures should show:

```text
Retry
Technical detail expandable
No misleading zero values
```

---

## 16. Future Analytics Readiness

Analytics is intentionally deferred.

However, the frontend must reserve extension points.

## 16.1 Future hooks

```typescript
useInsights()
useIrrigationEffectiveness()
useHeatStressSummary()
useDataConfidence()
```

These can return empty or placeholder values in the first build.

## 16.2 Rule

Do not hard-code analytics inside chart components.

Instead:

```text
raw data hooks → transformation utilities → future analytics hooks → UI cards
```

---

## 17. Testing Strategy

## 17.1 Unit tests

Test:

- time conversion
- overlay generation
- null/missing point handling
- target scope mapping
- form validation

## 17.2 Component tests

Test:

- irrigation start/end UI
- chart overlay rendering
- logs filters
- mobile collapsed navigation
- empty states

## 17.3 Integration tests

Test:

- API client errors
- TanStack Query cache invalidation
- manual event creation updates overlays
- timezone setting changes displayed time

---

## 18. Implementation Order

Recommended frontend order:

```text
1. Project scaffold
2. API client + TypeScript types
3. Layout + routing
4. Timezone utilities
5. Overview page
6. Sensor chart pages
7. Logs page
8. Upload History
9. Agronomic events API integration
10. Daily Operations mobile flow
11. Agronomy pages
12. Chart overlays
13. Polish + tests
```

---

## 19. Final Architecture Principle

```text
Build the dashboard as a clean data platform first,
then add intelligence later without rewriting the foundation.
```
