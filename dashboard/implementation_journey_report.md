# Smart Farm Dashboard Implementation Journey Report

## 1. Current Executive State
- **Current phase status:**
  - Phase 1–3: largely implemented in current codebase.
  - Phase 4 backend/runtime: implemented in WebService (agronomic schema + routes + services).
  - Phase 4 frontend integration: **partial/pending** (agronomy page is currently a stub in `dashboard/src/features/agronomy/StubPage.tsx`).
  - Phase 5: **not started**.
- **Complete:** core sensor pages, diagnostics pages, backend route surface including agronomic endpoints, migrations list includes phase-4 migration.
- **Partially complete:** agronomic frontend workflow (hooks/forms/mobile irrigation flow not fully wired as a connected start/end UI).
- **Blocked / pending:** production/runtime verification consistency and deployment workflow discipline between main repo and Render WebService target.
- **Immediate next step:** Phase 4 Frontend Integration — hooks first, then connected mobile irrigation UI.

## 2. Source of Truth
Primary references used:
- `dashboard/implementation_master_plan.md`
- `dashboard/frontend_architecture.md`
- `dashboard/data_contract.md`
- `dashboard/time_semantics_dashboard_policy.md`
- `dashboard/agronomic_manual_events.md`
- `dashboard/api_requirements.md`
- `dashboard/interaction_flows.md`
- `dashboard/implementation_plan.md`
- `WebService/sql/*.sql`
- `WebService/src/**`
- `dashboard/src/**`
- git history (`git log`)

Governing principles confirmed:
- Data domains remain logically separate: `sensor_readings`, `system_events`, `uploads`, `agronomic_events`.
- Time semantics remain distinct:
  - Sensor charts: `measured_at`
  - Logs/events: `event_time`
  - Agronomy: `started_at` / `ended_at`
  - Upload diagnostics: `received_at` / upload timestamps
- UI should not surface unsupported fields (pH, salinity, NPK, battery UI) unless formally enabled later.

## 3. Implementation Timeline vs Master Plan

### Phase 1 — Foundation / Backend P0
- **Planned goal:** architecture scaffold, typed client, time utils, core backend enhancements.
- **Actual:**
  - Frontend scaffold and typed API/hook base exists (`dashboard/src/api`, `dashboard/src/hooks`, `dashboard/src/types`, `dashboard/src/app`).
  - Time utility layer exists (`dashboard/src/utils/time.ts`).
  - Backend includes foundational routes/services (`/status`, `/readings`, `/events`, `/uploads`, `/nodes`).
- **Status:** **Complete (code-level)**.
- **Deviation:** none critical.
- **Assessment:** acceptable.

### Phase 2 — Core Sensor Dashboard
- **Planned goal:** functional sensor pages + aggregate chart flow.
- **Actual:**
  - Implemented sensor-focused pages: Overview, Soil, Weather, Comparison.
  - Aggregate/readings hooks and chart components exist (`useReadingAggregates`, `useReadings`, `BasicCharts`).
  - Backend aggregate endpoint and readings route support are present.
- **Status:** **Mostly complete**.
- **Deviation:** runtime verification depended on data range/environment availability; some validations were delayed by Render/network conditions.
- **Assessment:** acceptable with known validation caveats.

### Phase 3 — Diagnostics / Upload / System Health
- **Planned goal:** logs filtering, upload history, health analytics.
- **Actual:**
  - Diagnostics pages exist: `LogsPage`, `UploadsPage`, `SystemHealthPage`.
  - Backend includes `/events/aggregate` and `/readings/:record_id` support in current implementation history.
- **Status:** **Substantially complete**.
- **Deviation:** depended on deployment parity and environment checks.
- **Assessment:** acceptable, but requires ongoing integration testing against live deployment.

### Phase 4 — Agronomic Backend + Runtime
- **Planned goal:** canonical agronomic model and irrigation lifecycle APIs.
- **Actual:**
  - WebService includes `003_agronomic.sql`, agronomic routes/controller/service, route registration, and migration registration.
  - Multiple migration safety fixes were applied across iterations (idempotency and legacy compatibility).
- **Status:** **Complete (backend/runtime implementation in repo)**.
- **Deviation:** migration hardening required multiple follow-up fixes due production-like rerun and legacy-schema constraints.
- **Assessment:** required fixes were appropriate and necessary.

