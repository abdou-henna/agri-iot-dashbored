# Smart Farm Dashboard Implementation Journey Report

## 1) Current Executive State

### Implemented in code
- Phase 1 foundation architecture is implemented in `dashboard/src` (API client, typed models, route shell, time utility, core hooks).
- Phase 2 sensor dashboard pages are implemented (Overview, Soil, Weather, Comparison) with chart components and aggregate/readings hooks.
- Phase 3 diagnostics pages are implemented (Logs, Uploads, System Health).
- Phase 4 backend (WebService agronomic domain + migration + route registration) is implemented.

### Verified in runtime
- Verified historically in project validation notes: core API endpoints and aggregate endpoints were reachable after Render warmup/retry cycles.
- Verified issues/fixes in migration logic were identified through production/runtime failure symptoms and then patched.

### Implemented but not fully runtime-validated in current snapshot
- End-to-end agronomic frontend irrigation workflow (start/end in dashboard UI) is not present as connected flow in `dashboard/src`.
- Some backend validations depended on deployment state and were not consistently reproducible from this environment.

### Phase conclusion
- **Phase 4 backend:** COMPLETE (implemented and hardened).
- **Phase 4 frontend integration:** PARTIAL.
- **Phase 5:** NOT STARTED.

### Immediate next step
- Phase 4 Frontend Integration: hooks first, then connected irrigation UI, then live runtime validation.

---

## 2) Source of Truth
Primary references used for this report:
- `dashboard/implementation_master_plan.md`
- `dashboard/frontend_architecture.md`
- `dashboard/data_contract.md`
- `dashboard/time_semantics_dashboard_policy.md`
- `dashboard/agronomic_manual_events.md`
- `dashboard/api_requirements.md`
- `dashboard/interaction_flows.md`
- `dashboard/implementation_plan.md`
- `WebService/sql/*.sql`
- `WebService/src/*`
- `dashboard/src/*`
- git commit history available in this repository

Non-negotiable interpretation applied:
- `sensor_readings`, `system_events`, `uploads`, and `agronomic_events` are separate domains.
- Time semantics are distinct and must not be mixed:
  - sensor charts: `measured_at`
  - logs/events: `event_time`
  - agronomy: `started_at` / `ended_at`
  - upload diagnostics: `received_at` + upload timestamps
- UI remains constrained: no pH/salinity/NPK/battery productization unless formally enabled later.

---

## 3) Timeline vs Master Plan (strict)

## Phase 1 — Foundation / Backend P0
- **Planned goal:** base architecture + data pipeline + core backend enhancements.
- **Actual implementation:**
  - Frontend structure, API client, typed models, timezone utility, and route shell exist.
  - Backend route surface for core entities exists (`status`, `readings`, `events`, `uploads`, `nodes`).
- **Evidence:** `dashboard/src/api/*`, `dashboard/src/types/*`, `dashboard/src/utils/time.ts`, `dashboard/src/app/router.tsx`, `WebService/src/routes/*`.
- **Deviation/delay:** none material in code structure.
- **Reason:** n/a.
- **Assessment:** acceptable.

## Phase 2 — Core Sensor Dashboard
- **Planned goal:** fully usable sensor pages via aggregate/readings pipelines.
- **Actual implementation:**
  - Pages exist: Overview, Soil, Weather, Comparison.
  - Hooks exist: `useReadings`, `useReadingAggregates`, `useEvents`, `useStatus`, `useNodes`, `useUploads`.
  - Shared chart module exists and is used.
- **Evidence:** `dashboard/src/features/overview|soil|weather|comparison`, `dashboard/src/hooks/*`, `dashboard/src/components/charts/BasicCharts.tsx`.
- **Deviation/delay:** runtime checks were intermittently blocked by deployment state and data-window assumptions.
- **Technical reason:** API warmup latency + querying ranges with no data + deployment version mismatch risk.
- **Assessment:** acceptable but requires disciplined live verification.

