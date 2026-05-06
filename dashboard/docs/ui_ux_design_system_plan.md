# UI/UX Design System Plan (Visual-Only, Safe Refactor)

## Purpose
Create a consistent visual system for the existing dashboard while preserving deterministic analytics integrity, Gemini boundary safety, and processed-viewer read-only semantics.

## Design principles
- Clarity over decoration for operational decision support.
- Deterministic-first trust model; AI remains clearly interpretive.
- High information density with predictable scan paths.
- Visible limitations, reliability, and confidence context at point of use.
- Mobile parity for critical monitoring and diagnostics actions.

## Color system
- Keep existing semantic base tokens: `pivot1`, `pivot2`, `weather`, `anomaly`, `missing`, `warning`.
- Add UI-role aliases (surface, border, text-primary, text-secondary, focus, success/info/warn/error scales) mapped to existing palette.
- Do not repurpose anomaly/error hues for non-risk decorative accents.

## Typography scale
- Page title: `text-lg`/`text-xl` semibold.
- Section title: `text-base` semibold.
- Card title: `text-sm` semibold uppercase optional by context.
- Body: `text-sm` default.
- Metadata/supporting: `text-xs` with stronger contrast than current weakest gray states.
- Monospace only for IDs/codes/lineage fields.

## Spacing / radius / shadow rules
- Primary card padding: 16px (`p-4`), dense cards 12px (`p-3`) only by exception.
- Vertical rhythm increments: 8/12/16/24.
- Border radius baseline: `rounded-lg`; no ad hoc mixed radii in same region.
- Shadow use minimal and semantic (elevation for overlays, not standard cards).

## Card pattern
- Standard anatomy: header (title + optional metadata/action), body (content), footer (secondary actions/status).
- Mandatory support row for timestamp/source/reliability where applicable.
- Empty/loading/error treatment placed inside card body with fixed min-height for layout stability.

## Status badge pattern
- One badge component pattern across diagnostics, processed viewer, and agronomy summaries.
- Consistent casing, padding, radius, and icon optionality.
- Use severity/status mappings only; avoid ambiguous neutral tones for warnings/errors.

## Reliability / severity pattern
- Reliability states: high/medium/low/insufficient each with distinct color + icon + concise helper text.
- Severity states: info/warning/error/critical standardized across tables/chips/cards.
- Low-confidence warnings must remain visible near actionable recommendations.

## Empty / loading / error states
- Reuse shared feedback components with standardized title, reason, and retry affordance.
- Empty state must clarify whether data is unavailable, filtered out, or not yet uploaded.
- Error states should include recoverability hint (retry/filter reset/check upload context).

## Drawer / modal pattern
- Drawer preferred for dense contextual inspection (processed data, diagnostics detail).
- Required structure: sticky header (title/context), scroll body, sticky footer actions.
- Preserve keyboard escape/focus order; avoid nested overlay complexity.

## Table pattern
- Column priority model:
  - Always visible: time, status/severity, primary metric/event descriptor.
  - Secondary: IDs/codes/source in expandable row or condensed chips on mobile.
- Fixed row spacing and numeric alignment.
- Missing values shown explicitly (`—` or `missing`), never coerced to zero.

## AI vs deterministic visual separation
- Deterministic panels: neutral/structural styling with reliability ribbons.
- Gemini panels: clearly labeled interpretive container (e.g., distinct accent rail/header label).
- Cross-panel copy must state: AI does not override deterministic constraints.

## Diagnostics visual language
- Filter zones grouped in consistent order: severity → scope(node/upload/type) → free-text filters → quick actions.
- Histogram and table should share legend/color tokens.
- Expanded details use definition-list style for event metadata readability.

## Mobile layout rules
- Critical status and warnings must appear before dense charts/tables.
- Chips wrap with controlled spacing; avoid overflow clipping.
- Tables degrade to summary rows + expand panels.
- Bottom nav contexts should include breadcrumbs/page subtitles where needed.

