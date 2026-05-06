# Agronomic Intelligence Prototype Audit (Commit d87f11f)

## Audit summary
The prototype establishes correct direction (typed deterministic layer + Gemini boundary intent) but is not production-acceptable without algorithmic and contract refinements.

## What was implemented
- New agronomic intelligence types.
- Initial deterministic utility functions.
- Composition hook.
- Gemini mapper input extension.
- Minimal deterministic UI panel and Insights integration.

## What is acceptable as foundation
- Type scaffolding and separation intent.
- Dedicated hook boundary (`useAgronomicIntelligence`).
- Prompt-level forbidden-claim strengthening.
- Separate deterministic panel placement before AI interpretation.

## What is not acceptable as final
- Primitive UI and shallow logic implementations.
- Missing/placeholder derived metrics.
- Insufficient reliability weighting and multi-snapshot Gemini parity.

## File-by-file assessment
- `src/types/agronomicIntelligence.ts`: **Keep** (needs field refinements and stricter contracts).
- `src/utils/analytics/agronomicState.ts`: **Revise** (freshness semantics uses now-time pattern risk).
- `src/utils/analytics/irrigationReasoning.ts`: **Revise** (single-point pre/post; lag null).
- `src/utils/analytics/cuttingRegrowthReasoning.ts`: **Revise** (trend depth limited).
- `src/utils/analytics/fertilizationContext.ts`: **Revise** (broad first/last EC logic).
- `src/utils/analytics/pivotIntelligence.ts`: **Revise** (drying rate null; limited divergence logic).
- `src/hooks/useAgronomicIntelligence.ts`: **Revise** (deterministic alerts empty; MAIN-centric reliability).
- `src/components/agronomy/AgronomicIntelligencePanel.tsx`: **Replace** (too primitive for final UX).
- `src/utils/ai/geminiMapper.ts`: **Revise** (single-path integration only; payload typing shortcuts).
- `src/components/ai/GeminiInsightPanel.tsx`: **Revise** (multi-snapshot path omits agronomic intelligence).
- `src/features/agronomy/InsightsPage.tsx`: **Keep/Revise** (integration location acceptable; content depth requires improvement).

## Logic weaknesses
- `irrigationReasoning` uses single point instead of median pre/post window.
- `response_lag_minutes` always null.
- `drying_rate_difference_percent_per_day` always null.
- `deterministic_alerts` always empty.
- `fertilizationContext` uses broad first/last EC instead of event-window EC.
- Trend-window logic is shallow.
- `predictive_risk_context` deferred.

## UI weaknesses
- `AgronomicIntelligencePanel` too primitive.
- Limited section detail and evidence coverage.
- Insufficient explicit missingness visualization per subsection.

## Gemini integration weaknesses
- Multi-snapshot path does not receive `agronomicIntelligence`.
- Partial consistency gap between deterministic single-snapshot and multi-snapshot contexts.

## Reliability/confidence weaknesses
- Reliability uses mainly MAIN and is insufficiently pivot-weighted.
- Confidence generation not consistently tied to evidence coverage.

## Data/time semantics risks
- Farm freshness uses `Date.now()`, which can mislead on historical windows.
- Event-window alignment and timing confidence propagation need stricter contract enforcement.

## Required fixes before acceptance
1. Replace point-based irrigation logic with windowed robust statistics.
2. Implement response lag computation.
3. Implement drying-rate differential logic.
4. Integrate deterministic alerts from deterministic pipeline.
5. Replace global EC edge comparison with event-window fertilization context.
6. Rework freshness semantics to reference analytic window.
7. Pass agronomic intelligence to multi-snapshot Gemini pathway.
8. Upgrade reliability weighting across pivots.
9. Replace primitive deterministic panel with full contract-driven sections.

## Keep/Revise/Replace/Defer decision table
- Keep: type scaffold, hook boundary, prompt guardrails.
- Revise: all deterministic calculators and Gemini mapper/panel wiring.
- Replace: deterministic panel UI rendering strategy.
- Defer: predictive risk model internals (remain explicit deferred status).

## Recommended next patch scope
Deterministic refinement patch only:
- agronomicState, irrigationReasoning, fertilizationContext, pivotIntelligence, useAgronomicIntelligence
- plus targeted Gemini multi-snapshot parity and deterministic UI section upgrade.

## Do-not-change list
- No firmware changes.
- No raw data mutations.
- No schema/migration edits.
- No weakening of Gemini safety boundaries.
- No frontend Gemini key usage.