### Phase 4 Frontend Integration
- **Planned goal:** connected mobile-critical irrigation start/end flow.
- **Actual:** agronomy remains stubbed (`StubPage`) in current `dashboard/src` snapshot.
- **Status:** **Partial / pending**.
- **Deviation:** backend advanced faster than frontend agronomy UX integration.
- **Assessment:** must be fixed before Phase 5.

### Phase 5
- **Status:** **Not started**.

## 4. Backend/WebService Evolution
- Initial validation surfaced endpoint gaps and deployment/version mismatch confusion.
- Route surface in current backend includes:
  - `/api/v1/status`
  - `/api/v1/readings`
  - `/api/v1/readings/aggregate`
  - `/api/v1/events`
  - `/api/v1/uploads`
  - `/api/v1/nodes`
  - `/api/v1/agronomic-events`
  - irrigation start/end actions
  - agronomic aggregate
- Contract and migration evolution highlights:
  - Added canonical agronomic fields and constraints.
  - Added cleanup/backfill logic for legacy irrigation rows.
  - Added idempotent unique index creation for `agro_event_id` to avoid repeated-run failures.
  - Added guarded legacy column `DROP NOT NULL` to prevent runtime insert failures when old constraints remained in production.
- Runtime validation (where known) showed repeated issues tied to environment/deploy state (Render asleep, stale deploy, data-range mismatch), not just code.

## 5. Agronomic Events Phase 4 / Phase 4.5
- **Initial model problem:** legacy schema semantics (`type`, `value`, `unit`, `metadata`) and paired `irrigation_start`/`irrigation_stop` events do not match canonical session semantics.
- **Why wrong:** canonical design requires one mutable session row for active irrigation, not event-pair reconstruction logic.
- **Correct canonical model:**
  - One `irrigation_session` row per session.
  - `started_at` marks begin time.
  - `ended_at = NULL` means active.
  - End operation updates same row and computes `details.duration_min`.
- **Core files involved:**
  - `WebService/sql/003_agronomic.sql`
  - `WebService/src/routes/agronomic.routes.js`
  - `WebService/src/controllers/agronomic.controller.js`
  - `WebService/src/services/agronomic.service.js`
  - `WebService/src/server.js`
  - `WebService/src/migrate.js`
- **Migration issues encountered:**
  1. Legacy conversion left open sessions from old irrigation rows.
  2. Constraint compatibility bug when `ended_at = started_at` conflicted with `ended_at > started_at` rule.
  3. Idempotency failure when named unique relation already existed in repeated runs.
  4. Legacy columns retained `NOT NULL`, breaking canonical inserts that no longer write those fields.
- **Fixes applied:**
  - Legacy irrigation cleanup to ensure historical rows do not remain active canonical sessions.
  - Switched invalid equal-time close to `started_at + INTERVAL '1 second'` where needed.
  - Replaced fragile unique-constraint add with idempotent unique index (`IF NOT EXISTS`).
  - Guarded `DROP NOT NULL` for legacy columns (`type`, `node_id`, `value`, `unit`, `metadata`, `created_by`) while preserving canonical NOT NULL fields.
- **Final verified result (intended target state):**
  - `POST /irrigation/start` works without legacy NOT NULL collisions.
  - `POST /irrigation/:id/end` patches same row and completes session.
  - Aggregate returns `irrigation_minutes_total` and `sessions_count` for completed sessions.

## 6. Repo / Deployment Workflow Problem
- Main dashboard repo and production WebService deployment repo were handled separately.
- Manual copy/paste folder sync caused production to run stale code at times, creating false negatives during endpoint validation.
- Git subtree was selected as the professional synchronization pattern.
- Intended workflow:
  1. Develop in main repo under `WebService/`.
  2. Push subtree to dedicated WebService repo.
  3. Deploy latest WebService commit on Render.
- Recommended commands:
  - `git subtree push --prefix=WebService webservice main`
  - `git subtree pull --prefix=WebService webservice main --squash`

