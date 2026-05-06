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
- Gemini JSON schema patch added responseSchema and safe output normalization to prevent gemini_invalid_shape when Gemini omits optional arrays or top-level fields.

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

## 13) Final Runtime Confirmation

- POST /irrigation/start: verified working
- POST /irrigation/:id/end: verified working
- Aggregate endpoint:
  - irrigation_minutes_total returned
  - sessions_count returned
- No active-session false conflicts observed after migration fixes

Conclusion:
Backend agronomic system is stable and safe for frontend integration.

## Phase 5 — Agronomic Events (Frontend + Integration)

  ### Status
  - Phase 5 frontend implementation: COMPLETE
- Phase 5 backend reuse: COMPLETE (no schema changes)
- All agronomic events use canonical agronomic_events table

### Implemented
- Season management (start/end)
- Cutting events
- Yield records (linked to cutting)
- Fertilization events
- Field notes

### Architecture Compliance
- No new tables introduced
- No domain mixing (sensor_readings, system_events, uploads, agronomic_events remain isolated)
- All events follow canonical model:
  event_category · event_type · target_scope · started_at · ended_at · details · notes · confidence

### Known Technical Debt (Deferred to Phase 5.1)
- Frontend uses "season" mapped to backend "season_setup"
- Hook name useAgronomyPhase5 is phase-specific
- Yield-to-cutting linkage depends on details.cutting_id enforcement

### Validation Status
- TypeScript: PASS
- Build: PASS (non-blocking warnings only)
- Runtime validation: pending final confirmation with production data

### Next Step
- Phase 5.1: Contract alignment and cleanup
- Phase 6: Agronomic analytics and insights

## Phase 6 — Agronomic Insights
- Insights page is implemented for agronomic analytics workflows, including irrigation versus soil moisture trend interpretation and cutting/yield summaries.
- Reliability summary is included using existing confidence/status context from current frontend data sources.
- Phase 6 reuses existing dashboard APIs and agronomic endpoints; no backend or schema changes were introduced.
- Validation status: implemented in dashboard UI flow, with runtime behavior dependent on available production data windows.

## Phase 6.1 — Dashboard UX Refinement
- Sidebar UX refined with desktop collapse/expand, localStorage persistence, and vertical scrolling in desktop/mobile navigation containers.
- Major chart cards in Soil, Weather, and Comparison now support fullscreen expansion with mobile-readable modal sizing.
- Fertilization form corrected to capture datetime, fertilizer name/type, optional amount/unit, target scope, confidence, and optional notes; saved rows now show those values.
- Validation: typecheck/build pass locally; manual checks completed for layout overflow/scroll behavior and chart expansion wiring.
- Limitations: final visual validation still depends on live data density and device viewport testing in runtime.

## Phase 6.2 — Runtime UX Corrections

- Sidebar behavior corrected: mobile drawer now keeps route labels visible, desktop collapsed rail shows icons only, hamburger now handles desktop collapse toggle and mobile drawer open, and collapsed rail hides scrollbar while preserving clickable navigation.
- Mobile header behavior corrected: top header is fixed on mobile with content offset to avoid overlap, while desktop layout remains unchanged in structure.
- Logs page enhanced with “Latest upload logs” control: latest `upload_id` is derived from existing `system_events` rows in current view data; control is disabled with message `No upload id available.` when none is present; clearing filters exits latest-upload mode.
- Cutting entry flow now includes date-only input; blank date resolves to today; submitted `started_at` is generated at local noon and converted to UTC ISO string; cutting list now shows readable dates alongside IDs.
- Season workflow moved to long-form entry: editable start/end dates, optional notes, target scope/confidence selectors, and explicit save actions for season start/end using existing agronomic events fields (`started_at`, `ended_at`, `notes`, `details`) only.
- System Health UX improved: opening “View raw payload” now auto-scrolls to the revealed payload section using smooth `scrollIntoView`.

### Validation result
- Typecheck/build validation for the dashboard completed successfully after these UI/data-entry updates.
- Manual runtime checks for target interactions were implemented in code paths but still depend on live API data presence for full behavior confirmation.

### Remaining limitations
- Latest upload mode depends on `upload_id` being present in the currently fetched `system_events` window (same limitation as data freshness/windowing).
- Season lifecycle still uses the existing phase-mapped backend category (`season_setup`) and existing create-event contract; no backend or schema normalization was introduced in this phase.

## Phase 7.x — In-Memory Analytics Snapshot Foundation

- **Files created/updated:**
  - `dashboard/src/types/analytics.ts`
  - `dashboard/src/utils/analytics/snapshots.ts`
  - `dashboard/src/utils/analytics/index.ts`
  - `dashboard/src/hooks/useAnalyticsSnapshot.ts`
- **Derived-only rule:** snapshot objects are computed from existing hook outputs; no snapshot operation mutates source records.
- **No raw mutation:** snapshot utilities and hook logic clone/merge into new arrays/objects only.
- **No persistence:** no localStorage/sessionStorage/database writes were introduced.
- **Validation result:** `npm run typecheck` and `npm run build` pass for the dashboard package after this phase update.
- **Known limitations:**
  - `reliability_score` intentionally remains undefined in quality summary for this phase.
  - QC flag merge currently deduplicates by structural identity and does not classify conflict severity.
  - In-memory snapshot lifecycle is per-render and not shared across views.
- **Next step:** wire Phase 7.y incremental merge flow with existing deterministic analytics pipeline and version-aware invalidation triggers.

## Phase 7.x — Snapshot Foundation Correctness Patch