## Phase 3 — Diagnostics / Upload / System Health
- **Planned goal:** production-grade diagnostics and upload audit workflows.
- **Actual implementation:**
  - Diagnostics pages implemented: Logs, Uploads, System Health.
  - Backend includes event/readings helper endpoints in history (events aggregate, reading detail by record ID).
- **Evidence:** `dashboard/src/features/diagnostics/*`, `WebService/src/routes/events.routes.js`, `WebService/src/routes/readings.routes.js`, related controllers/services.
- **Deviation/delay:** validation confidence impacted by stale deployment confusion.
- **Technical reason:** runtime sometimes hit old Render deployment despite local code updates.
- **Assessment:** must be corrected operationally (deployment workflow), not architecturally.

## Phase 4 — Agronomic Backend + Runtime
- **Planned goal:** canonical agronomic schema + irrigation lifecycle APIs.
- **Actual implementation:**
  - Agronomic migration added and iteratively hardened.
  - Agronomic routes/controller/service implemented and registered.
- **Evidence:** `WebService/sql/003_agronomic.sql`, `WebService/src/routes/agronomic.routes.js`, `WebService/src/controllers/agronomic.controller.js`, `WebService/src/services/agronomic.service.js`, `WebService/src/server.js`, `WebService/src/migrate.js`.
- **Deviation/delay:** multiple migration hotfixes required post-runtime errors.
- **Technical reason:** production had legacy schema realities not fully represented in first-pass migration assumptions.
- **Assessment:** corrected and acceptable; backend marked complete.

## Phase 4 Frontend Integration
- **Planned goal:** connected mobile irrigation start/end UX.
- **Actual implementation:** agronomy remains stubbed in current `dashboard/src` snapshot.
- **Evidence:** `dashboard/src/features/agronomy/StubPage.tsx`.
- **Deviation/delay:** backend landed before connected frontend flow.
- **Technical reason:** sequencing/prioritization and PR scope corrections.
- **Assessment:** must be completed before any Phase 5 work.

## Phase 5
- **Status:** NOT STARTED.

---

## 4) Backend/WebService Evolution

### How missing/unstable behavior was discovered
- Initial validation sessions found endpoint-level uncertainty due to mixed causes:
  - Some routes were absent in specific deployed versions.
  - Some checks used time windows without matching data (`points: []` but endpoint itself valid).
  - Some first-failure conclusions were wrong because Render was asleep/cold.

### How issues were diagnosed
- Repeated warmup/retry checks against `/health` and endpoint matrix.
- Separation of conclusions:
  - “code exists in repo” vs
  - “deployed endpoint verified working now”.

### Endpoint evolution covered
- `/api/v1/status`
- `/api/v1/readings`
- `/api/v1/readings/aggregate`
- `/api/v1/events`
- `/api/v1/uploads`
- `/api/v1/nodes`
- `/api/v1/agronomic-events`
- `/api/v1/agronomic-events/irrigation/start`
- `/api/v1/agronomic-events/irrigation/:agro_event_id/end`
- `/api/v1/agronomic-events/aggregate`

### Deployment-side failure contributors
- Render cold start produced slow/failed first responses.
- Stale deployment led to testing old code and false debugging paths.
- API base/path assumptions occasionally caused misleading failures.

### Important interpretation rule
- Existence in source code is necessary but not sufficient; deploy/version verification is required before concluding runtime success.

---

## 5) Agronomic Phase 4 / 4.5 (detailed debugging narrative)

### A) Original legacy model problem
Legacy data shape used fields such as `type`, `value`, `unit`, `metadata` and paired event semantics (`irrigation_start`, `irrigation_stop`).

### Why it broke canonical irrigation logic
Canonical Phase 4.5 requires one row per irrigation session. Pair-based legacy rows can be misinterpreted as open active sessions if mapped incorrectly, causing false 409 “already active” conflicts on start.

### Canonical target model
- Single row: `event_category='irrigation'`, `event_type='irrigation_session'`.
- `started_at` = session start.
- `ended_at = NULL` only while active.
- Ending irrigation updates same row and writes `details.duration_min`.

