# HeroUI v3.0.3 Research Report for Smart Farm Dashboard

**Project:** Smart Farm IoT + Agronomic Analytics Dashboard  
**Target UI library:** HeroUI v3.0.3  
**Purpose:** Freeze verified HeroUI facts before dashboard redesign work begins.  
**Source basis:** HeroUI official documentation pages visited for v3.0.3, plus the project's existing dashboard/HeroUI planning documents and UI migration guardrails.

---

## 1. Verified version

The official HeroUI documentation currently identifies the web docs as:

```text
HeroUI v3.0.3
```

This guide must be treated as version-specific. Do not apply examples from older NextUI/HeroUI versions without verifying local package exports and installed TypeScript declarations.

---

## 2. Verified installation baseline

Official HeroUI v3 quick start lists these requirements:

```text
React 19+
Tailwind CSS v4
```

Official install command:

```bash
npm i @heroui/styles @heroui/react
```

Official CSS import order:

```css
@import "tailwindcss";
@import "@heroui/styles";
```

**Critical rule:** import order matters. Tailwind must be imported before HeroUI styles.

### Project implication

The project documents previously warned that React 18 + Tailwind 3 blocked safe direct HeroUI adoption. That warning was correct historically. However, the current project context says React 19, Tailwind CSS v4, and HeroUI infrastructure were completed locally. Therefore, before any new UI task, Claude Code must verify the local repository state:

```bash
cd dashboard
node -p "require('./package.json').dependencies.react"
node -p "require('./package.json').dependencies['@heroui/react']"
node -p "require('./package.json').dependencies['@heroui/styles']"
node -p "require('./package.json').devDependencies.tailwindcss || require('./package.json').dependencies.tailwindcss"
npm ls @heroui/react @heroui/styles react react-dom tailwindcss
```

If `@heroui/react` is not exactly `3.0.3` or resolves to a different version, stop and report.

---

## 3. Official design principles to use

HeroUI v3 emphasizes:

1. Semantic intent over visual style.
2. Accessibility as foundation.
3. Composition over configuration.
4. Progressive disclosure.
5. Predictable behavior.
6. Type safety first.
7. Separation of styles and logic.
8. Developer experience.
9. Complete customization.
10. Open/extensible component wrapping.

### Smart Farm interpretation

For this dashboard, these principles mean:

- Use semantic component variants (`primary`, `secondary`, `tertiary`, `danger`, `success`, `warning`) instead of random Tailwind color classes.
- Keep deterministic analytics visually authoritative.
- Keep Gemini visibly interpretive.
- Never polish away missing data, low reliability, QC failures, stale measurements, or upload staleness.
- Build shared wrappers first, then page redesigns.
- Avoid direct HeroUI imports in feature pages unless local exports are verified and wrappers already define the visual contract.

---

## 4. Official component facts relevant to this dashboard

### 4.1 Card

Official import:

```ts
import { Card } from "@heroui/react";
```

Official anatomy uses dot notation:

```tsx
<Card>
  <Card.Header>
    <Card.Title />
    <Card.Description />
  </Card.Header>
  <Card.Content />
  <Card.Footer />
</Card>
```

Official semantic variants:

```text
transparent | default | secondary | tertiary
```

Dashboard use:

- AppShell panels
- KPI cards
- chart cards
- alert cards
- table containers
- deterministic analytics cards
- Gemini interpretation cards, with separate visual treatment

### 4.2 Button

Official import:

```ts
import { Button } from "@heroui/react";
```

Official documented patterns include variants, icon-only buttons, and loading states.

Dashboard use:

- Primary action: Download/export, Start/End irrigation, Save, Generate insight.
- Secondary action: Filter, Sort, Reset, View logs.
- Tertiary/ghost action: header icon buttons and compact toolbar controls.
- Danger action: delete/remove only where allowed by existing product logic.

### 4.3 Chip

Official import:

```ts
import { Chip } from "@heroui/react";
```

Official purpose: small informational badges for labels, statuses, and categories.

Dashboard use:

- severity chips: info/warning/error/critical
- reliability chips: high/medium/low/invalid
- domain chips: sensor/system/upload/agronomic
- node chips: MAIN/N2/N3
- QC flags
- deterministic-vs-AI labels

### 4.4 Table

Official import:

```ts
import { Table } from "@heroui/react";
```

