# HeroUI Docs

Structured reference for the HeroUI v3.0.3 migration of the Smart Farm IoT Dashboard.

**Scope reminder:** all work in this folder is UI-only. Never touch hooks, APIs, analytics, backend, schema, firmware, or chart data logic. Stop and surface any blocker that requires those areas.

---

## Read order

### 1. core/ — start here

| File | Purpose |
|---|---|
| `heroui_compatibility_audit.md` | Stack gap analysis: why React 19 + Tailwind v4 were required before HeroUI could be installed. |
| `heroui_migration_plan.md` | Staged migration plan (Stage 0 → Stage 6+) with allowed/forbidden files and stop conditions per stage. |
| `heroui_dashboard_implementation_guide.md` | Primary implementation reference: visual target, scope/stop rules, layout blueprint, component patterns, validation gates, and migration sequence. **Read this before writing any UI code.** |

### 2. support/ — read as needed

| File | Purpose |
|---|---|
| `heroui_v3_0_3_research_report.md` | Verified HeroUI v3.0.3 facts: install baseline, official component API, design principles, and version guard commands. |
| `heroui_component_mapping_reference.md` | Component-by-component mapping from dashboard needs to HeroUI components, wrapper contracts, and anti-patterns. |
| `heroui_dashboard_charts_design_principles.md` | Dashboard and chart design principles aligned to HeroUI v3: card anatomy, KPI rules, chart rules, severity badges, RTL/dark mode, and forbidden shortcuts. |
| `heroui_i18n_theme_foundation_plan.md` | Pre-migration i18n/RTL/theme foundation: locale support, direction rules, HTML attributes plan, and theme constraints. |
| `heroui_stage0_upgrade_checklist.md` | Stage 0 completion checklist: stack verification, safety checks, rollback conditions, and gate criteria for Stage 1. |
| `heroui_dashboard_design_principles.md` | Stub → see `heroui_dashboard_charts_design_principles.md`. |
| `heroui_i18n_theme_foundation.md` | Stub → see `heroui_i18n_theme_foundation_plan.md`. |

### 3. archive/ — historical context only

| File | Purpose |
|---|---|
| `heroui_feasibility_plan.md` | Pre-verification feasibility assessment written before external HeroUI docs were accessed. Stack risks and recommendations here have been superseded by the core/ docs. |

---

## Duplication notes

The following root-level `dashboard/docs/` files are identical to their counterparts in `core/` or `support/`. The `heroui/` folder is the canonical location going forward; root copies are kept to avoid breaking any existing references.

| Root file | Canonical location |
|---|---|
| `heroui_migration_plan.md` | `core/heroui_migration_plan.md` |
| `heroui_compatibility_audit.md` | `core/heroui_compatibility_audit.md` |
| `heroui_i18n_theme_foundation_plan.md` | `support/heroui_i18n_theme_foundation_plan.md` |