### B) Issue 1 — leftover legacy irrigation rows appearing active
- **Symptom:** `/irrigation/start` returned 409 even when no real active session existed.
- **Root cause:** legacy rows were backfilled into canonical session identity with `ended_at` left null in edge cases.
- **Fix:** migration cleanup updates ensure legacy rows do not remain active canonical sessions.
- **Why it works:** active-session query now excludes legacy artifacts because legacy rows are closed or remapped.

### C) Issue 2 — `ended_at > started_at` constraint conflict
- **Symptom:** migration/runtime constraint conflict when legacy close logic used equal timestamps.
- **Root cause:** fallback `ended_at = started_at` violates `ended_at IS NULL OR ended_at > started_at`.
- **Fix:** changed fallback to `started_at + INTERVAL '1 second'`.
- **Why it works:** preserves non-active closure while satisfying strict time check.

### D) Issue 3 — duplicate unique relation on rerun
- **Symptom:** migration failure: relation already exists for agronomic unique relation.
- **Root cause:** non-idempotent unique-constraint creation path.
- **Fix:** replaced fragile constraint-add block with idempotent unique index creation (`IF NOT EXISTS`).
- **Why it works:** repeated runs no longer fail when object already exists.

### E) Issue 4 — legacy NOT NULL columns broke canonical inserts
- **Symptom:** runtime insert failure: null in legacy `type` column during `/irrigation/start`.
- **Root cause:** production retained legacy NOT NULL constraints on deprecated columns not written by canonical runtime.
- **Fix:** guarded, idempotent `DROP NOT NULL` on legacy-only columns when present; canonical NOT NULL fields kept.
- **Why it works:** canonical inserts no longer depend on legacy write fields.

### F) Resulting backend state
- Canonical session model is implemented in backend + migration hardening.
- Known migration/runtime blockers encountered in production-like flow were addressed at SQL level.

---

## 6) Deployment / Repo Workflow Problem
Two-repo operation (main dashboard repo vs production WebService repo) created repeated confusion.

### What went wrong
- Code was updated in one location while production tested another version.
- Manual folder copying introduced human error and drift.
- Debugging sometimes targeted symptoms from stale deploys, not current source.

### Why manual copy is dangerous
- No deterministic traceability between tested runtime and audited commit.
- Easy to skip files (routes/migrations/config), creating false “endpoint missing” conclusions.

### Why subtree is correct
- Explicitly maps `WebService/` subtree to deployment repo with auditable commit lineage.
- Reduces accidental version skew and shortens root-cause time.

### Failure scenario if subtree is not used
- Engineer patches migration locally.
- Manual copy misses one controller or migration file.
- Render deploys partial state.
- Runtime fails differently than local expectation.
- Team debugs wrong root cause for hours.

### Intended commands
- `git subtree push --prefix=WebService webservice main`
- `git subtree pull --prefix=WebService webservice main --squash`

---

## 7) Dashboard Frontend Progress (factual)
Based strictly on current `dashboard/src`:
- API layer exists (`dashboard/src/api/*`).
- Sensor/diagnostic hooks exist (`useReadings`, `useReadingAggregates`, `useEvents`, `useStatus`, `useUploads`, `useNodes`).
- Sensor pages exist (Overview, Soil, Weather, Comparison).
- Diagnostics pages exist (Logs, Uploads, SystemHealth).
- Shared chart components are implemented (`components/charts/BasicCharts.tsx`).
- Agronomy page in current snapshot is **StubPage**, not connected irrigation workflow.
- No claim made that start/end irrigation frontend flow is complete.

---

## 8) Problems Encountered and Resolutions (actionable)

