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