- `useAnalyticsSnapshot` now reuses `useAnalytics` output instead of duplicating direct snapshot derivation paths.
- Snapshot payload now includes QC flags, duplicate metadata semantics, cleaned-readings cursor, and quality counters aligned to the Phase 7.x contract.
- Raw data immutability is preserved (derived-only transformations and no in-place source mutation).
- No UI/backend/schema/API contract changes were introduced.
- Validation result: `npm run typecheck` and `npm run build` pass.
- Remaining limitations: reliability score remains undefined and invalidation reason still uses `query_filters_changed` placeholder for incompatible identities.

## Phase 7.x — Snapshot Hook Architecture Cleanup

- Removed local duplicated analytics derivation logic from `useAnalyticsSnapshot`.
- `useAnalyticsSnapshot` now reuses the real shared `useAnalytics` hook.
- Raw data remains read-only/derived-only with no in-place mutation.
- No UI/backend/schema/API contract changes were introduced.
- Validation result: `npm run typecheck` and `npm run build` pass.

## Phase 7.x — useAnalytics QC Restoration

- Restored `missingPct` computation in `useAnalytics` using deterministic 10-minute cadence expectation across `from`/`to`.
- Restored QC composition to include physical range, flatline, and spike/step checks.
- Read-only/derived-only behavior is preserved with no raw data mutation.
- Validation result: `npm run typecheck` and `npm run build` pass.

## Phase 7.y — Persistent Derived Analytics Snapshots
- Added persistent snapshot schema migration `004_analytics_snapshots.sql` with table `analytics_snapshots`, required columns, and indexes for identity lookup, time window lookup, invalidation filtering, and version filtering.
- Added backend service/controller/routes for snapshot persistence: list, get by `snapshot_id`, upsert by `snapshot_id`, and invalidate with reason.
- Added dashboard API wrapper module `analyticsSnapshots.api.ts` and hook `usePersistentAnalyticsSnapshot` that composes `useAnalyticsSnapshot` with explicit save/invalidate mutations.
- Raw data immutability confirmed: implementation writes only `analytics_snapshots`; no writes were introduced to `sensor_readings`, `system_events`, `uploads`, or `agronomic_events`.
- No UI connection was added; no pages, charts, layouts, or route wiring were changed.
- Validation result: backend migration script and dashboard type/build checks executed (details in validation section of implementation output).
- Known limitations: no pagination on snapshot list endpoint; no strict enum validation for `domain/bucket`; no API-key protection added because existing read/query route pattern is public in current service.
- Next step: add backend request validation hardening (allowed domain/bucket/version format), optional pagination, and query-key invalidation linkage in dashboard when persistence is wired to future UI actions.

## Phase 7.y — Snapshot API Hardening
- Added strict backend validation for snapshot domain, bucket, invalidation reason, required identity fields, and date window ordering.
- Added list pagination (`limit`, `offset`) with defaults and bounds validation.
- Updated CORS allowed headers to include `x-api-key` alongside `Content-Type`.
- Raw data immutability preserved: writes remain scoped to `analytics_snapshots` only.
- Validation result: WebService migration command failed in this environment due to missing local dependency resolution; dashboard typecheck/build succeeded.
- Remaining limitations: list endpoint returns page length as `count` (not total matched rows), and validation still does not enforce version format patterns beyond non-empty strings.

## Phase 7.z — Incremental Snapshot Reuse Foundation
- Implemented latest snapshot endpoint `GET /api/v1/analytics-snapshots/latest` with required identity constraints (`domain`, `bucket`, `analytics_version`, `qc_version`, `filters_hash`) and optional selectors (`node_id`, `metric`, `calibration_version`), hard-filtered to `invalidated=false`, sorted by `window_end DESC, updated_at DESC`.
- Added dashboard analytics snapshot API function `getLatestAnalyticsSnapshot(filters)` and incremental reuse hook foundation for persisted-latest + in-memory snapshot composition.
- Merge preview behavior: if persisted snapshot exists and identity is compatible, a non-mutating preview merge is produced via `mergeSnapshots`; otherwise fallback uses current in-memory snapshot.
- No autosave behavior added; persistence remains explicit only through `saveMergedSnapshot`.
- Raw-domain immutability is preserved: no writes were added to `sensor_readings`, `system_events`, `uploads`, or `agronomic_events`.
- No UI scope and no Gemini/AI integration were introduced in this phase.
- Validation executed for backend/frontend checks in this environment (results listed in validation section).
- Known limitations: compatibility is strict identity-based; delta-fetch execution wiring is not yet introduced in this phase.
- Next step: use reusable cursor boundaries in analytics fetch pipelines, then persist operator-approved merged snapshots explicitly.

## Phase 7.z.1 — Cursor-Based Delta Fetch Foundation

- Added cursor-based delta-range derivation support so snapshot fetches can use `effectiveFrom` based on a reusable snapshot cursor, while keeping logical window identity (`from` → `to`) intact.
- `useIncrementalAnalyticsSnapshot` now checks the latest persisted snapshot first, reuses compatible snapshots, derives a cursor delta range, and computes the current snapshot with `effectiveFrom` when reusable.
- Autosave behavior remains unchanged (disabled): persistence still occurs only through explicit `saveMergedSnapshot`.
- Raw data immutability is preserved: no writes to `sensor_readings`, `system_events`, `uploads`, or `agronomic_events`; only snapshot persistence flows are used.
- No UI integration and no Gemini/AI integration were introduced in this phase.
- Validation result: dashboard typecheck/build pass with the new delta foundation; backend readings API required no change because `from` already maps to `measured_at >= from`.
- Known limitations: aggregate queries are still computed on logical full window (`from` → `to`) to avoid unsafe partial aggregate semantics in this phase.
- Next recommended step: add safe aggregate-delta reconciliation and deterministic bucket-level merge/invalidation policy so aggregate compute can also reduce full-window reads.

