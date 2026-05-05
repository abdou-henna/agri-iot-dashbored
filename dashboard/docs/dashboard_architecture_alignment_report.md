# Dashboard Architecture Alignment Report (Pre-Phase 7/8)

Date: 2026-05-05  
Scope: analysis only (no implementation changes)

## 1) Current dashboard structure

### Main folders under `dashboard/src`
- `app/` — app-level wiring (`router.tsx`, providers).
- `api/` — all REST wrappers and API client (`client.ts`, domain API files).
- `hooks/` — TanStack Query hooks and feature data orchestration.
- `types/` — domain type contracts for readings/events/uploads/status/agronomy.
- `features/` — page-level domains (overview, soil, weather, comparison, diagnostics, agronomy, settings).
- `components/` — reusable UI (layout, charts, feedback).
- `utils/` — cross-feature pure utilities (time, chart shaping, CSV export).
- `config/` — routes/constants.

### Layer roles and boundaries
- API calls are centralized in `src/api/*`; components should not call `fetch` directly.
- Hooks in `src/hooks/*` are the query boundary (`queryKey`, `staleTime`, API function call).
- Types in `src/types/*` represent backend contracts and filter params.
- Feature pages compose hooks and present data; shared rendering primitives remain in `components`/`utils`.

### Data flow from WebService to UI
1. Feature page (e.g., Overview/Soil/Logs) requests data via hook.
2. Hook (`useReadings`, `useEvents`, `useUploads`, `useAgronomicEvents`, etc.) calls domain API wrapper.
3. Domain API wrapper uses `apiGet/apiPost/apiPatch` from `api/client.ts`.
4. `client.ts` builds URL from `VITE_API_BASE_URL`, handles timeout/error normalization, executes fetch.
5. Hook returns cached state to page; page maps to chart/table components and applies display timezone formatting via utilities.

---

## 2) Existing domain separation

Confirmed separation follows architecture docs and code:
- `sensor_readings` domain → readings hooks/api/types/pages.
- `system_events` domain → events hooks/api/types/pages.
- `uploads` domain (+ gateway/node status metadata) → uploads/status/nodes hooks/api/types/pages.
- `agronomic_events` domain → agronomy hooks/api/types/pages.

### Timestamp semantics by domain
- `sensor_readings`: chart/analysis time = `measured_at` (not upload/received).
- `system_events`: logs/event timeline time = `event_time`.
- `uploads`: transfer/audit time = `started_at`/`finished_at` and server `received_at`.
- `agronomic_events`: agronomy operations time = `started_at`/`ended_at` (and event overlays/time windows).

---

## 3) Existing page/features map

### Implemented route map
- Overview: `/`
- Soil pages: `/soil/pivot-1`, `/soil/pivot-2`
- Weather: `/weather`
- Comparison: `/soil/comparison`
- Logs: `/diagnostics/logs`
- Uploads: `/diagnostics/uploads`
- System Health: `/diagnostics/system-health`
- Agronomy pages:
  - `/daily-operations`
  - `/agronomy/field-setup`
  - `/agronomy/cutting-yield`
  - `/agronomy/fertilization`
  - `/agronomy/field-notes`
- Insights: `/agronomy/insights` (present)
- Settings: `/settings`

---

## 4) Existing integration rules (fit-to-current architecture)

1. **API calls live in `src/api`.**
2. **Hooks live in `src/hooks`** and are the query/caching contract.
3. **Types live in `src/types`** and must be kept domain-specific.
4. **Reusable transformation logic lives in `src/utils`** (and small shared presentational pieces in `src/components`).
5. **Feature pages in `src/features/*` should orchestrate, not own transport contracts.**
6. **Components must NOT:**
   - call `fetch` directly,
   - merge raw domain datasets into a single mutable store,
   - reinterpret timestamps outside documented semantics,
   - duplicate API normalization logic from `api/client.ts`.

---

## 5) Best location for Phase 7 additions (within existing style)

### Recommended placement
- Cleaning logic: `src/utils/analytics/cleaning.ts`
- QC logic: `src/utils/analytics/qc.ts`
- Metrics logic / feature engineering: `src/utils/analytics/metrics.ts`
- Reliability scoring: `src/utils/analytics/reliability.ts`
- Alert rules evaluator: `src/utils/analytics/alerts.ts`
- Analytics types: `src/types/analytics.ts`
- Analytics hooks:
  - `src/hooks/useAnalytics.ts`
  - `src/hooks/useReliabilityScores.ts`
  - `src/hooks/useAlertEvaluations.ts`
