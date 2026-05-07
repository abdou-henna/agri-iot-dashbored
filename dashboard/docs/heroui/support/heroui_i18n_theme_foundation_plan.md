# HeroUI Pre-UI i18n/RTL/Theme Foundation Plan

## 1) Purpose
Define a safe pre-migration foundation for future English/Arabic language support, LTR/RTL direction handling, and light/dark appearance behavior before any page-level HeroUI visual migration.

## 2) Why i18n/theme foundation must happen before page migration
- Prevents expensive rework in Stage 4A/4B when shared primitives begin replacing legacy visual structures.
- Ensures wrappers/components are created with semantic and direction-safe APIs from day one.
- Keeps deterministic analytics and Gemini boundaries untouched while enabling future UX localization.

## 3) Supported future locales
- `en`
- `ar`

## 4) Direction rules
- `en = ltr`
- `ar = rtl`

## 5) HTML attributes plan
- Root document language is controlled via `html[lang]`.
- Root document direction is controlled via `html[dir]`.
- Initial bootstrap defaults: `lang="en"`, `dir="ltr"` unless an explicit user preference exists.

## 6) Theme rules
- Supported appearance modes:
  - `light`
  - `dark`
  - `system` (allowed only when implemented safely via `prefers-color-scheme` fallback)
- Theme preference affects presentation only; never analytics logic, timestamps, thresholds, or AI constraints.

## 7) Persistence plan
- Use `localStorage` only for user preference persistence.
- No backend writes for language/direction/theme.
- Preference keys remain front-end scoped and reversible.

## 8) Translation strategy
- Do not hardcode future UI strings inside shared primitives/wrappers.
- Use stable semantic labels/keys at wrapper boundaries.
- Defer full translation catalog and runtime translation library adoption until after Stage 4A wrappers are in place.

## 9) Number/date/unit formatting plan
- Preserve UTC source data and deterministic timestamp semantics.
- Display timezone remains separate from language selection.
- Do not translate or mutate `measured_at` / `event_time` semantics.
- Upload/received timestamps remain transfer diagnostics, not sensor chart time.

## 10) RTL-sensitive layout rules
- Avoid left/right hardcoding in all new primitives and wrappers.
- Prefer start/end terminology (inline-start/inline-end, text-start/text-end).
- Use logical CSS properties where practical.

## 11) Chart RTL rules
- Do not reverse chart time semantics unless explicitly designed and validated.
- Preserve `measured_at` / `event_time` meaning and chronology.
- Axis labels and textual annotations may localize later without changing metric math.

## 12) HeroUI design-principle mapping
Source: HeroUI v3 Design Principles (official docs).

- **Semantic intent over visual style:** wrapper APIs should expose intent (`primary`, `secondary`, `danger`) rather than ad hoc visual naming.
- **Accessibility as foundation:** language/direction/theme controls must preserve keyboard and ARIA behavior.
- **Composition over configuration:** compose locale/theme-aware wrappers from small parts; avoid monolithic setting props.
- **Progressive disclosure:** start with safe defaults, add advanced locale/theme controls later.
- **Predictable behavior:** consistent `lang/dir/theme` propagation from root document.
- **Type safety first:** strict locale/direction/appearance unions.
- **Separation of styles and logic:** appearance and direction selectors are presentation concerns, separate from analytics logic.
- **Complete customization:** preserve extension path for farm branding/tokens without breaking semantics.
- **Open/extensible wrapper approach:** wrappers remain adaptable to future translation and dashboard module expansion.

## 13) Acceptance criteria before page migration
- Foundation docs approved.
- Locale/direction/appearance types and constants exist (optional baseline code) without feature coupling.
- No feature pages/charts/analytics/Gemini logic modified.
- Build/test/typecheck remain green.
- RTL risk inventory captured for later Stage 4B/5 remediation.

## 14) Rollback strategy
- If any regression appears, remove new foundation-only config/types/utils in one atomic revert.
- Keep runtime behavior unchanged by default (docs-first baseline).
- Resume migration using previous Stage 3 HeroUI infrastructure snapshot.