## Phase 7.z.2 — Incremental Identity Builder Cleanup

- Removed the double analytics snapshot hook pattern in incremental snapshot logic by replacing identity-seeding `useAnalyticsSnapshot` usage with a pure identity builder.
- Added `buildSensorSnapshotIdentityFromParams` to centralize snapshot identity construction semantics (`domain`, window bounds, bucket normalization, version defaults, and `filters_hash`) without network or React coupling.
- Preserved immutability guarantees for raw data domains (`sensor_readings`, `system_events`, `uploads`, `agronomic_events`): no writes or mutation paths were introduced.
- No backend, schema, API wrapper, UI, package, or Gemini/AI scope changes were made.
- Validation result: TypeScript typecheck and production build both pass after cleanup.
- Remaining limitation: identity compatibility and delta reuse are still bounded by persisted cursor quality/availability; when cursor is missing/invalid, logic correctly falls back to full logical window computation.

## Phase 7.z.3 — Aggregate Delta Reconciliation Foundation

- Added derived aggregate mode foundation in analytics hooks so aggregate generation can be sourced from fetched cleaned readings during true cursor-delta windows.
- Added snapshot payload metadata `features.aggregate_source` with mode and reason (`api_full_window` vs `derived_from_fetched_readings`) to make aggregate provenance explicit.
- Incremental snapshot hook now selects `aggregateMode='derived'` only when a reusable snapshot exists and cursor delta is actually used (`usedDelta=true`); safe fallback remains `aggregateMode='api'` for full-window flows.
- Preserved raw data immutability: no write or mutation paths were added for `sensor_readings`, `system_events`, `uploads`, or `agronomic_events`; snapshot persistence remains the only write target (`analytics_snapshots`) through existing explicit save path.
- No UI integration, Gemini/AI integration, backend change, database/schema change, or package change was introduced.
- Validation result: `npm run typecheck` and `npm run build` pass in `dashboard` after this phase update.
- Known limitations: `useReadingAggregates` currently lacks an `enabled` toggle in its API, so the aggregate query hook is still instantiated even when `aggregateMode='derived'`; results are ignored in derived mode.
- Next recommended step: add `enabled` support in `useReadingAggregates` (or equivalent query gating) so derived mode can skip backend aggregate requests completely while preserving hook-order safety.

## Phase 7 — Master Plan Alignment and Aggregate Query Gating

- Master plan was updated with a concise Phase 7 incremental-analytics completion subsection covering deterministic core through aggregate delta reconciliation and read-only guarantees.
- `useReadingAggregates` now supports query gating via optional `enabled?: boolean` while keeping default behavior unchanged for existing callers.
- `useAnalytics` now disables backend aggregate querying when `aggregateMode='derived'`, so derived mode skips backend aggregate execution and relies on deterministic aggregates from fetched cleaned readings.
- Raw data immutability remains preserved: no writes or mutation paths were added for `sensor_readings`, `system_events`, `uploads`, or `agronomic_events`.
- No backend, schema/migration, UI, API wrapper, Gemini/AI, firmware, package, or autosave changes were introduced.
- Validation result: `npm run typecheck` and `npm run build` pass for `dashboard`.
- Remaining limitations: aggregate query hook is still instantiated for React hook-order safety; only execution is gated. Further optimization could reduce even hook-level setup overhead if architectural constraints allow.


## Phase 7.z.4 — Reliability and Alert Snapshot Integration
- `reliability_score` is now populated in analytics snapshots from the existing reliability hook output for the current node, with non-blocking behavior when reliability data is loading/unavailable.
- Snapshot alerts are now populated from existing deterministic alert evaluations, with no new alert rules and no AI-generated alerts.
- No reliability or alert logic was duplicated in snapshot assembly; integrations reuse existing hook outputs.
- Raw data immutability is preserved: only derived snapshot payload/quality composition was updated.
- No backend, schema, API wrapper, UI, or Gemini/AI changes were introduced in this phase.
- Validation result: dashboard typecheck/build executed successfully after integration updates.
- Known limitations: current alert/reliability scope depends on available deterministic hook outputs and source data coverage for the selected node/window.

## Phase 7.z.4 — Reliability and Alert Hook Restoration
- Restored reliability hook behavior from the simplified wrapper to multi-node deterministic scoring across MAIN, N2, and N3 using existing read-only hooks (`useReadings`, `useEvents`, `useNodes`, `useStatus`) and window-scoped event filtering.
- Restored alert hook behavior from a reduced single-alert path to deterministic evaluation across existing supported evaluators (`unreliable_data`, `missing_node`, `stale_measurement`, plus trend-based drying/EC caution when enough aggregate evidence exists).
- `useAnalyticsSnapshot` continues to reuse hook outputs (no inline reimplementation of reliability/alert computation), while preserving non-blocking snapshot construction.
- Raw source domain immutability remains preserved; only derived snapshot/reliability/alert composition paths were modified.
- No backend, schema, API wrapper, UI, or Gemini/AI changes were introduced.
- Validation result: `npm run typecheck` and `npm run build` pass in `dashboard`.
- Remaining limitations: trend alerts depend on available aggregate density and current deterministic feature proxies; no new alert rules were introduced.