- Optional analytics API wrappers (only if server endpoints exist):
  - `src/api/analytics.api.ts`

### Why this fits
- Preserves current `api`/`hooks`/`types`/`utils` separation.
- Avoids introducing parallel architectures (`core/`, `modules/`) that conflict with current repo layout.
- Keeps Phase 7 as additive, domain-aware infrastructure consumed by existing feature pages.

---

## 6) Best location for Phase 8 additions (Gemini/AI)

### Recommended placement
- Gemini mapper (domain-safe projection): `src/utils/ai/geminiMapper.ts`
- Gemini prompts/templates contract: `src/config/geminiPrompts.ts`
- Gemini service wrapper: `src/api/gemini.api.ts` (or `src/api/ai.api.ts` if broader)
- AI I/O types: `src/types/ai.ts`
- AI safety boundaries/policies (frontend guardrails + schema checks):
  - runtime checks: `src/utils/ai/boundaries.ts`
  - config constants: `src/config/aiBoundaries.ts`
- AI hooks:
  - `src/hooks/useGeminiInsights.ts`
  - `src/hooks/useAiRecommendations.ts`

### Boundary note
Keep AI output as advisory overlays/insight cards in existing features (especially `features/agronomy/InsightsPage.tsx`) without changing base telemetry semantics or replacing deterministic charts.

---

## 7) Documentation check (generated docs + location)

### 8 generated docs status
All 8 files exist, but currently under:
- `dashboard/docs/DATAAnalysis/`

Expected target from request was `dashboard/docs/` root. So they are present but nested one level deeper than expected.

### Duplicate/misplaced markdown under dashboard root
- No duplicates of those 8 generated files were found under `dashboard/` root.
- Existing markdown at dashboard root is limited (`README.md`, `implementation_master_plan.md`) and appears intentional.

### Future link/reference updates likely needed
- Any docs or roadmap references that assume `dashboard/docs/<file>.md` should be updated later to `dashboard/docs/DATAAnalysis/<file>.md` (or files relocated in a controlled docs pass).

---

## 8) Risk assessment (real risks only)

1. **Architecture drift risk**: adding Phase 7/8 as a separate “new architecture” would duplicate current layering and increase maintenance overhead.
2. **Duplicated logic risk**: QC/metrics/reliability logic may get reimplemented per page if not centralized under `utils/analytics` + dedicated hooks.
3. **Timestamp misuse risk**: accidental use of `received_at`/upload time in analytics could invalidate agronomic interpretation.
4. **AI overreach risk**: unconstrained AI responses could leak beyond advisory role and conflict with deterministic domain rules.
5. **Flow breakage risk**: embedding heavy analytics directly into existing page components without hook boundaries could regress current Overview/Soil/Diagnostics behavior.

---

## 9) Final recommendation

### What to update in roadmap next
- Add an explicit **“Phase 7/8 placement map”** section referencing existing folders (`src/api`, `src/hooks`, `src/types`, `src/utils`, `src/config`, `src/features/agronomy`).
- Add a **timestamp compliance checklist** for all new analytics/AI outputs.
- Add a **no-direct-fetch/no-cross-domain-merge** gate for Phase 7/8 PR review.

### What should NOT be touched now
- Do not refactor or relocate existing `src` architecture.
- Do not alter current route map/page ownership.
- Do not change existing time semantics policy.
- Do not create a parallel module system.

### Exact recommended Phase 7/8 folder structure (inside existing dashboard)

```text
dashboard/src/
  api/
    analytics.api.ts          # optional, only if backend endpoints exist
    gemini.api.ts             # Phase 8 AI service wrapper

  hooks/
    useAnalytics.ts
    useReliabilityScores.ts
    useAlertEvaluations.ts
    useGeminiInsights.ts
    useAiRecommendations.ts

  types/
    analytics.ts
    ai.ts

  utils/
    analytics/
      cleaning.ts
      qc.ts
      metrics.ts
      reliability.ts
      alerts.ts
    ai/
      geminiMapper.ts
      boundaries.ts

  config/
    aiBoundaries.ts
    geminiPrompts.ts
```

This structure is additive and fully aligned with the existing dashboard architecture.
