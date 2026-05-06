# Agronomic Intelligence Rules (Mandatory for Future Patches)

## Purpose
Hard constraints for all future Codex tasks touching agronomic intelligence.

## Data-domain rules
- Keep sensor/system/upload/agronomic domains separate.
- Do not merge raw domains into one pseudo-table.
- Use weather as shared context, not pivot-owned readings.

## Time semantics rules
- Sensor logic uses `measured_at`.
- System reliability logic uses `event_time`.
- Upload logic uses upload timestamps.
- Agronomic reasoning uses `started_at`/`ended_at`.
- Never use `Date.now()` for historical analytical freshness when window end is available.

## Deterministic-before-AI rules
- Deterministic summaries are source-of-truth.
- Gemini is explanatory only and cannot generate deterministic facts.
- Gemini must receive deterministic summaries only.

## Reliability and confidence rules
- Every deterministic section must return confidence score + level + limitations.
- Reliability weighting must include both pivots where relevant.
- Low reliability must be visible and never suppressed.

## Missing data rules
- Never convert missing values to zero.
- Keep null/unknown explicit in payload and UI.
- Do not throw when optional domains are absent.

## Agronomic claim boundaries
- Never infer disease.
- Never infer yield from sensors alone.
- Never compute calibrated water stress without calibration metadata.
- Never infer nutrient sufficiency from fertilization or EC.

## Irrigation reasoning rules
- Never use single point before/after irrigation when pre/post window is computable.
- Use robust window stats (median preferred) and report window coverage.
- Compute response lag when timestamps permit.
- Downgrade causal confidence when event timing is estimated/unknown.

## Cutting/regrowth reasoning rules
- Use post-cut window trend logic, not one-point comparisons.
- Include heat context as weather support signal only.
- Keep labels cautious and limitation-bound.

## Fertilization reasoning rules
- Use event-window EC/moisture context around fertilization events.
- Do not use broad first/last EC across whole dataset as primary inference.
- No nutrient diagnosis statements.

## EC/salinity boundary rules
- Never convert raw EC to ECe.
- EC can be relative trend context only.
- No salinity class UI claims.

## Gemini input/output rules
- Input: deterministic summaries, confidence, limitations, forbidden_claims.
- No raw rows, event IDs, secrets, keys.
- Output must preserve uncertainty and forbidden-claim boundaries.

## UI display rules
- Deterministic results and AI Interpretation must be visibly separated.
- Show confidence and limitations for each section.
- Missing/low-confidence data must stay visible.

## Forbidden implementation shortcuts
- Hardcoded conclusions.
- Silent fallback to zeros.
- Single-node reliability proxy for whole farm.
- Skipping validation scans.

## Validation requirements
- `git diff --name-only` scope check.
- `npm run typecheck` and `npm run build` for runtime patches.
- Scan docs/code for exposed keys.
- Forbidden-term scan for unsafe agronomic claims.

## Required prompt boilerplate for future patches
Include this block in future prompts:
1. Deterministic-first; Gemini explanatory only.
2. Preserve domain timestamp semantics.
3. No missing-to-zero conversion.
4. No EC→ECe, no nutrient/disease/yield diagnosis.
5. No calibrated stress without calibration metadata.
6. Explicit confidence + limitations in all outputs.
7. Separate deterministic UI from AI narrative.
8. Validate with typecheck/build and forbidden scans.