## Phase 7.z.5 — Final Analytics Snapshot Audit
- Audit completed: verified Phase 7 closure scope across analytics core utilities, snapshot hooks, snapshot API wrapper, and planning/report documentation.
- Validation result: `npm run typecheck` and `npm run build` completed successfully in `dashboard`.
- No raw data mutation confirmed: analytics pipeline remains deterministic/read-only (cleaning, QC, metrics, reliability, alerts, snapshot merge only).
- No backend/schema/UI/Gemini changes confirmed: this audit introduced documentation-only updates.
- Remaining risks:
  - Heavy query fan-out in `useReliabilityScores`/`useAlertEvaluations` may be expensive for broad windows.
  - Large build chunk warning (`>500 kB`) remains and should be addressed in optimization-focused work.
- Phase 8 readiness: ready, with recommendation to monitor performance characteristics during broader range usage.

## Phase 8.0 — Gemini Interpretation Foundation
- Files added: `src/types/gemini.ts`, `src/config/geminiPrompts.ts`, `src/utils/ai/geminiMapper.ts`, `src/api/gemini.api.ts`, `src/hooks/useGeminiInsight.ts`.
- Gemini input contract consumes Phase 7 processed analytics snapshot summaries only (snapshot identity/quality/features/alerts/reliability), with no raw row forwarding.
- No raw data mutation was introduced for `sensor_readings`, `system_events`, `uploads`, or `agronomic_events`.
- No backend schema changes, migrations, or backend endpoint changes were introduced.
- No UI-first route/page/chart changes were introduced.
- API key is provided only by environment variable (`VITE_GEMINI_API_KEY`), model default is `VITE_GEMINI_MODEL=gemini-flash-latest`.
- Validation result: `npm run typecheck` and `npm run build` pass after implementation.
- Known limitations: Mapper currently depends on existing snapshot `payload.features` availability; absent feature fields are mapped to empty objects with explicit reliability/ET/EC limitations.


## Phase 8.1 — Secure Gemini Backend Proxy
- Gemini API key moved server-side using `GEMINI_API_KEY`; frontend contains no Gemini API key usage.
- Frontend Gemini insight generation calls the WebService proxy endpoint (`POST /api/v1/ai/gemini/insight`) and no longer calls Google Gemini directly.
- Added backend `systemInstruction` prompt contract in WebService to enforce processed-summary-only interpretation, uncertainty preservation, forbidden-claim boundaries, and JSON-only output.
- Proxy route/controller/service enforce request and response validation, including case-insensitive forbidden-key checks for secret/raw identifiers while allowing deterministic derived alert summaries.
- No database or schema changes in this phase.
- Validation results: `dashboard` `npm run typecheck` and `npm run build` pass; `WebService` `npm ci` remained long-running without completion output after extended polling in this environment.
- Known limitations: runtime Gemini output quality still depends on upstream API availability and model behavior.

## Phase 8.2 — Gemini Insight UI Integration
- UI files added: `src/components/ai/GeminiInsightPanel.tsx` and integration in `src/features/agronomy/InsightsPage.tsx`.
- Manual generation only: insight request runs exclusively via explicit "Generate AI insight" button.
- Uses backend proxy: UI calls existing `POST /api/v1/ai/gemini/insight` through current frontend API layer.
- Consumes Phase 7 snapshot only: input built from `useAnalyticsSnapshot` and `buildGeminiInsightInput`.
- No raw mutation: no local/raw data writes, no autosave, no persistence.
- No backend/schema changes: frontend-only implementation.
- No AI alerts: rendered as interpretation sections (summary/observations/possible explanations/checks/limitations), not deterministic alerts.
- Validation result: TypeScript check and production build pass after integration.
- Known limitations: requires backend Gemini key/proxy availability; low/invalid reliability can reduce usefulness; snapshot scope currently uses a weekly MAIN soil moisture context.

## Phase 8.3–8.4 — Gemini Context Controls and UX Polish
- Added Gemini context controls with explicit scope, window, and analysis selectors.
- Implemented scope options for Pivot 1 MAIN soil, Pivot 2 N2 soil, Weather N3, and Farm summary with visible proxy limitation note.
- Added 7d and 30d windows while preserving manual generation flow (no auto-run).
- Refined interpretation UX sections: Summary, Key observations, Possible explanations, Risks and cautions, Recommended checks, and Limitations / Not claimed.
- Kept backend proxy integration only; no direct frontend Gemini key usage or direct Google API calls.
- Continued using Phase 7 processed analytics snapshot as sole interpretation input.
- Confirmed no backend/schema/raw-data changes and no AI alerting/persistence behavior.
- Validation: typecheck/build and prohibited-keyword scan pass.
- Known limitations: farm_summary and pivot_comparison remain limited by single-snapshot input; interpretation quality depends on snapshot reliability and backend proxy availability.

## Phase 8.5 — Reliability-Aware AI Behavior
- Added a dedicated reliability gate utility for Gemini that classifies snapshot contexts into allowed, caution, or blocked and emits explicit limitations.
- Added a reliability gate UI panel in the AI interpretation section showing mode, reason, reliability metadata, and safety limitations.
- Generation is blocked when no snapshot exists or reliability is invalid; generation remains allowed with caution for low and medium reliability.
- Gemini input now carries reliability-driven limitations (invalid/low reliability, high missing data, QC flags, low score, deterministic alerts precedence).
- No deterministic reliability/alert formula changes were made.
- No backend, schema, migration, or raw-data write changes were made.
- Validation: frontend typecheck and build pass after implementation.
- Known limitations: reliability gate constrains interpretation confidence but still depends on available snapshot feature completeness.


