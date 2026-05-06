# Agronomic Intelligence Master Plan (Phase 9–12 Compressed)

## Purpose
Define the production-quality baseline for deterministic agronomic intelligence beneath Gemini, without changing data-domain contracts, QC/reliability formulas, or safety boundaries.

## Current prototype status
Prototype exists at commit `d87f11f` on branch `phase-9-12-agronomic-intelligence-20260506-0721`.
It introduces initial types, utilities, hook composition, Gemini payload mapping, and a minimal UI panel.

## Why current implementation is not final
- Uses simplified point-based and first/last trend logic.
- Leaves required fields null (`response_lag_minutes`, `drying_rate_difference_percent_per_day`) in common cases.
- Uses `Date.now()` in freshness logic where analytic window end should be reference.
- Deterministic alerts are not integrated (`[]`).
- Multi-snapshot Gemini path does not carry deterministic agronomic intelligence object.

## Non-negotiable architecture rules
- Deterministic analytics first; Gemini explanation second.
- No raw-row mutation; no cross-domain raw merges.
- Preserve domain timestamps: measured_at/event_time/upload timestamps/started_at-ended_at.
- No schema/migration change for this roadmap unless separately approved.
- Keep Phase 7 cleaning/QC/reliability formulas intact.

## Phase 9–12 compressed roadmap
### Stage 1 — Planning baseline
Deliver planning/rules/audit docs and freeze architecture constraints before additional runtime patching.

### Stage 2 — Deterministic logic refinement
Refine contracts and algorithms for windowed irrigation response, pivot-weighted reliability, event-window fertilization context, freshness semantics, and explicit limitation propagation.

### Stage 3 — Gemini and UI refinement
Wire refined deterministic output into single and multi-snapshot Gemini pathways; upgrade deterministic UI sections for confidence, limitations, and missingness visibility.

## Deterministic Agronomic Intelligence Engine contract
Input domains: cleaned sensor summaries, agronomic events, reliability summaries, deterministic alerts, analytics snapshot metadata.
Output must include:
- typed fields
- confidence score + level per section
- limitations per section
- explicit deferred states where unavailable
No section may throw due to optional domain absence.

## Farm Digital Twin contract
Farm state must summarize:
- data freshness relative to analysis window context
- season status (active/unknown)
- last irrigation/cutting/fertilization context
- pivot comparison pointer
- overall reliability/confidence and limitations

## Irrigation Reasoning contract
Must compute pre/post moisture using configurable windows (median/robust stats), not single nearest points when window data exists.
Must compute response lag when derivable.
Must downgrade causal confidence when event timing is estimated/unknown.
Must not make calibrated water-stress claims without calibration metadata.

## Cutting/Regrowth Reasoning contract
Must compute days-since-cutting and post-cut trend windows.
Must include weather heat context as shared environmental context.
Must output cautious regrowth label + confidence + limitations.

## Fertilization Context contract
Must use event-window EC/moisture context (before/after each fertilization window), not broad dataset endpoints.
Must never claim nutrient sufficiency or diagnosis.

## Pivot Intelligence contract
Must compare pivots on aligned/latest windows.
Must compute moisture divergence and drying-rate differential where data supports it.
EC divergence must remain relative trend only (not ECe/salinity class).
Confidence must be reliability-weighted across relevant pivots.

## Predictive Risk contract
Status remains deferred until deterministic model spec exists.
Output must explicitly mark deferred and carry limitations.

## Gemini integration boundary
Gemini input must contain deterministic summaries only (no raw rows, IDs, secrets).
Gemini must preserve deterministic confidence and limitations.
Gemini cannot override deterministic alerts or convert relative indicators into diagnoses.

## UI integration boundary
Deterministic panel is authoritative and separate from AI Interpretation.
UI must show low confidence/missingness explicitly.
UI must not hide limitations and must avoid prescriptive claims.

## Required refinement backlog
1. Replace `Date.now()` freshness with analysis-window based semantics.
2. Add irrigation pre/post window median logic + lag computation.
3. Add drying-rate differential computation.
4. Integrate deterministic alerts from existing deterministic pipeline.
5. Replace broad fertilization EC trend with event-window calculations.
6. Improve reliability weighting across pivots.
7. Pass agronomic intelligence in multi-snapshot Gemini path.
8. Expand deterministic panel structure and mobile readability.

## Acceptance criteria
- Deterministic outputs satisfy all contracts above.
- No forbidden claims appear in deterministic or Gemini outputs.
- Missing data remains explicit (never coerced to zero).
- Typecheck/build pass.
- Prohibited key scans pass.
- Diff scope limited to approved runtime files for refinement stage.

## Explicit forbidden claims
- Disease diagnosis
- Nutrient sufficiency diagnosis
- pH/NPK inferences from current sensors
- Raw EC to ECe conversion
- Yield prediction from sensors alone
- ET computation as factual output in current phase
- Prescriptive irrigation amount as fact

## Files created by prototype
- `src/types/agronomicIntelligence.ts`
- `src/utils/analytics/agronomicState.ts`
- `src/utils/analytics/irrigationReasoning.ts`
- `src/utils/analytics/cuttingRegrowthReasoning.ts`
- `src/utils/analytics/fertilizationContext.ts`
- `src/utils/analytics/pivotIntelligence.ts`
- `src/hooks/useAgronomicIntelligence.ts`
- `src/components/agronomy/AgronomicIntelligencePanel.tsx`

## Files needing refinement
- `src/utils/analytics/agronomicState.ts`
- `src/utils/analytics/irrigationReasoning.ts`
- `src/utils/analytics/fertilizationContext.ts`
- `src/utils/analytics/pivotIntelligence.ts`
- `src/hooks/useAgronomicIntelligence.ts`
- `src/utils/ai/geminiMapper.ts`
- `src/components/ai/GeminiInsightPanel.tsx`
- `src/components/agronomy/AgronomicIntelligencePanel.tsx`

## Files must not be touched
- Firmware repositories/files
- Raw source data tables
- Phase 7 cleaning/QC/reliability formulas
- Gemini backend safety boundaries (except stricter additions)

## Final implementation order
1. Confirm baseline docs and constraints.
2. Refine deterministic utilities + hook composition.
3. Validate deterministic outputs and confidence propagation.
4. Upgrade Gemini mapper paths (single + multi snapshot).
5. Refine deterministic UI and AI separation.
6. Run validation scans and finalize acceptance review.