## Accessibility rules
- Maintain AA contrast for text and status indicators.
- Ensure visible focus rings on all interactive controls.
- Preserve semantic headings and label associations for filter inputs.
- Avoid color-only encoding for severity/reliability (add text/icon cues).

## Component refactor map
- Shell/nav consistency: `src/components/layout/AppShell.tsx`
- Shared feedback states: `src/components/feedback/States.tsx`
- AI interpretation: `src/components/ai/GeminiInsightPanel.tsx`, `src/components/ai/GeminiReliabilityGate.tsx`, `src/components/ai/GeminiContextControls.tsx`
- Deterministic intelligence: `src/components/agronomy/AgronomicIntelligencePanel.tsx`
- Processed viewer: `src/components/analytics/ProcessedDataViewerBadges.tsx`, `src/components/analytics/ProcessedDataViewerTable.tsx`, `src/components/analytics/ProcessedDataViewerDrawer.tsx`
- Diagnostics pages: `src/features/diagnostics/LogsPage.tsx`, `src/features/diagnostics/SystemHealthPage.tsx`, `src/features/diagnostics/UploadsPage.tsx`
- Overview/dense monitoring surfaces: `src/features/overview/OverviewPage.tsx`, `src/features/soil/SoilPage.tsx`, `src/features/weather/WeatherPage.tsx`, `src/features/comparison/ComparisonPage.tsx`

## Files eligible for future UI-only refactor
- `src/components/layout/AppShell.tsx`
- `src/components/feedback/States.tsx`
- `src/components/analytics/ProcessedDataViewer*.tsx`
- `src/components/ai/*.tsx` (visual copy/layout only)
- `src/components/agronomy/AgronomicIntelligencePanel.tsx` (presentation-only)
- `src/features/overview/OverviewPage.tsx`
- `src/features/soil/SoilPage.tsx`
- `src/features/weather/WeatherPage.tsx`
- `src/features/comparison/ComparisonPage.tsx`
- `src/features/diagnostics/*.tsx`
- `src/features/agronomy/*.tsx` (layout/visual hierarchy only)

## Files forbidden for future UI-only refactor
- `src/utils/analytics/**` (deterministic logic/contracts)
- `src/utils/ai/**` and `src/config/geminiPrompts.ts` (AI boundary logic/prompts)
- `src/api/**` (backend contract layer)
- `src/hooks/**` (query/business behavior)
- `src/app/router.tsx` (routing semantics)
- `package.json`, lockfiles, Tailwind/PostCSS/Vite/TS configs (unless separately approved)

## Stage-by-stage rollout plan
1. **Stage 0 — Baseline tokens and inventory**
   - Finalize visual tokens and component taxonomy.
2. **Stage 1 — Shared primitives**
   - Standardize cards, badges, and state blocks.
3. **Stage 2 — Diagnostics/data density**
   - Apply table/filter/drawer patterns to diagnostics and processed viewer.
4. **Stage 3 — Deterministic + AI panel harmonization**
   - Improve visual separation while preserving reliability/limitations prominence.
5. **Stage 4 — Cross-page responsiveness pass**
   - Normalize mobile scan paths and collapse behavior.
6. **Stage 5 — Hardening and acceptance**
   - Visual regression pass, accessibility checks, and safety-rule checklist.

### Non-negotiable preservation constraints
- Deterministic analytics and Gemini interpretation must remain visually and semantically distinct.
- Reliability/limitations and low-confidence warnings must remain explicit and visible.
- Processed Data Viewer must remain read-only and lineage-aware.
- No unsupported agronomic claims may be introduced by UI copy or styling.

## HeroUI Alignment Strategy
- **Near-term:** continue current Tailwind-based visual standardization only (no HeroUI install yet).
- **Medium-term:** execute compatibility migration path (React 19 then Tailwind CSS v4) with regression validation at each stage.
- **Long-term:** adopt HeroUI components in controlled stages after compatibility baseline is proven.
- Preserve deterministic-vs-AI separation in all visual patterns.
- Keep reliability/limitations visibility explicit at point of recommendation.
- Do not introduce unsupported agronomic claims through UI wording or component defaults.