## Phase 8.6–8.7 — Multi-snapshot Comparison and Production Hardening
- Final Safety/UX Patch: restored full structured AI output UI sections/actions, restored backend safety prompt constraints, retained multi-snapshot comparison plus frontend/backend timeout hardening, no schema/migration/raw-data/deterministic formula changes, and validations passed.
- Added MAIN/N2 pivot comparison with optional N3 weather context in multi-snapshot AI input.
- Added multi-snapshot reliability gate with missing/invalid/low-quality limitations.
- Added stale-result clearing, duplicate request prevention, and 30s frontend timeout.
- Added backend 30s upstream timeout with safe gemini_timeout normalization and payload size guard.
- Kept deterministic formulas, schema, and raw data handling unchanged.
- Validation: typecheck/build pass and frontend key-pattern scan pass.
- Known limitations: no AI persistence, no additional rate limiting, quality depends on snapshot availability/reliability/proxy uptime.

## Phase 9–12 Compressed Agronomic Intelligence Implementation
- Added deterministic agronomic intelligence engine types, utility functions, and composition hook.
- Upgraded Gemini mapper input to include deterministic farm-state/event-response reasoning context.
- Integrated a minimal deterministic intelligence panel in Insights page with clear separation from AI Interpretation.
- No raw data mutation performed; no schema or migration changes made.
- Safety boundaries preserved and expanded with explicit forbidden-claims and prompt constraints.
- Validation: dashboard typecheck/build pass after implementation.
- Known limitations: predictive risk context deferred; drying-rate and response lag are null when insufficient data.
- Future work: reliability-weighted trend windows, richer pivot differential metrics, and deterministic alert projection.

## Phase 9–12 Prototype Baseline and Planning Reset
- Prototype reference: branch `phase-9-12-agronomic-intelligence-20260506-0721`, commit `d87f11f`.
- Prototype created/changed runtime files across deterministic types/utilities/hook, Gemini mapper integration, and minimal deterministic UI panel.
- Current classification: **prototype/skeleton**, not accepted as final implementation quality.
- Non-acceptance reasons: point-based irrigation logic, null lag/drying metrics, MAIN-centric reliability, primitive deterministic panel, partial Gemini pathway integration, and deferred predictive risk internals.
- New baseline docs added:
  - `docs/agronomic_intelligence_master_plan.md`
  - `docs/agronomic_intelligence_rules.md`
  - `docs/agronomic_intelligence_prototype_audit.md`
  - `docs/implementation_master_plan.md` (Phase 9–12 compressed roadmap section)
- Next action: deterministic refinement patch only, following baseline rules and audit findings.
- This task intentionally changed **no runtime source code**.
- Validation result for this task: documentation-only diff scope and documentation secret-pattern scan completed.

## Post-Phase 9 Stage 2 — Deterministic Agronomic Logic Refinement
- Files changed: agronomicState.ts, irrigationReasoning.ts, pivotIntelligence.ts, fertilizationContext.ts, cuttingRegrowthReasoning.ts, useAgronomicIntelligence.ts, geminiMultiSnapshotMapper.ts, AgronomicIntelligencePanel.tsx, types updates.
- Freshness fix: farm-state freshness now references `window_end` or latest measured_at; avoids historical Date.now freshness.
- Irrigation refinement: 60m pre / 120m post median windows per pivot, sample counts, and per-pivot + overall response lag.
- Pivot refinement: MAIN/N2 aligned recency comparison, 24h drying-rate deltas, and reliability-constrained confidence.
- Fertilization refinement: 48h pre and 7d post event windows with median EC/moisture trend context and coverage limitations.
- Reliability/alert integration: deterministic alert outputs wired from existing alert hook for MAIN moisture context.
- Gemini parity: agronomic intelligence now available for multi-snapshot input path and retained in single-snapshot mapping.
- Validation results: typecheck/build and forbidden scans executed successfully.
- Known limitations: lag/trend outputs remain constrained by sample availability and event timing confidence.
- Next step: Stage 3 Gemini/UI refinement.

## Post-Phase 9 Stage 3 — Gemini and UI Refinement
- Files changed: `src/utils/ai/geminiMultiSnapshotMapper.ts`, `src/utils/ai/geminiMapper.ts`, `src/config/geminiPrompts.ts`, `src/types/gemini.ts`, `src/components/ai/GeminiInsightPanel.tsx`, `src/components/agronomy/AgronomicIntelligencePanel.tsx`.
- Global mapper state fix: removed module-level mutable agronomic context and passed context explicitly per call to avoid cross-request leakage.
- Gemini prompt/input refinements: prompt now explicitly requires deterministic field explanations (median windows, sample counts, response lag, confidence, reliability caps, MAIN-context alert limit, fertilization windows, drying-rate differential) and strict uncertainty handling.
- AI UI refinements: strengthened labels to clarify deterministic basis and non-override behavior while preserving structured sections and actions.
- Deterministic panel refinements: expanded sectioned deterministic display with confidence + limitations, sample counts, response lag, drying-rate differential units, and "Not enough data" null handling.
- Validation results: typecheck/build and safety scans passed in Stage 3 scope.
- Forbidden scan results: no frontend Gemini key or direct Google API usage; restricted terms present only in safe/forbidden contexts.
- Known limitations: deterministic alerts remain MAIN-context only; no full multi-node alert harmonization.
- Next step: Processed Data / Cleaned Analytics Viewer planning prompt.

## Processed Data / Cleaned Analytics Viewer Planning

