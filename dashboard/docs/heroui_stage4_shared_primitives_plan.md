# HeroUI Stage 4 Shared Primitives Plan

## Purpose
Create a shared primitive wrapper baseline that standardizes presentation and prepares HeroUI-aligned semantics without changing business behavior.

## Why wrappers before page migration
- Reduces migration blast radius by stabilizing reusable UI contracts first.
- Allows visual consistency work while preserving deterministic/AI boundaries and existing workflows.

## Primitive inventory
- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`
- `Badge`
- `Button`
- `StateBlock`
- `SectionHeader`

## HeroUI usage decision per primitive
- Stage 4A decision: Tailwind wrappers only for low risk and predictable parity.
- Stage 4B mapping target:
  - Card family -> HeroUI Card composition
  - Badge -> HeroUI Chip semantics
  - Button -> HeroUI Button semantics
  - StateBlock -> HeroUI Alert-like composition
  - SectionHeader -> layout wrapper with optional HeroUI slots

## RTL/i18n rules
- Wrappers must remain direction-safe and avoid hardcoded left/right utility patterns.
- Structure must be localization-ready: title/description/meta/action as content slots, not fixed copy.
- Arabic/English RTL/LTR readiness must be preserved.

## Dark-mode rules
- Use semantic surface, border, and text contrast classes with dark-mode counterparts.
- Dark mode readiness is mandatory in Stage 4A and preserved for Stage 4B.

## Dashboard/chart implications
- Wrappers are presentational only; chart data contracts and behavior remain unchanged.
- Missing/null chart data must remain visible.
- Upload transfer time must not be represented as chart measurement time.

## Allowed future migration order
1. Shared primitives adoption in low-risk call sites
2. Overview visual migration
3. Diagnostics visual migration
4. Processed Data Viewer visual migration
5. Agronomy/AI panel visual harmonization

## Forbidden files for primitive stage
- Feature/page modules and behavior logic layers remain untouched during Stage 4A.
- No edits to analytics, Gemini, hooks, API, router, or infra configuration files for this stage.

## Accessibility rules
- Preserve semantic HTML and heading hierarchy.
- Preserve native button disabled semantics.
- Do not encode severity/reliability with color only; text labels remain required.

## Severity/reliability visual mapping
- Use explicit textual state labels with optional tone variants.
- Visual tone supports meaning; text carries the primary semantic signal.

## Deterministic vs AI preservation rules
- Wrappers are UI-only and must not contain deterministic analytics logic or AI interpretation logic.
- No analytics/Gemini/business logic in wrappers.

## Processed Data Viewer preservation rules
- Read-only semantics remain unchanged.
- Deterministic processed outputs remain distinct from AI interpretation.
- Missing and QC-limited values remain explicitly visible.

## Acceptance criteria for Stage 4B
- Stage 4A wrappers exist and are export-stable.
- No feature components migrated in Stage 4A.
- Page migration starts only after tests/typecheck/build are green in a Vitest-ready environment.
- Arabic/English RTL/LTR readiness preserved.
- Dark mode readiness preserved.

## Rollback strategy
- Revert the Stage 4A wrapper commit atomically if any regression appears.
- Keep Stage 4A isolated from page migration so rollback does not affect feature logic.
