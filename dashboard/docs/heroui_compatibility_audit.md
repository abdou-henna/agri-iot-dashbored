# HeroUI Compatibility Audit

## Purpose
Document whether HeroUI v3 can be introduced safely into the current dashboard stack without runtime risk, and define migration constraints before any dependency or source-code change.

## User-provided HeroUI requirements
- HeroUI target: v3
- Required runtime baseline: React 19+
- Required styling baseline: Tailwind CSS v4
- Required packages for install stage: `@heroui/styles` and `@heroui/react`
- Required CSS import order: `@import "tailwindcss";` then `@import "@heroui/styles";`
- Component imports should come from `@heroui/react`

## Current project dependency snapshot (from package.json)
- `react`: `^18.3.1`
- `react-dom`: `^18.3.1`
- `tailwindcss`: `^3.4.7`
- `postcss`: `^8.4.40`
- `autoprefixer`: `^10.4.19`
- `vite`: `^5.4.0`
- `@vitejs/plugin-react`: `^4.3.1`
- `react-router-dom`: `^6.26.0`
- `@tanstack/react-query`: `^5.51.23`
- `recharts`: `^2.12.7`

## React compatibility gap
Current React runtime is 18.3.1, while user-provided HeroUI v3 requirement is React 19+.

**Gap:** major-version mismatch blocks safe direct installation.

## Tailwind compatibility gap
Current Tailwind runtime is 3.4.7, while user-provided HeroUI v3 requirement is Tailwind CSS v4.

**Gap:** major-version mismatch blocks safe direct installation and required CSS import strategy.

## Vite/PostCSS/global CSS implications
- Vite build currently assumes existing Tailwind v3 + PostCSS flow.
- PostCSS config currently uses `tailwindcss` + `autoprefixer` plugin object style.
- Global entry currently imports `./styles.css` from `src/main.tsx`; there is no `src/index.css` file in the current repo layout.
- HeroUI-required CSS order (`tailwindcss` before `@heroui/styles`) must be introduced only after Tailwind v4 migration decisions are validated.

## package-lock risk
- `package-lock.json` is currently aligned to React 18 + Tailwind 3 dependency graph.
- Attempting direct HeroUI install would rewrite lockfile broadly and can introduce peer/version churn across router, query, charting, and test toolchain.
- A staged lockfile strategy is required to isolate risk and enable rollback.

## UI component risk
- Shared UI surfaces are currently utility-class based and heavily repeated.
- Direct component-library insertion can introduce inconsistent spacing, typography, and semantic color mapping versus existing domain tokens (`pivot1`, `pivot2`, `weather`, `anomaly`, `missing`, `warning`).
- Existing deterministic vs AI boundary visuals must be preserved explicitly during any component migration.

## Chart/table/drawer risk
- Recharts-heavy views, dense diagnostics tables, and processed-data viewer drawers are information-dense and behavior-sensitive.
- HeroUI primitive changes can regress column density, mobile overflow behavior, and interaction affordances if migrated too early.
- These views should remain late-stage migration targets after low-risk primitives are stabilized.

## Analytics/Gemini safety risk
- Analytics computation and Gemini interpretation boundary rules are high-sensitivity areas.
- UI migration must not alter deterministic-vs-AI separation, reliability disclaimers, or limitation visibility.
- No unsupported agronomic claims may be introduced by visual rewrite.

## Test/build validation risk
- Even documentation-only work should keep build/test baseline green to ensure no accidental environment drift.
- Each migration stage must pass `npm run test -- --run`, `npm run typecheck`, and `npm run build` before progression.

## Dependency upgrade risk matrix
| Area | Risk | Why | Mitigation |
|---|---|---|---|
| React 18 -> 19 | High | Major runtime upgrade affects app root, hooks ecosystem, and peer dependencies | Stage 1 isolated upgrade with full test/type/build validation |
| Tailwind 3 -> 4 | High | Build pipeline and global CSS strategy changes | Stage 2 isolated CSS/tooling migration with token preservation |
| HeroUI package introduction | Medium-High | New component/style layers can conflict with existing utility patterns | Stage 3 infra-only integration before component swaps |
| Shared primitive migration | Medium | Visual and interaction consistency changes across many reused patterns | Stage 4 low-risk primitives only |
| Dense page visual migration | High | Tables/charts/drawers are behavior-sensitive | Stage 5 one page group per PR with strict validation |
| Final hardening | Medium | Accessibility/mobile/perf regressions may appear late | Stage 6 dedicated QA and rollback playbook |

## Files affected in future migration
- `dashboard/package.json`
- `dashboard/package-lock.json`
- `dashboard/tailwind.config.*`
- `dashboard/postcss.config.*`
- `dashboard/src/styles.css` (and/or canonical global CSS entry file)
- `dashboard/src/main.tsx`
- Shared UI/component files under `dashboard/src/components/**`
- Feature page files under `dashboard/src/features/**`

## Files must not be affected
- `WebService/**`
- `firmware/**`
- SQL migrations unrelated to UI migration
- Backend/runtime contracts unless explicitly scheduled in a separate plan

## Final verdict
**HeroUI cannot be safely installed directly on the current stack. A staged compatibility migration is required.**