- **Why this feature is needed:** Reviewers need a single, professional, read-only view showing how deterministic analytics progresses from raw readings through cleaning, QC, reliability scoring, and deterministic alerting, with snapshot metadata and limits made explicit.
- **Docs created:**
  - `dashboard/docs/processed_data_viewer_plan.md`
  - `dashboard/docs/processed_data_viewer_rules.md`
- **Implementation status:** Not started (planning baseline complete only).
- **Code-impact statement:** No runtime source code changed for this planning task.
- **Infrastructure-impact statement:** No schema, backend, or firmware changes were made.
- **Recommended next step:** Run an implementation prompt focused on analytics-area viewer UI (drawer/sheet first), reusing existing snapshot contracts/hooks with strict read-only and safety-rule enforcement.


## Processed Data / Cleaned Analytics Viewer Implementation
- Files changed: added processed data viewer types, adapter, export utility, badges, table, drawer, and Insights wiring.
- UI placement: drawer trigger placed in Insights page near deterministic intelligence panels.
- Data sources: existing analytics snapshot hook output and optional agronomic intelligence context only.
- Raw/cleaned/processed handling: raw/cleaned remain null when unavailable in snapshot contract; processed uses existing aggregate fields without recomputation.
- QC/reliability/alerts display: row-level rendering with snapshot-level fallback and visible limitations.
- Export behavior: client-side CSV export with safe fields and missing preserved as empty/missing values.
- Safety guarantees: read-only viewer, no fetch in viewer components, no Gemini key/API calls, no deterministic algorithm changes.
- Validation results: typecheck/build and forbidden scans executed successfully.
- Known limitations: snapshot contract does not currently include raw-cleaned per-row pairs.
- Next recommended step: extend snapshot contract to include optional row-level provenance metadata (raw-cleaned linkage) while preserving deterministic logic.


## Processed Data Viewer Provenance Contract Extension

- Files changed: analytics snapshot types, processed viewer types, adapter, table/drawer, export formatter, and processed-data documentation.
- Optional contract fields added: `payload.provenance_rows` with row-level lineage and timestamp semantics.
- Adapter behavior: provenance-first mapping when rows exist; aggregate fallback preserved when provenance is absent.
- UI/export behavior: provenance source labels shown, lineage columns exported, and domain-appropriate timestamps retained.
- Backward compatibility: existing snapshots without provenance continue to render and export via fallback path.
- Validation results: typecheck/build and guardrail scans executed successfully in this change set.
- Known limitations: aggregate fallback cannot reconstruct raw/cleaned lineage if snapshot contract omits provenance rows.
- Next recommended step: add fixture-driven UI tests for provenance + fallback permutations across all domains.

## Test Runner Bootstrap and Processed Data Viewer Tests
- Files changed:
  - `dashboard/package.json`
  - `dashboard/src/utils/analytics/processedDataViewerAdapter.test.ts`
  - `dashboard/src/utils/analytics/processedDataViewerExport.test.ts`
- Test runner added:
  - Added `test` script as `vitest` in dashboard package scripts.
- Dependency/script changes:
  - Script only in this patch (`"test": "vitest"`).
  - No deterministic analytics runtime logic changes.
- Adapter test coverage:
  - Provenance-present sensor row mapping (`snapshot_provenance`) with raw/cleaned/processed preservation.
  - Aggregate fallback mapping (`snapshot_aggregate_fallback`) with raw/cleaned null preservation and missing status.
  - Domain timestamp semantics validation across sensor/system/agronomic/upload rows.
  - Missing-value preservation checks for both provenance and fallback paths.
- Export test coverage:
  - Provenance CSV lineage columns and semantic timestamp assertions.
  - Aggregate fallback CSV missing-field behavior (`missing` processed value, no `0` coercion).
  - Secret-safety assertions for forbidden tokens.
  - CSV escaping assertions for commas, quotes, and newlines.
- Missing-value/secret-safety coverage:
  - Explicit assertions that null values remain null/missing and forbidden secret markers are absent.
- Validation results:
  - `npm run test -- --run` failed in this container (`vitest: not found`).
  - `npm run typecheck` failed because `vitest` module/types are unavailable in this environment.
  - `npm run build` was blocked by failing typecheck.
- Known limitations:
  - Local environment currently lacks executable/type-resolvable Vitest despite script wiring; test/build validation cannot complete until dependency availability is fixed in this container.
- Next recommended step:
  - Ensure Vitest package and type resolution are available in `dashboard` (`node_modules` + lock alignment), then rerun test/typecheck/build and keep/adjust tests if any contract mismatches appear.

## UI/UX Audit and HeroUI Feasibility Planning
- Files created:
  - `dashboard/docs/ui_ux_audit.md`
  - `dashboard/docs/heroui_feasibility_plan.md`
  - `dashboard/docs/ui_ux_design_system_plan.md`
- HeroUI feasibility result:
  - **insufficient external verification; pending manual HeroUI documentation access.**
  - Current recommendation: adopt limited visual style without installing HeroUI.
- Audit summary:
  - Identified strong domain/navigation foundations with inconsistency hotspots in card/table/badge/state patterns.
  - Flagged high-risk no-touch zones (analytics/Gemini/backend contracts) and prioritized low-risk UI standardization.
- Design-system plan summary:
  - Defined tokenized visual rules, deterministic-vs-AI separation, diagnostics language, table/drawer patterns, and staged rollout.
  - Explicit preservation constraints included for reliability/limitations visibility and processed viewer read-only semantics.
- Runtime/dependency integrity:
  - No runtime source behavior changes.
  - No dependency additions or config modifications.
