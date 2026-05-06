# HeroUI Dashboard & Charts Design Principles (Pre-Migration)

## 1) Purpose
Define non-breaking HeroUI-aligned design principles for dashboard, chart, and dense-operational surfaces before component migration.

## 2) Official HeroUI principles applied to dashboards
- Semantic intent over visual style.
- Accessibility as foundation.
- Composition over configuration.
- Progressive disclosure.
- Predictable behavior.
- Type safety first.
- Separation of styles and logic.
- Complete customization.
- Open/extensible wrapper approach.

## 3) Card anatomy for dashboard panels
- Header: title + semantic status + optional action.
- Body: main metrics/visuals.
- Support row/footer: source/time/reliability context.
- Card anatomy must be consistent across deterministic and interpretive areas, while preserving boundary styling.

## 4) KPI card rules
- Single primary metric per card.
- Compact metadata line for scope + freshness + reliability.
- Explicit missing/unknown marker; never coerce missing to 0.

## 5) Chart container rules
- Clear title, metric unit, and time basis.
- Missing/null points remain visible as gaps.
- **Charts must not hide missing data.**
- **Charts must not interpolate missing/null values.**
- **Upload time must not become chart time.**

## 6) Filter/control bar rules
- Group controls by decision sequence (time range → scope → metric/flags).
- Use semantic control labels suitable for localization.
- Keep keyboard and screen-reader operability intact.

## 7) Table/drawer rules
- Maintain deterministic domain labeling (sensor/system/upload/agronomic).
- Keep lineage and timestamp columns explicit.
- Drawers should preserve sticky context and non-destructive read-only behavior.

## 8) State messaging rules
- Standardize loading, empty, error, and low-confidence states.
- Every state includes concise cause and recovery hint where applicable.

## 9) Severity/reliability badge rules
- Severity and reliability are separate concepts and separate visual channels.
- Badges require text + color/icon cues (not color-only).
- Preserve critical/warn/error contrast in both light and dark modes.

## 10) Deterministic vs AI visual separation
- Deterministic analytics remains the authoritative surface.
- **Gemini panels must remain visually interpretive.**
- **Deterministic analytics remain authoritative.**

## 11) Processed Data Viewer preservation rules
- Viewer remains read-only.
- Keep raw/cleaned/processed distinctions explicit.
- Do not rename Gemini outputs as processed analytics.

## 12) Mobile dashboard rules
- Critical alerts, reliability, and current status surface first.
- Dense charts/tables collapse progressively.
- Interaction targets remain touch-safe.

## 13) Dark mode rules
- Ensure AA contrast for text, chart axes, legends, and badges.
- Preserve semantic severity colors with dark-safe calibration.
- Avoid relying on subtle border-only distinction.

## 14) RTL dashboard rules
- Avoid hardcoded left/right in new wrappers.
- Prefer logical spacing/alignment semantics.
- Keep numeric/time rendering readable and semantically unchanged.

## 15) Accessibility checklist
- Keyboard navigation for filters/tabs/drawers.
- ARIA labels for chart containers and controls.
- Focus-visible styles on interactive elements.
- Non-color status encoding.

## 16) Stage 4A primitive implications
- Shared wrappers must accept semantic intent props.
- Wrapper slots should remain composable/extensible.
- Primitive APIs should be locale/direction/theme ready without forcing immediate translations.

## 17) Stage 4B/5 migration order
1. Shared primitives/wrappers (Stage 4A).
2. Low-risk state and shell surfaces.
3. Overview + diagnostics high-impact readability pass.
4. Processed viewer + agronomy interpretive surfaces with preserved boundaries.
5. Remaining pages with strict parity validation.

## 18) Forbidden visual shortcuts
- Do not smooth over telemetry gaps to look cleaner.
- Do not re-time series using upload metadata.
- Do not collapse deterministic and AI panels into one trust channel.
- **EC stays trend-only; no salinity class.**
- **No pH/NPK/yield/disease/ET claims.**
