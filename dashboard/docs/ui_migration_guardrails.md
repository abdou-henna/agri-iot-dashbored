# UI Migration Lessons & Guardrails

## 1. Purpose
This document exists to stop repeat UI migration failures by turning recent Overview migration incidents into mandatory guardrails. It is the operational checklist for every future UI migration prompt so visual upgrades do not break runtime stability, type safety, responsive behavior, or product constraints.

## 2. Golden workflow
1. **Codex edits code only.**
2. **User runs all local validation** (`npm run dev`, `npm run build`, `npm run test`, `npm run typecheck`) on their machine.
3. **No package installs by Codex** unless explicitly requested.
4. **Always run `git status` before edits** to confirm clean scope.
5. **Never continue with unrelated dirty files.** Resolve or isolate them first.

## 3. HeroUI rules
- Do **not** import direct HeroUI named exports unless they are locally verified in the installed version.
- Installed package exports and TypeScript types are the source of truth.
- Internal UI primitives in `dashboard/src/components/ui/*` are the safe default.
- Treat the following as **unverified until locally proven**: `CardBody`, `CardHeader`, `CardFooter`, `Chip`, `Tabs`, `Tooltip`, `Skeleton`, `Divider`.

## 4. Overview incidents and fixes

### Incident A: Blank page from invalid `@heroui/react` exports
- **Failure:** Runtime blank page caused by importing named exports not present in installed HeroUI package.
- **Fix:** Reverted Overview to internal primitives (`Card`, `CardHeader`, `CardContent`, `CardFooter`, `Badge`, `Button`, `SectionHeader`) and restored stable rendering.

### Incident B: `MetricKey` map type error
- **Failure:** `Record<MetricKey, string>` failed because `MetricKey` includes `rssi` and `snr`.
- **Fix:** Changed to `Partial<Record<MetricKey, string>>` and used fallback label logic.

### Incident C: Sparkline invisible/collapsed
- **Failure:** Sparkline could collapse due to unstable chart container sizing.
- **Fix:** Enforced stable wrapper sizing (`h-24`, `min-h-24`, full-size inner wrapper) around the sparkline chart.

### Incident D: Mobile command row overflow
- **Failure:** Header command row overflowed on smaller devices.
- **Fix:** Applied mobile-first stacking with `flex-col`, added `flex-wrap`, `min-w-0`, `max-w-full`, and text wrapping controls.

### Incident E: Operational Snapshot cramped spacing
- **Failure:** Snapshot card felt cramped and warning rows were visually compressed.
- **Fix:** Added explicit header/body padding (`p-5`/`p-6`), larger grid/warning gaps, and clearer warning block spacing.

## 5. Non-negotiable product constraints
- `measured_at` is chart/analysis time.
- `event_time` is diagnostics event time.
- Upload timestamps are audit/transfer metadata only, not measurement time.
- Missing/null values must stay visible as `—`.
- No unsupported claims: pH, NPK, ECe, salinity class, disease prediction, yield prediction, or ET recommendations.
- Gemini output is interpretive only and must not override deterministic constraints.
- UI work must not alter analytics/data logic or backend contract behavior.

## 6. Pre-flight checklist for every future UI prompt
Copy/paste before any edit:

```md
- [ ] Scope confirmed UI-only (no hooks/api/analytics logic changes).
- [ ] `git status` clean OR only in-scope files modified.
- [ ] No unrelated dirty files in working tree.
- [ ] Allowed files explicitly listed in prompt.
- [ ] Forbidden files explicitly listed in prompt.
- [ ] Existing internal primitives inspected before adding imports.
- [ ] No unverified direct HeroUI named exports introduced.
- [ ] Time semantics preserved (`measured_at` vs `event_time` vs upload metadata).
- [ ] Missing/null values remain visible as `—`.
- [ ] Mobile layout checked for 375px no-overflow behavior.
- [ ] User will run local dev/build/test/typecheck after patch.
```

## 7. Safe prompt template for future UI migrations

```md
Task: UI-only migration for [PAGE/COMPONENT].

Allowed files:
- [list exact file paths]

Forbidden files:
- src/hooks/**
- src/api/**
- src/utils/analytics/**
- src/utils/ai/**
- package.json
- package-lock.json

Rules:
- Do not run npm install/dev/build/test/typecheck.
- Preserve existing hooks, analytics, and data contracts.
- Inspect and prefer existing internal UI primitives before any new import.
- Do not use direct HeroUI named exports unless locally verified in installed package.
- Keep missing/null display as `—` and preserve measured_at/event_time semantics.

Validation:
- User runs local npm validation and visual QA (desktop + mobile).
```

## 8. Acceptance criteria
A future UI migration is acceptable only if all are true:
- Local `typecheck`, `build`, and `test` pass on user machine.
- No runtime console errors.
- Desktop and mobile visual QA pass.
- No horizontal overflow at **375px** viewport width.
- QC/reliability/limitations messaging remains visible (not hidden or de-emphasized).
- No direct unverified HeroUI imports are present.