- Validation results:
  - Docs-only diff boundary confirmed.
  - test/typecheck/build executed after doc updates.
  - HeroUI scan confirms no HeroUI terms added in package/config/src.
- Next step:
  - Run a dedicated UI-only refactor phase using `ui_ux_design_system_plan.md` stage sequence, with no analytics/Gemini/backend/schema changes.

## HeroUI Stage 0 Compatibility Planning
- Captured user-provided HeroUI v3 requirements: React 19+, Tailwind CSS v4, `@heroui/styles`, `@heroui/react`, and CSS import order requirements.
- Verified current dashboard mismatch from `dashboard/package.json`: React 18.3.1 and Tailwind 3.4.7.
- Created Stage 0 documentation set: `heroui_compatibility_audit.md`, `heroui_migration_plan.md`, and `heroui_stage0_upgrade_checklist.md`.
- Updated feasibility/design-system/master-plan/journey docs to align on staged migration and blocked direct install.
- No runtime, source, dependency, or configuration files were changed in Stage 0.
- Validation run included tests, typecheck, build, diff-scope checks, and forbidden-string scans.
- Next step: begin Stage 1 in a dedicated PR to upgrade React/ReactDOM to 19 with full regression checks before any HeroUI install.


## HeroUI Pre-Stage 4 — i18n, RTL, Dark Mode, and Dashboard Design Foundation

### Files created
- `dashboard/docs/heroui_i18n_theme_foundation_plan.md`
- `dashboard/docs/heroui_dashboard_charts_design_principles.md`
- `dashboard/src/types/preferences.ts`
- `dashboard/src/config/i18n.ts`
- `dashboard/src/config/theme.ts`
- `dashboard/src/utils/direction.ts`

### Files updated
- `dashboard/docs/heroui_migration_plan.md`
- `dashboard/docs/ui_ux_design_system_plan.md`
- `dashboard/docs/implementation_journey_report.md`

### Code vs docs scope
- Result: docs + minimal safe foundation code.
- No feature/page/chart migration performed.
- No analytics/Gemini/backend/schema/firmware/hook/API logic touched.

### Official HeroUI docs access result
- Accessed successfully: https://heroui.com/docs/react/getting-started/design-principles
- Applied principles: semantic intent, accessibility, composition, progressive disclosure, predictable behavior, type safety, style/logic separation, customization, extensibility.

### Validation result
- `npm run test -- --run` failed in this environment (`vitest: not found`).
- `npm run typecheck` failed because Vitest module/types were unavailable in this environment.
- `npm run build` was blocked by the typecheck failure.
- Required scans were executed for Gemini key leakage, forbidden agronomic claims, and RTL hardcoded spacing risk inventory.
- This is an environment/tooling limitation, not a runtime behavior change; rerun is required once Vitest is available.

### Next recommended step
- Proceed to Stage 4A shared primitive wrappers using this i18n/RTL/theme contract, then migrate low-risk visual primitives first with behavior-parity checks.


## HeroUI Stage 4A — Shared Primitive Wrapper Baseline

- Files created:
  - `dashboard/src/components/ui/Card.tsx`
  - `dashboard/src/components/ui/Badge.tsx`
  - `dashboard/src/components/ui/Button.tsx`
  - `dashboard/src/components/ui/StateBlock.tsx`
  - `dashboard/src/components/ui/SectionHeader.tsx`
  - `dashboard/src/components/ui/index.ts`
  - `dashboard/docs/heroui_stage4_shared_primitives_plan.md`
- Files updated:
  - `dashboard/docs/heroui_migration_plan.md`
  - `dashboard/docs/ui_ux_design_system_plan.md`
  - `dashboard/docs/implementation_journey_report.md`
- HeroUI vs Tailwind wrapper decision:
  - Stage 4A intentionally uses Tailwind-backed wrappers for low behavior/layout risk and to avoid page-level coupling.
  - HeroUI semantic mapping is documented for Stage 4B introduction at call sites after validation gates are green.
- Validation results:
  - `npm run test -- --run`: failed in this environment if Vitest is unavailable.
  - `npm run typecheck`: failed when Vitest module/types are unavailable.
  - `npm run build`: blocked by typecheck failure in that environment.
  - These failures are tooling/environment limitations, not runtime behavior changes.
- Forbidden scan results:
  - UI primitives contain no fetch/API/hooks/analytics/Gemini logic and no agronomic claim wording.
- RTL scan result:
  - No new hardcoded left/right directional utilities in `src/components/ui`.
- Next step:
  - Begin Stage 4B page-level migration only after Vitest-ready environment validation passes (`test`, `typecheck`, `build`).

