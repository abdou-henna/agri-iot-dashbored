# HeroUI Dashboard Implementation Guide

**Project:** Smart Farm IoT + Agronomic Analytics Dashboard  
**Target library:** HeroUI v3.0.3  
**Primary objective:** Rebuild the dashboard visual system to match the professional HeroUI-style reference screenshots without changing data, analytics, Gemini, backend, schema, firmware, or chart semantics.

---

## 1. Design target from reference screenshots

The desired dashboard style is a clean, soft, professional analytics interface with:

- light gray app background;
- large rounded application frame;
- left sidebar with rounded active navigation pill;
- compact topbar with icon actions;
- segmented page tabs/pills;
- compact KPI cards with large numeric values and small status chips;
- white rounded chart cards;
- subtle borders and soft shadows;
- disciplined spacing and consistent card anatomy;
- polished data table with rounded container, compact toolbars, and action icons;
- sticky/comfortable page scroll area;
- strong hierarchy but no visual noise.

### Smart Farm adaptation

The visual style must be adapted to agricultural IoT semantics:

- Revenue/Expenses cards become moisture, soil temperature, EC, air temperature, humidity, pressure, reliability, upload freshness.
- Employee table becomes logs, uploads, processed data, or agronomic event tables.
- Traffic Source chart becomes soil/weather/pivot comparison chart cards.
- Sales Performance chart becomes moisture/temperature/EC trend cards.

The reference style is a visual model, not a data model.

---

## 2. Non-negotiable product constraints

Never change these during UI migration:

- `sensor_readings.measured_at` is sensor chart/analysis time.
- `system_events.event_time` is diagnostics/event time.
- `uploads.started_at`, `uploads.finished_at`, and `uploads.received_at` are transfer/audit metadata only.
- `agronomic_events.started_at` and `ended_at` are agronomic operation time.
- Missing values remain explicit (`—`, `Missing`, `Not available`) and never become zero.
- Charts do not interpolate missing/null values.
- Reliability/QC limitations remain visible.
- Gemini is explanatory only and never authoritative.
- Deterministic analytics remain authoritative.
- No UI claims pH, NPK, ECe conversion, official salinity class, disease diagnosis, yield prediction, or ET values unless explicitly implemented later.

---

## 3. Version and local-export gate

Before any code edit, Claude Code must run:

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

Expected HeroUI:

```text
@heroui/react@3.0.3
@heroui/styles@3.0.3
```

Then inspect exports/types before direct imports:

```bash
cd dashboard
node -e "console.log(Object.keys(require('@heroui/react')).sort().join('\n'))" | rg "^(Card|Button|Chip|Table|Drawer|Tabs|Input|Avatar|Dropdown|Skeleton|Spinner|Separator|ScrollShadow)$" || true
rg -n "export .*Card|export .*Table|export .*Drawer|export .*Chip|export .*Tabs" node_modules/@heroui/react node_modules/@heroui/styles | head -80
```

If the export list does not match planned imports, stop. Do not guess.

---

## 4. Core layout blueprint

### 4.1 App frame

Use a full-page soft shell:

```tsx
<div className="min-h-screen bg-zinc-100 p-3 text-foreground dark:bg-zinc-950">
  <div className="mx-auto flex min-h-[calc(100vh-1.5rem)] max-w-[1440px] overflow-hidden rounded-[28px] border border-zinc-200/80 bg-zinc-50 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
    {/* Sidebar */}
    {/* Main area */}
  </div>
</div>
```

Visual intent:

- app feels like one polished product surface;
- not flat full-bleed admin template;
- rounded outer frame echoes HeroUI demo screenshots.

### 4.2 Sidebar

Sidebar target:

```text
width: 220-248px desktop
background: near-white / soft gray
border-inline-end: subtle
active nav: rounded pill, slightly darker background
icons: small, consistent stroke
bottom support links: Help, Logout, Settings
```

Rules:

- Use `text-start`, `ms-*`, `me-*` where practical.
- No hardcoded `left/right` unless unavoidable and documented.
- Active route uses pill surface, not full-width colored bar.
- Sidebar must remain usable in Arabic/RTL later.

### 4.3 Topbar

Topbar target:

```text
height: 56-64px
page title left/start
compact icon actions right/end
optional timezone/status chip
search/icon buttons in rounded circular controls
```

Do not overload topbar with analytics content.

---

## 5. Page composition blueprint

### 5.1 Overview page structure

Recommended order:

1. Header row: title + current status/actions.
2. Segmented navigation/filter row if applicable.
3. KPI grid.
4. Main chart grid.
5. Node status / reliability row.
6. Recent alerts / logs preview.
7. Optional table/list section.

Example:

```tsx
<section className="space-y-4">
  <OverviewHeader />
  <OverviewSegmentedControls />
  <KpiGrid />
  <div className="grid gap-4 xl:grid-cols-[1.05fr_1fr]">
    <ChartCard title="Pivot moisture trend" />
    <ChartCard title="Weather context" />
  </div>
  <NodeStatusGrid />
  <RecentAlertsPanel />
</section>
```

### 5.2 KPI grid

Desktop:

```text
4 cards per row for Overview primary metrics
```

Tablet:

```text
2 cards per row
```

Mobile:

```text
1 card or 2 compact cards depending density
```

Card anatomy:

```tsx
<Card className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
  <Card.Header className="pb-2">
    <Card.Description>Pivot 1 Moisture</Card.Description>
  </Card.Header>
  <Card.Content className="space-y-3">
    <div className="flex items-end justify-between gap-3">
      <div className="text-2xl font-semibold tracking-tight">38.2%</div>
      <ReliabilityChip level="high" />
    </div>
    <MiniSparkline />
  </Card.Content>
  <Card.Footer className="text-xs text-zinc-500">
    measured_at · MAIN · trend only
  </Card.Footer>
</Card>
```

KPI rules:

- one primary metric per card;
- no fake change percentages unless computed;
- show `—` when missing;
- show measured time/freshness label;
- reliability chip is separate from severity chip.

### 5.3 Chart cards

Chart card anatomy:

```tsx
<Card className="rounded-3xl border border-zinc-200 bg-white p-0 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
  <Card.Header className="flex items-start justify-between gap-4 px-5 pt-5">
    <div>
      <Card.Title>Soil Moisture</Card.Title>
      <Card.Description>measured_at · Pivot 1 and Pivot 2 · missing values shown as gaps</Card.Description>
    </div>
    <Toolbar />
  </Card.Header>
  <Card.Content className="px-5 pb-5 pt-3">
    <ChartFrame />
  </Card.Content>
</Card>
```

Chart rules:

- title must include metric meaning;
- subtitle must state time basis when relevant;
- missing values remain gaps;
- data confidence strip stays visible;
- upload time never appears as chart X-axis.

### 5.4 Table cards

Table section target from reference screenshots:

- section title and count chip above table;
- filter/sort/columns controls as rounded buttons;
- search aligned opposite controls;
- table header muted gray;
- rows white with subtle dividers;
- action buttons circular and compact;
- mobile converts to stacked cards.

Example structure:

```tsx
<section className="space-y-3">
  <div className="flex flex-wrap items-center justify-between gap-3">
    <div className="flex items-center gap-2">
      <h2 className="text-sm font-semibold">Recent Events</h2>
      <Chip size="sm" variant="secondary">32</Chip>
    </div>
    <Input aria-label="Search events" placeholder="Search..." className="w-full sm:w-64" />
  </div>
  <Toolbar />
  <DataTableCard />
</section>
```

---

## 6. Component mapping strategy

Use internal wrappers as the public API for feature pages.

### Stage A: wrappers verify HeroUI locally

Create/confirm wrappers:

```text
src/components/ui/Card.tsx
src/components/ui/Button.tsx
src/components/ui/Badge.tsx or Chip.tsx
src/components/ui/Table.tsx
src/components/ui/Drawer.tsx
src/components/ui/SectionHeader.tsx
src/components/ui/StateBlock.tsx
```

Feature pages import from internal wrappers, not directly from HeroUI:

```ts
import { Card, Button, Badge, SectionHeader } from '@/components/ui';
```

### Stage B: direct HeroUI only inside wrappers

```tsx
import { Card as HeroCard } from '@heroui/react';
```

Only wrappers may contain direct HeroUI imports unless explicitly approved for a single low-risk component.

---

## 7. Visual token recommendations

### Surfaces

```text
app background: zinc-100 / zinc-950
main surface: zinc-50 / zinc-950
card surface: white / zinc-900
soft panel: zinc-100 / zinc-900
borders: zinc-200 / zinc-800
```

### Radius

```text
outer app frame: 28px
sidebar/nav pills: 14-18px
cards: 18-24px
chart cards: 24px
buttons/chips: pill or 12px depending size
```

### Shadows

Use very soft shadows only:

```text
shadow-sm for cards
shadow-md only for drawers/modals/popovers
no heavy admin-template shadows
```

### Spacing

```text
page gap: 16-24px
card padding: 16-20px
dense card padding: 12-16px
table row height: 44-56px depending density
```

---

## 8. Smart Farm semantic chips

Use chips consistently:

| Meaning | Example label | Tone |
|---|---|---|
| Reliability high | High reliability | success |
| Reliability medium | Medium reliability | warning/info |
| Reliability low | Low reliability | warning |
| Reliability invalid | Invalid | danger |
| System warning | Warning | warning |
| System error | Error | danger |
| Domain sensor | Sensor | default/secondary |
| Domain upload | Transfer metadata | secondary |
| AI panel | AI interpretation | tertiary/accent |
| Deterministic panel | Deterministic | default/primary |

No color-only encoding. Every chip must have readable text.

---

## 9. Accessibility and RTL rules

- Preserve semantic headings.
- Card is not a fake button; use a real button/link for actions.
- Icon-only buttons require `aria-label`.
- Tabs require `aria-label`.
- Tables require `aria-label`.
- Use focus-visible states.
- Avoid `text-left`, `text-right`, `ml-*`, `mr-*`, `pl-*`, `pr-*` in new wrappers where logical alternatives work.
- Charts must remain chronologically correct in RTL; do not reverse time axis without explicit product decision.

---

## 10. Validation checklist for every UI migration PR

Run:

```bash
git diff --name-only
cd dashboard && npm run test -- --run
cd dashboard && npm run typecheck
cd dashboard && npm run build
cd dashboard && rg -n "VITE_GEMINI_API_KEY|X-goog-api-key|generativelanguage.googleapis.com" src || true
cd dashboard && rg -n "soil_ph|soil_salinity|NPK|yield prediction|disease diagnosis|ECe|ET|salinity class" src || true
cd dashboard && rg -n "left-|right-|ml-|mr-|pl-|pr-|text-left|text-right" src/components/ui src/features/overview src/components/layout || true
cd dashboard && rg -n "fetch\(|apiGet|apiPost|apiPatch|useQuery|useMutation|gemini|analytics" src/components/ui || true
```

Expected:

- no direct frontend Gemini API keys;
- no unsupported agronomic claims introduced;
- no new raw fetch logic in UI components;
- no logic changes unless explicitly approved;
- tests/typecheck/build pass.

---

## 11. Claude Code task sequence

Use this sequence only:

1. Verify package versions and exports.
2. Update docs if stale compatibility notes remain.
3. Implement/adjust wrappers only.
4. Redesign AppShell only.
5. Redesign Overview only.
6. Visual QA and user approval.
7. Continue page-by-page.

Never edit multiple feature groups in one task without explicit scoped approval.