## 7. Dashboard Frontend Progress
- **API layer:** present (`dashboard/src/api/*`), includes dedicated modules and shared client.
- **Hooks:** core sensor/diagnostic hooks present (`useReadings`, `useReadingAggregates`, `useEvents`, `useUploads`, `useStatus`, `useNodes`, `useTimeZone`).
- **Pages:** Overview, Soil, Weather, Comparison, Settings, diagnostics pages present.
- **Charts:** reusable chart primitives in `dashboard/src/components/charts/BasicCharts.tsx`.
- **Diagnostics pages:** logs/uploads/system health pages implemented.
- **Agronomy frontend:** current code shows `StubPage` under agronomy; connected irrigation UX flow is not complete in this snapshot.
- **Architecture alignment:** largely aligned with `frontend_architecture.md` structure (api/hooks/features/components/utils separation).
- **Direct fetch usage:** intended architecture avoids direct fetch in components; API layer exists for indirection.
- **Time utilities:** `dashboard/src/utils/time.ts` exists and is intended single conversion point.
- **Domain separation:** code organization and docs continue to enforce separation.

## 8. Problems Encountered and Resolutions

| Problem | Symptom | Root cause | Files involved | Fix applied | Current status | Remaining risk |
|---|---|---|---|---|---|---|
| Missing backend endpoints | UI paths untestable | Backend route/service gaps or stale deploy | `WebService/src/routes/*`, services/controllers | Added required routes/services | Improved | Deployment drift can reintroduce mismatch |
| Empty aggregate due to wrong time range | `points: []` | Queried interval had no matching data | `/readings`, `/readings/aggregate` usage | Use real `measured_at` range from live rows | Understood | Still requires careful runtime verification |
| `measured_at` year 2000 / RTC issues | timelines appear historically wrong | RTC/device-time integrity problem | data + firmware-generated timestamps | Documented as data-quality issue | Ongoing | Affects chart trust if unresolved |
| Render asleep / old deployment confusion | transient failures / inconsistent endpoint behavior | cold starts + stale deployment version | runtime environment | warmup/retest discipline; deployment checks | Ongoing | Diagnostic overhead remains |
| Separate repos / manual copy | production not matching main repo | process gap | repo workflow | subtree workflow recommended | Partially adopted | Must enforce operationally |
| Phase 4.5 not clearly present initially | inconsistent canonical behavior | phased incremental backend fixes | `003_agronomic.sql`, agronomic backend files | canonical + migration hardening updates | Addressed in backend | Needs persistent regression checks |
| PR accidentally included dashboard changes | scope drift | branch hygiene issue | dashboard files | reverted non-backend scope | Resolved in later iterations | Review discipline needed |
| Legacy NOT NULL migration failure | `/irrigation/start` insert error on `type` | old schema constraints persisted | `003_agronomic.sql` | guarded DROP NOT NULL on legacy columns | Fixed | must keep migration idempotent |
| CORS local dev issue | browser blocks localhost dashboard API calls | missing CORS middleware/config | `WebService/src/server.js`, `package.json` | added cors config + dependency | Implemented in code | environment package install policy can block runtime |
| Phase 4 backend ahead of frontend | agronomy UI flow incomplete | sequencing mismatch | `dashboard/src/features/agronomy/*` | identified as next task | Pending | blocks true phase-4 UX completion |

## 9. IoT / Firmware Context Relevant to Dashboard
- Upload model is offline-first batch transfer; dashboard is not real-time.
- Sensor charts must use `measured_at` even when uploads happen much later.
- LoRa/ACK/recovery instability and weak RSSI observations impact confidence in continuity.
- Node2 has suspected power/hardware reliability concerns in observed diagnostics.
- Missing-data detection and RTC integrity remain critical risks for interpretation quality.
- Firmware redesign is out of current scope; dashboard must surface these realities clearly.

## 10. Current Verified State
- Backend route structure includes core sensor, diagnostics, and agronomic endpoints in repo.
- Agronomic migration has undergone iterative hardening for canonical semantics and repeat-run safety.
- CORS support for local dashboard origin is implemented in server code, pending environment dependency install/promotion.
- Dashboard has strong Phase 1–3 coverage in code.
- Unresolved items: frontend agronomic connected flow, end-to-end live validation discipline, deployment workflow strictness.

## 11. Pending Work Before Phase 5
1. Verify CORS in deployed environment (and ensure dependency availability in deployment pipeline).
2. Complete Phase 4 frontend hooks/wiring for agronomy runtime behavior.
3. Complete connected mobile irrigation start/end flow UX.
4. Verify active irrigation state derivation and double-start prevention behavior against live API.
5. Validate dashboard UI against live Render API with real data windows.
6. Do not start cutting/yield/season/fertilization flows before irrigation UI completion.

## 12. Immediate Next Step
**Phase 4 Frontend Integration — hooks first, then connected mobile irrigation UI.**