| Problem | Symptom | Root cause | Files involved | Fix applied | Current status | Remaining risk |
|---|---|---|---|---|---|---|
| Missing backend route behavior | endpoint 404 / unavailable in checks | route absent in deployed version or stale deploy | routes/controllers/services | route surface completed and redeployed path clarified | mitigated | deployment skew can recur |
| Empty aggregate results | valid response with `points: []` | incorrect/empty data time range | readings + aggregate APIs | use real `measured_at` windows from live rows | mitigated | wrong query windows still possible |
| RTC/time anomalies (year 2000 class) | misleading historical chart points | device RTC integrity drift/loss | data ingest/time semantics | documented; semantics enforced in dashboard policy | open | data-quality trust risk |
| Render cold start | first request timeout/failure | platform sleep/warmup latency | runtime infra | warmup/retry procedure | mitigated | transient latency remains |
| Stale deployment confusion | tests hit old code | separate repo/deploy mismatch | repo/deploy workflow | subtree workflow chosen | partial | process compliance required |
| Legacy irrigation rows stayed active | `/irrigation/start` returns false 409 | legacy backfill left canonical active artifacts | `003_agronomic.sql` | cleanup/closure logic added | fixed | future migration edits must preserve behavior |
| Time-check constraint conflict | migration/check failure | `ended_at == started_at` fallback invalid | `003_agronomic.sql` | changed to `+1 second` fallback | fixed | none if retained |
| Duplicate relation on migration rerun | migration aborts | non-idempotent unique object creation | `003_agronomic.sql` | idempotent unique index path | fixed | low |
| Legacy NOT NULL insert failure | runtime insert fails on `type` null | old schema constraints persisted | `003_agronomic.sql` | guarded DROP NOT NULL on legacy columns | fixed | ensure applied in target DB |
| CORS local dev failure | browser blocks localhost dashboard calls | missing/incorrect CORS headers in runtime | `WebService/src/server.js`, `package.json` | CORS config added in code | implemented | deployment/dependency rollout must be verified |
| Phase 4 frontend gap | no connected irrigation UI flow | agronomy frontend not wired | `dashboard/src/features/agronomy/StubPage.tsx` | identified as immediate next work | pending | blocks Phase 4 UX completion |

---

## 9) Current Verified State (strict split)

### VERIFIED WORKING (from repo + prior runtime checkpoints)
- Core dashboard sensor/diagnostics pages exist and compile structure is present.
- Backend has implemented agronomic domain route/controller/service/migration artifacts.
- Migration hardening changes for key production failures are present in SQL history.

### IMPLEMENTED BUT NOT VERIFIED IN THIS ENVIRONMENT
- Consistent live production verification of every endpoint after final deploy.
- End-to-end agronomic frontend start/end flow (because UI is still stubbed).
- Final deployed CORS behavior after dependency/install/deploy path in target runtime.

### KNOWN RISKS
- Deployment-version drift across repositories.
- Data/time-quality anomalies from RTC conditions.
- Human process risk when migration reruns are not validated against real production state.

---

## 10) Pending Work Before Phase 5
- [ ] Complete Phase 4 frontend hooks integration for agronomy runtime usage.
- [ ] Implement connected irrigation UI (start/stop) in dashboard (replace agronomy stub).
- [ ] Verify active-session handling in UI against live API state.
- [ ] Verify client-side double-start prevention + server 409 handling UX.
- [ ] Validate dashboard end-to-end against live Render API with real time windows.
- [ ] Verify CORS in deployed environment (not only code-level).
- [ ] Do not start cutting/yield/season/fertilization flows before irrigation UI completion.

---

## 11) Immediate Next Step
**Phase 4 Frontend Integration:**
1. Hooks/data contracts first.
2. Connected mobile irrigation start/end UI second.
3. Runtime validation against live deployed API third.

---

## 12) Final Validation Checklist
- Phase 5 status in this report: **NOT STARTED**.
- Phase 4 backend status in this report: **COMPLETE**.
- Phase 4 frontend status in this report: **PARTIAL**.
- Agronomic debugging narrative includes root causes and fixes for legacy/migration failures.
- No firmware-change recommendations included.
- No code or architecture changes proposed here beyond documented continuation steps.
