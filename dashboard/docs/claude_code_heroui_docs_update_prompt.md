# Claude Code Prompt — Create/Update HeroUI Dashboard Implementation Docs

Use this prompt with Claude Code locally after placing these files into the repository or after uploading them as references.

---

You are a senior React 19, Tailwind CSS v4, HeroUI v3.0.3, TypeScript, dashboard UX, accessibility, and production UI migration engineer.

Task:
Create and align the official HeroUI dashboard implementation documentation for the Smart Farm IoT + Agronomic Analytics Dashboard.

This is a docs-only task unless explicitly instructed otherwise.
Do NOT edit runtime code.
Do NOT edit package.json/package-lock.json.
Do NOT change backend, schema, firmware, analytics, Gemini, hooks, API, chart transforms, routing, or business logic.

## Context

The dashboard is a Smart Farm IoT monitoring and agronomic analytics platform for alfalfa.
The desired UI direction is the professional HeroUI dashboard style from official HeroUI site screenshots:

- soft gray page background
- rounded app shell
- rounded sidebar
- active nav pill
- compact topbar
- white rounded cards
- subtle borders and shadows
- compact KPI cards
- polished chart cards
- polished tables
- disciplined spacing
- mobile-safe layouts

HeroUI target version: `3.0.3`.

## Mandatory setup

Before editing docs, run:

```bash
git status --short
git branch --show-current
git remote -v
cd dashboard
node -p "require('./package.json').dependencies.react || require('./package.json').devDependencies.react"
node -p "require('./package.json').dependencies['@heroui/react']"
node -p "require('./package.json').dependencies['@heroui/styles']"
npm ls @heroui/react @heroui/styles react react-dom tailwindcss
```

Expected:

```text
@heroui/react@3.0.3
@heroui/styles@3.0.3
React 19+
Tailwind CSS v4
```

If HeroUI is not 3.0.3, stop and report exact installed versions.

If unrelated dirty files exist, stop and report.

If `git remote -v` is empty, state exactly:

```text
No git remote configured; cannot push or create PR from this environment.
```

## Read first

Read:

```text
dashboard/docs/heroui_compatibility_audit.md
dashboard/docs/heroui_dashboard_charts_design_principles.md
dashboard/docs/heroui_feasibility_plan.md
dashboard/docs/heroui_i18n_theme_foundation_plan.md
dashboard/docs/heroui_migration_plan.md
dashboard/docs/heroui_stage0_upgrade_checklist.md
dashboard/docs/heroui_stage4_shared_primitives_plan.md
dashboard/docs/ui_migration_guardrails.md
dashboard/docs/ui_ux_audit.md
dashboard/docs/ui_ux_design_system_plan.md
dashboard/docs/time_semantics_dashboard_policy.md
dashboard/docs/data-domain-contract.md
dashboard/docs/data_contract.md
dashboard/docs/gemini-boundaries.md
dashboard/docs/processed_data_viewer_rules.md
dashboard/docs/implementation_journey_report.md
dashboard/docs/implementation_master_plan.md
```

Also inspect:

```bash
cd dashboard
node -e "console.log(Object.keys(require('@heroui/react')).sort().join('\n'))" | rg "^(Card|Button|Chip|Table|Drawer|Tabs|Input|Avatar|Dropdown|Skeleton|Spinner|Separator|ScrollShadow)$" || true
rg -n "export .*Card|export .*Table|export .*Drawer|export .*Chip|export .*Tabs" node_modules/@heroui/react node_modules/@heroui/styles | head -120
```

## Required docs to create/update

Create:

```text
dashboard/docs/heroui_v3_0_3_research_report.md
dashboard/docs/heroui_dashboard_implementation_guide.md
dashboard/docs/heroui_component_mapping_reference.md
dashboard/docs/heroui_existing_docs_alignment_patch.md
```

Update existing docs only as docs-only edits:

```text
dashboard/docs/heroui_compatibility_audit.md
dashboard/docs/heroui_feasibility_plan.md
dashboard/docs/heroui_migration_plan.md
dashboard/docs/heroui_stage0_upgrade_checklist.md
dashboard/docs/heroui_stage4_shared_primitives_plan.md
dashboard/docs/ui_migration_guardrails.md
dashboard/docs/ui_ux_design_system_plan.md
dashboard/docs/implementation_journey_report.md
```

## Required corrections

1. Replace stale “React 18/Tailwind 3 blocks HeroUI” current-status wording with historical-status wording.
2. Add the v3.0.3 verification gate.
3. Add local export/type verification before direct imports.
4. Replace unverified component assumptions with verified dot-notation anatomy where local package confirms it.
5. State that feature pages should import internal wrappers, not HeroUI directly.
6. Add the screenshot visual target summary.
7. Add AppShell/Overview freeze rule: no redesign until the implementation guide exists and is read.
8. Preserve all data/time/Gemini/analytics constraints.

## Non-negotiable constraints

Do NOT:

- mutate raw data
- change runtime code
- change package versions
- change backend/schema/firmware
- change analytics/Gemini/business logic
- alter chart data transforms
- hide QC/reliability limitations
- use upload time as sensor chart time
- add pH/NPK/ECe/salinity class/disease/yield prediction/ET claims
- add unverified HeroUI direct imports

## Validation

Run:

```bash
git diff --name-only
cd dashboard && npm run test -- --run
cd dashboard && npm run typecheck
cd dashboard && npm run build
cd dashboard && rg -n "VITE_GEMINI_API_KEY|X-goog-api-key|generativelanguage.googleapis.com" src || true
cd dashboard && rg -n "soil_ph|soil_salinity|NPK|yield prediction|disease diagnosis|ECe|ET|salinity class" docs src || true
cd dashboard && rg -n "CardBody|CardHeader|CardFooter|Divider" docs/heroui_*.md docs/ui_migration_guardrails.md docs/ui_ux_design_system_plan.md || true
```

Forbidden-term scan may find safe historical references or explicit forbidden lists. Report them and classify as safe/unsafe.

## Output only

Return:

1. Setup / branch / remote result
2. Installed package verification result
3. HeroUI v3.0.3 confirmation
4. Files inspected
5. Docs created
6. Docs updated
7. Corrections applied
8. Direct import/export verification result
9. Data/analytics/Gemini safety summary
10. Validation results
11. Forbidden scan results
12. Commit / PR result
13. Known limitations
14. Exact next recommended prompt topic
