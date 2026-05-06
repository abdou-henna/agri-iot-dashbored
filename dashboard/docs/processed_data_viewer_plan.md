# Processed Data / Cleaned Analytics Viewer Plan

## 1. Purpose
Define a reviewer-facing, read-only viewer that makes deterministic post-ingestion processing visible: raw readings, cleaned values, QC outcomes, reliability scoring, deterministic alerts, snapshot metadata, and explicit analytical limitations.

## 2. Why this viewer is needed
- Current analytics are implemented, but reviewer transparency is fragmented across hooks/contracts.
- Demo and audit stakeholders need a single workflow to verify how a value moved from raw input through cleaning and QC into processed analytics.
- The viewer prevents misinterpretation that Gemini text equals deterministic processing output.

## 3. Current available deterministic data sources
Primary deterministic sources already exist and must be reused:
- Optional `snapshot.payload.provenance_rows` is the preferred viewer source when available; aggregate snapshot rows remain a supported fallback for backward compatibility.
- Analytics snapshot contracts and docs in `dashboard/docs/analytics-snapshot-contract.md`.
- Cleaning, QC, metrics, reliability, and alerts logic in `dashboard/src/utils/analytics/*`.
- Snapshot retrieval hooks:
  - `useAnalyticsSnapshot`
  - `usePersistentAnalyticsSnapshot`
  - `useIncrementalAnalyticsSnapshot`
- Analytics domain types in `dashboard/src/types/analytics.ts`.

## 4. Data-domain boundaries
- Keep sensor, system, agronomic, and upload domains separate in display grouping and filters.
- Never merge domain timelines into one synthetic “single truth” row.
- Cross-domain correlation is allowed only as explicit, labeled contextual references.

## 5. Viewer placement recommendation
- Launch from Insights/Analytics context first.
- Initial placement: **Drawer trigger** from analytics summary card or analytics snapshot section.
- No new top-level route at first release unless navigation pain is proven.

## 6. UI pattern recommendation
- Primary pattern: right-side Drawer (desktop) with tabbed sections.
- Optional secondary: full-screen modal on small screens.
- Read-only presentation only; no inline edit controls.

## 7. Data model displayed by the viewer
Per-record display contract (logical row model):
- Record identity: sensor/source identifiers + deterministic snapshot reference.
- Raw value (immutable origin field).
- Cleaned value (derived value, may be null).
- Processing status (e.g., accepted, downgraded, excluded, missing).
- QC flags array with reason codes and severity.
- Reliability score (numeric + band + contributing factors).
- Deterministic alerts linked to rule IDs/severity.
- Timestamps: measured/observed time, processed/snapshot time, upload/received time (explicitly labeled).

## 8. Raw vs cleaned vs processed terminology
- **Raw:** direct stored measurement payload value; immutable in viewer context.
- **Cleaned:** deterministic transformed value derived from raw under cleaning rules.
- **Processed:** deterministic post-cleaning analytical state (QC, reliability, alert eligibility, summary metrics).
- Gemini interpretation is not processed data; it is an interpretation layer.

## 9. QC flags display contract
- Always show QC outcomes for each displayed record.
- Show flag code, severity, and user-readable reason.
- QC flags must explain why values are trusted, downgraded, or excluded.
- QC failures are never hidden by default sorting/filtering.

## 10. Reliability display contract
- Show reliability score as confidence indicator with banding (e.g., high/medium/low).
- Show top contributing factors.
- Reliability explains confidence, not truth.
- Reliability limitations must be visible near the score.

## 11. Deterministic alerts display contract
- Render deterministic alerts from rule engine output with rule identifier, severity, and trigger context.
- Alerts must be visibly separated from Gemini interpretation output.
- Allow filtering by alert severity/rule without mutating underlying analytics data.

## 12. Analytics snapshot metadata display contract
- Show snapshot ID/version, generation timestamp, source range/window, and pipeline stage indicators.
- Explicit timestamp semantics:
  - upload timestamps are transfer-time metadata,
  - not sensor analysis timestamps.
- Include “last updated from snapshot” label for reviewer traceability.

## 13. Filtering and search contract
- Filters: domain, node/source, metric, status, QC severity/code, reliability band, alert severity, time range.
- Search: deterministic IDs/codes only (record ID, snapshot ID, alert rule ID).
- Missing values remain missing in filter results; they are not transformed to zero or suppressed.

## 14. Export contract
- Export is read-only and reporting-safe.
- Include safe derived/reporting fields only (no secrets, no credentials, no sensitive raw payload secrets).
- Export payload must preserve field lineage labels (`raw_value`, `cleaned_value`, `processing_status`, `qc_flags`, `reliability_score`).

## 15. Modal vs drawer vs full-page decision
Decision: **Drawer-first**.
- Rationale: preserves reviewer context in analytics page while enabling deep inspection.
- Modal fallback for mobile/full-screen constraints.
- Full-page route deferred unless reviewer workflows prove drawer insufficient.

## 16. Mobile behavior
- Drawer becomes near-full-screen sheet.
- Sections collapse into accordion blocks.
- Core table becomes stacked key/value cards preserving raw-cleaned-processed lineage order.

## 17. Empty/loading/error states
- Loading: skeleton rows + “building deterministic view…” label.
- Empty: “No processed records in selected filters/time range.”
- Error: actionable retry with non-destructive fallback to latest successful snapshot summary.

## 18. Implementation file plan
Planned implementation-phase files (future, not this task):
- Analytics feature UI container under existing analytics/insights feature area.
- Viewer presentation components (drawer/sheet, tables, badges).
- Selector/adaptor layer for snapshot-to-view rows.
- Export formatter module for safe report fields.

## 19. Files that may be edited in implementation
Only in implementation phase (future prompt):
- analytics/insights feature UI files
- analytics viewer components
- analytics snapshot presentation adapters/selectors
- docs that track implementation status

## 20. Files that must not be edited
- Deterministic algorithm sources (`cleaning.ts`, `qc.ts`, `metrics.ts`, `reliability.ts`, `alerts.ts`) unless a separate algorithm-change plan is approved.
- Backend, schema/migrations, firmware, and Gemini prompt/policy files for this feature scope.

## 21. Acceptance criteria
- Viewer is accessible from Insights/Analytics without adding a major new top-level route.
- Viewer shows raw, cleaned, processing status, QC, reliability, deterministic alerts, and snapshot metadata in one audit flow.
- Raw readings remain immutable.
- Cleaned values are displayed as derived values only.
- Missing values remain missing.
- Reliability is clearly labeled as confidence, not truth.
- Deterministic alerts are clearly separate from Gemini interpretation.
- Upload timestamps are clearly separated from analysis timestamps.
- Viewer remains read-only with safe export.

## 22. Implementation order
1. Build snapshot-to-view data contract adapter.
2. Build drawer shell + metadata header.
3. Add record table/cards with raw-cleaned-processed columns.
4. Add QC/reliability/alerts panels.
5. Add filtering/search and empty/loading/error states.
6. Add safe export.
7. QA against contracts and safety rules.

## 23. Known limitations
- Viewer depends on existing snapshot completeness and may reflect gaps from source ingestion windows.
- It does not introduce new analytics calculations or infer unavailable agronomic properties.
- It is transparency tooling, not a replacement for diagnostics pages or Gemini explanation UX.