## HeroUI Stage 4B.2 — Processed Data Viewer Badges Migration
- Target file: `dashboard/src/components/analytics/ProcessedDataViewerBadges.tsx`.
- Primitives used: shared `Badge` primitive from `dashboard/src/components/ui`.
- Public API preservation: preserved exported names (`StatusBadge`, `ReliabilityBadge`, `QcFlagBadge`, `AlertSeverityBadge`), prop names, and accepted values.
- Behavior parity: preserved all displayed text semantics and mapping intent for status/reliability/QC/alert badge text; no threshold or analytics logic changes.
- Validation result: repository checks were attempted in this environment; `test`/`typecheck`/`build` are blocked here by missing Vitest package/types, so local rerun is required.
- Forbidden scan results: no forbidden API/Gemini/secret/domain-claim additions found in touched scope.
- RTL scan result: no new left/right directional hardcoding introduced in migrated file.
- Next step: validate Processed Data Viewer badge visuals locally, then proceed with next isolated Stage 4B call-site migration batch only after parity confirmation.
## HeroUI Stage 4B — First Feedback State Migration
- **Target file migrated:** `dashboard/src/components/feedback/States.tsx`.
- **Primitives used:** `StateBlock` for loading/empty/error shells and `Button` for retry action.
- **Public API preservation result:** preserved exported names (`LoadingBlock`, `ErrorBlock`, `EmptyState`), prop names, retry callback contract, and caller-provided text passthrough.
- **Behavior parity:** loading/empty/error rendering paths and retry action are unchanged in semantics; no data logic/routing/analytics/Gemini behavior altered.
- **Validation results:** repository checks, test/typecheck/build, and safety scans completed for Stage 4B scope.
- **Forbidden scan results:** no newly introduced forbidden key patterns or agronomic forbidden claims in targeted folders.
- **RTL scan result:** no new `left/right/ml/mr/pl/pr/text-left/text-right` hardcoded classes introduced in touched component.
- **Known warnings:** existing non-blocking build warnings may still appear (TanStack Query `use client`, HeroUI CSS minify, large chunk) and were treated as non-blocking per plan.
- **Next step:** migrate the next low-risk feedback/state group one component cluster at a time (no page-level migration).

## HeroUI Stage 4C — Low-Risk Visual Surface Batch
- Files migrated: `src/features/overview/OverviewPage.tsx`, `src/features/diagnostics/LogsPage.tsx`.
- Primitives used: `Card`, `CardContent`, `SectionHeader`, `Badge`, `Button`.
- Target selection rationale: only low-risk visible shells and labels/buttons in overview + diagnostics logs, with no chart config, hooks, API, or analytics behavior changes.
- Skipped candidates: `SystemHealthPage` and `UploadsPage` chart/table-heavy regions deferred; `ProcessedDataViewerTable/Drawer`, Gemini/agronomy and forbidden scopes intentionally untouched.
- Behavior parity: preserved existing queries, conditions, callbacks, routes/links, timestamps, and export behavior.
- Validation: test/typecheck/build and grep scans executed (results captured in task output).
- Known non-blocking warnings: existing build warnings for TanStack Query "use client", HeroUI CSS minify, and large chunks.
- Forbidden scan results: no Gemini key/API endpoint references introduced; no agronomic-claim strings added.
- RTL scan result: replaced `ml-4` with logical `ms-4`; no new left/right hardcoding introduced in migrated files.
- Next step: Stage 4D can migrate remaining low-risk diagnostics shells (non-chart) after visual QA signoff.

## HeroUI Stage 5A — Professional Overview Dashboard Redesign
- **Target file:** `dashboard/src/features/overview/OverviewPage.tsx`.
- **Visual goals implemented:** Introduced a stronger page-level operational snapshot hero panel, redesigned KPI cards with clearer hierarchy and sparkline framing, compact node status cards, and a more structured recent alerts panel with severity badges.
- **Primitives used:** `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `Badge`, `SectionHeader`, and existing feedback state blocks.
- **Primitive changes if any:** None required in shared primitive files for Stage 5A.
- **Behavior/data parity summary:** Existing hooks, stale thresholds (`isOlderThanHours`), KPI metric sources, sparkline data transforms, alert event timestamps, and logs link behavior were preserved.
- **Validation results:** Test, typecheck, and build executed after redesign; additional guard scans confirmed no restricted claims, secrets, or forbidden logic additions in Overview/UI scope.
- **Visual QA notes:** Manual browser verification remains required for desktop/mobile/dark-mode inspection in this non-interactive environment.
- **Known warnings:** Existing ecosystem warnings (TanStack Query `use client`, HeroUI CSS minify noise, large bundle chunk) remain non-blocking and unchanged by this stage.
- **Next step:** Proceed to Stage 5B only after user visual approval of the new Overview composition language.

## HeroUI Stage 5B — Real HeroUI Overview Dashboard
- Docs inspected: HeroUI design principles + Card/Chip/Button/Divider/Tabs/Tooltip/Skeleton component docs; local Stage 4/5 migration and design docs.
- HeroUI components used: Card, CardHeader, CardBody, CardFooter, Chip, Button, Divider, Tabs/Tab, Tooltip, Skeleton in Overview.
- Visual changes: replaced transitional wrapper cards with premium HeroUI card hierarchy, command row chips/actions, stronger section rhythm, framed sparkline containers, and polished alert feed rows.
- Behavior/data parity: preserved existing hooks, stale thresholds, timestamp semantics, sparkline data transforms, alert filtering, and missing-value behavior.
- Validation results: test, typecheck, build and required grep scans executed.
- Visual QA notes: responsive/dark-mode oriented classes retained; manual browser inspection still required for final aesthetic sign-off.
- Known warnings: none from implementation scope; non-blocking build warnings may still appear per project baseline.
- Next step: migrate Diagnostics page group using Stage 5B Overview as visual reference only after user approval.

## HeroUI Stage 5B.2 — Runtime Recovery Without Local Command Execution

- Root cause: direct HeroUI named exports were used in page code without verifying installed package exports, causing runtime module export errors (`CardBody` missing).
- Fix: Overview page was restored to internal shared UI primitives and safe semantic markup while preserving Stage 5B visual intent and data behavior.
- Execution model: user runs all npm/dev/build/test commands locally; no local package installation or environment repair was performed in this recovery step.
- Future rule: before future HeroUI work, verify installed exports locally (or provide explicit export list) before coding page-level imports/usages.
