# HeroUI Migration Plan

## Stage 0 — Compatibility audit and planning (current)
- **Allowed files:** `dashboard/docs/**` only
- **Forbidden files:** all runtime/config/dependency/source files (`package*.json`, `src/**`, `tailwind.config.*`, `postcss.config.*`, Vite/TS configs)
- **Validation commands:**
  - `git diff --name-only`
  - `cd dashboard && npm run test -- --run && npm run typecheck && npm run build`
- **Stop conditions:** any runtime file edit required, dependency install required, failed validation, missing required docs
- **Rollback notes:** discard doc edits if scope expands unexpectedly (`git restore ...`)
- **Acceptance criteria:** audit + staged plan docs complete; no runtime/dependency change committed

## Stage 1 — React 19 upgrade
- **Allowed files:** `dashboard/package.json`, `dashboard/package-lock.json`, React entry/provider wiring files, compatibility notes docs
- **Forbidden files:** HeroUI packages/config/imports, feature-level component migration
- **Validation commands:**
  - `cd dashboard && npm run test -- --run`
  - `cd dashboard && npm run typecheck`
  - `cd dashboard && npm run build`
- **Stop conditions:** peer dependency conflicts unresolved; router/query/recharts regressions; failing tests/typecheck/build
- **Rollback notes:** revert dependency bump and lockfile as single atomic commit rollback
- **Acceptance criteria:** React/ReactDOM on 19+, core routing/query/chart workflows stable, no HeroUI artifacts present

## Stage 2 — Tailwind CSS v4 upgrade
- **Allowed files:** Tailwind/PostCSS/global CSS integration files, related docs
- **Forbidden files:** HeroUI components migration, analytics/business-logic files
- **Validation commands:**
  - `cd dashboard && npm run test -- --run`
  - `cd dashboard && npm run typecheck`
  - `cd dashboard && npm run build`
- **Stop conditions:** style pipeline breakage, token loss, build failure
- **Rollback notes:** restore Tailwind/PostCSS/global-style files and lockfile to pre-stage snapshot
- **Acceptance criteria:** Tailwind v4 operational, semantic tokens preserved, no HeroUI packages/components yet

## Stage 3 — HeroUI infrastructure
- **Allowed files:** dependency manifests/lockfile, global CSS import entry, top-level provider/theme wiring if required
- **Forbidden files:** page-level component replacement, analytics/Gemini behavior changes
- **Validation commands:**
  - `cd dashboard && npm run test -- --run`
  - `cd dashboard && npm run typecheck`
  - `cd dashboard && npm run build`
  - `rg -n "@heroui/styles|@heroui/react" dashboard/src dashboard/package.json`
- **Stop conditions:** CSS order issues, provider boot/runtime errors, build/test failures
- **Rollback notes:** remove HeroUI deps/imports/provider in one rollback commit
- **Acceptance criteria:** HeroUI packages installed, CSS order correct (`tailwindcss` then `@heroui/styles`), app boots without component migration


## Pre-Stage 4 — i18n/RTL/theme and dashboard design foundations
Before shared primitive/page migration, the project adds i18n/RTL/dark-mode readiness and HeroUI dashboard/chart design-principle alignment.
- Scope: foundation docs plus optional minimal config/types/utils only.
- Non-goals: no page redesign, no chart migration, no analytics/Gemini/business-logic changes.

## Stage 4 — Shared primitive migration
- **Allowed files:** shared low-risk UI primitives and their direct call sites
- **Forbidden files:** analytics engines, Gemini mapping/gating logic, API contracts
- **Validation commands:**
  - `cd dashboard && npm run test -- --run`
  - `cd dashboard && npm run typecheck`
  - `cd dashboard && npm run build`
- **Stop conditions:** deterministic-vs-AI visual boundary regression, state-message regressions, accessibility regression
- **Rollback notes:** revert primitive migration PR wholesale; keep HeroUI infra intact
- **Acceptance criteria:** cards/buttons/badges/empty/loading/error states migrated with behavior parity

## Stage 5 — Page-by-page visual migration
- **Allowed files:** one page/component group per PR plus shared styling helpers needed by that page
- **Forbidden files:** unrelated page groups, backend/webservice, non-UI business logic changes
- **Validation commands:**
  - `cd dashboard && npm run test -- --run`
  - `cd dashboard && npm run typecheck`
  - `cd dashboard && npm run build`
- **Stop conditions:** behavior drift, chart/table/drawer usability regressions, increased ambiguity in reliability messaging
- **Rollback notes:** each PR should be independently reversible
- **Acceptance criteria:** migration order respected: overview -> diagnostics -> processed viewer -> agronomy insights; behavior unchanged

## Stage 6 — Hardening and release readiness
- **Allowed files:** targeted polish/fixes for accessibility, responsive behavior, and performance optimizations
- **Forbidden files:** unplanned feature additions or scope expansion
- **Validation commands:**
  - `cd dashboard && npm run test -- --run`
  - `cd dashboard && npm run typecheck`
  - `cd dashboard && npm run build`
  - visual QA checklist execution
- **Stop conditions:** unresolved accessibility blockers, mobile-critical flow regressions, unacceptable bundle/perf delta
- **Rollback notes:** maintain release candidate tag and rollback commit references
- **Acceptance criteria:** visual QA, mobile QA, accessibility review, and build-size/performance review completed with documented rollback strategy


## Stage 4A update (shared primitives baseline)
- Shared UI primitive wrappers were created under `dashboard/src/components/ui/` only.
- No feature/page migration occurred in Stage 4A.
- Stage 4B page migration may start only after `npm run test -- --run`, `npm run typecheck`, and `npm run build` pass in a Vitest-ready environment.

## Stage 4B kickoff note
- Stage 4B started with feedback state components only.
- No page migration included in this step.
- Next candidates should continue one component group per PR with strict behavior parity validation.
