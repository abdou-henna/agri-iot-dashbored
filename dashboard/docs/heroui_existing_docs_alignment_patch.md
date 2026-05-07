# HeroUI Existing Project Docs Alignment Patch

**Purpose:** Identify which previously created HeroUI documents should be updated now that the target version is confirmed as HeroUI v3.0.3 and the project context says React 19/Tailwind v4/HeroUI infrastructure were completed locally.

---

## 1. Documents likely needing update

Update these project docs in `dashboard/docs/`:

```text
heroui_compatibility_audit.md
heroui_feasibility_plan.md
heroui_migration_plan.md
heroui_stage0_upgrade_checklist.md
heroui_stage4_shared_primitives_plan.md
heroui_dashboard_charts_design_principles.md
heroui_i18n_theme_foundation_plan.md
ui_migration_guardrails.md
ui_ux_design_system_plan.md
implementation_journey_report.md
implementation_master_plan.md
```

---

## 2. Main correction

Older docs that say:

```text
HeroUI direct adoption is blocked because current project uses React 18 and Tailwind 3.
```

should be replaced with:

```text
Historical note: HeroUI v3 adoption was previously blocked by React 18 and Tailwind 3.
Current rule: before any HeroUI UI task, verify local package.json/package-lock resolve React 19+, Tailwind CSS v4, @heroui/react 3.0.3, and @heroui/styles 3.0.3. Do not proceed if the local installed versions differ.
```

Do not remove historical context. It explains why staged migration existed.

---

## 3. Add v3.0.3 version guard everywhere

Add this block to every future HeroUI implementation prompt and to `ui_migration_guardrails.md`:

```bash
cd dashboard
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

Stop if not true.

---

## 4. Replace unverified component names

Older notes mention unverified exports such as:

```text
CardBody
CardHeader
CardFooter
Chip
Tabs
Tooltip
Skeleton
Divider
```

Update wording to:

```text
For HeroUI v3.0.3, official docs show dot-notation anatomy for Card (`Card.Header`, `Card.Content`, `Card.Footer`) and Table (`Table.ScrollContainer`, `Table.Content`, `Table.Header`, etc.). Direct named exports must still be verified locally before use. Do not assume older NextUI-style names.
```

Specific correction:

- Prefer `Card.Header`, `Card.Content`, `Card.Footer` over `CardHeader`, `CardBody`, `CardFooter` unless local package exports prove otherwise.
- Prefer `Chip` for small status/category labels, but wrap it as `StatusChip` or `Badge` internally.
- Verify whether `Separator` replaces older `Divider` terminology in the installed package.

---

## 5. Update Stage 4 shared primitives plan

Add this rule:

```text
Stage 4A may remain Tailwind-wrapper-first if safest, but Stage 4B should map wrappers to verified HeroUI v3.0.3 components. Feature pages must not import HeroUI directly until wrapper contracts are stable.
```

Add component mapping:

```text
Card family -> HeroUI Card dot-notation
Badge -> HeroUI Chip wrapper
Button -> HeroUI Button wrapper
StateBlock -> HeroUI Alert/Skeleton/Spinner where appropriate
Table wrapper -> HeroUI Table only after dense-table behavior is validated
Drawer wrapper -> HeroUI Drawer only after mobile/desktop behavior is validated
```

---

## 6. Update migration plan stage status

If React 19, Tailwind v4, and HeroUI infrastructure are already complete locally, update `heroui_migration_plan.md` status language:

```text
Stage 1 React 19 upgrade: completed locally; verify in package.json/package-lock before each task.
Stage 2 Tailwind CSS v4 upgrade: completed locally; verify CSS import order and build output before each task.
Stage 3 HeroUI infrastructure: completed locally; verify @heroui/react and @heroui/styles resolve to 3.0.3 before direct import work.
Current active strategy: professional design blueprint + wrapper-based implementation before page redesign.
```

---

## 7. Add reference screenshot adaptation note

Add this to `ui_ux_design_system_plan.md`:

```text
Reference screenshots from HeroUI official site define visual direction only: soft app shell, rounded sidebar, pill active nav, compact topbar, white card rhythm, subtle shadow/border, compact KPI cards, professional chart cards, and polished tables. They do not define data semantics. Smart Farm metrics, warnings, domains, reliability, and time semantics remain governed by project contracts.
```

---

## 8. Add AppShell/Overview freeze rule

Add this to `ui_migration_guardrails.md`:

```text
No broad AppShell/Overview redesign may begin until `dashboard/docs/heroui_dashboard_implementation_guide.md` exists and has been read by the coding agent. The guide is the visual blueprint and migration contract.
```

---

## 9. Add direct import stop condition

Add this stop condition:

```text
Stop if a planned direct HeroUI import is not present in local installed package exports or TypeScript declarations. Do not substitute a guessed component name.
```

---

## 10. Add visual QA checklist

For each HeroUI migration patch:

```text
- App frame has soft gray background and rounded outer container.
- Sidebar active nav is pill-shaped and readable.
- Topbar remains compact and does not hide freshness warnings.
- KPI cards show missing values explicitly.
- Chart cards preserve missing data gaps and timestamp semantics.
- Tables preserve density and mobile fallback.
- Deterministic and Gemini panels remain visually separated.
- No unsupported agronomic claims introduced.
```