Official anatomy:

```tsx
<Table>
  <Table.ScrollContainer>
    <Table.Content aria-label="Example table">
      <Table.Header>
        <Table.Column>Name</Table.Column>
      </Table.Header>
      <Table.Body>
        <Table.Row>
          <Table.Cell>Kate Moore</Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table.Content>
  </Table.ScrollContainer>
  <Table.Footer />
</Table>
```

Official documented capabilities include sorting, selection, custom cells, expandable rows, pagination, resizing, empty state, async loading, virtualization, and TanStack Table rendering integration.

Dashboard use:

- Logs/events table
- Upload history table
- Processed Data Viewer table
- diagnostics summary tables
- agronomic history tables

**Important:** do not migrate dense tables first. The table API is powerful, but dense diagnostic behavior is high-risk. Use wrappers and a reference table first.

### 4.5 Drawer

Official import:

```ts
import { Drawer, Button } from "@heroui/react";
```

Official anatomy:

```tsx
<Drawer>
  <Button>Open Drawer</Button>
  <Drawer.Backdrop>
    <Drawer.Content>
      <Drawer.Dialog>
        <Drawer.Handle />
        <Drawer.CloseTrigger />
        <Drawer.Header>
          <Drawer.Heading />
        </Drawer.Header>
        <Drawer.Body />
        <Drawer.Footer />
      </Drawer.Dialog>
    </Drawer.Content>
  </Drawer.Backdrop>
</Drawer>
```

Dashboard use:

- Processed Data Viewer
- event detail drawer
- reading/raw payload detail
- mobile filters
- contextual inspection panels

### 4.6 Tabs

Official import:

```ts
import { Tabs } from "@heroui/react";
```

Official anatomy uses `Tabs.ListContainer`, `Tabs.List`, `Tabs.Tab`, `Tabs.Indicator`, and `Tabs.Panel`.

Dashboard use:

- Overview segmented controls only if behavior is already tab-like.
- Avoid using tabs as decorative pills if content is not actually tabbed.

### 4.7 Input

Official import:

```ts
import { Input } from "@heroui/react";
```

Input is a primitive single-line text input and accepts standard HTML attributes. Official docs point to TextField for validation, labels, and error messages.

Dashboard use:

- search box
- filter text fields
- compact toolbar search

---

## 5. Existing project docs alignment audit

### Correct existing decisions

The previous project documents are directionally correct in these areas:

- Staged migration is required.
- React/Tailwind compatibility must be verified before HeroUI adoption.
- Shared primitives/wrappers are safer than page-level direct HeroUI imports.
- UI migration must not touch analytics, Gemini, backend, schema, firmware, hooks, API, or chart data transforms.
- Direct named exports from `@heroui/react` must be verified against installed local package/types.
- Missing/QC/reliability states must stay visible.

### Required corrections / updates

Some older docs say compatibility is blocked because the project had React 18 and Tailwind 3. That is now stale if the local repository has already completed React 19 and Tailwind v4 upgrades. Update those docs to say:

```text
Historical status: React 18/Tailwind 3 blocked HeroUI v3.
Current required verification: confirm local package.json/package-lock resolve React 19+, Tailwind CSS v4, @heroui/react 3.0.3, and @heroui/styles 3.0.3 before any direct HeroUI import or page migration.
```

Do not delete the old warning entirely; keep it as historical rationale.

---

## 6. Non-negotiable version guard

Every UI implementation prompt must include this command block:

```bash
cd dashboard
node -p "require('./package.json').dependencies['@heroui/react']"
node -p "require('./package.json').dependencies['@heroui/styles']"
npm ls @heroui/react @heroui/styles
```

Expected:

```text
@heroui/react@3.0.3
@heroui/styles@3.0.3
```

Stop if:

- package is missing;
- version is not 3.0.3;
- npm resolves a different transitive version;
- TypeScript exports do not match the component imports planned for the task.

---

## 7. Recommended migration posture

Use this order:

1. Docs and visual blueprint.
2. Local package/type/export verification.
3. Shared primitive wrappers.
4. AppShell visual frame.
5. Overview reference implementation.
6. Chart cards and KPI cards.
7. Tables/drawers.
8. Diagnostics/Processed Viewer/Agronomy surfaces.
9. Accessibility/mobile hardening.

Do not repeat broad Stage 6A-style page edits without this guide.
