# HeroUI v3.0.3 Component Mapping Reference

**Project:** Smart Farm IoT Dashboard  
**Purpose:** Define exactly which HeroUI components map to which dashboard needs, and what must remain internal/wrapped.

---

## 1. Import rule

Feature pages should not import HeroUI directly by default.

Preferred:

```ts
import { Card, Button, Badge, SectionHeader } from '@/components/ui';
```

Allowed only inside wrappers after local export verification:

```ts
import { Card, Button, Chip, Table, Drawer, Tabs, Input } from '@heroui/react';
```

---

## 2. Component map

| Dashboard need | HeroUI component | Wrapper name | Migration priority | Notes |
|---|---|---|---|---|
| KPI/metric card | `Card` | `MetricCard` / `DashboardCard` | High | Use Card anatomy; preserve missing/reliability states. |
| Chart panel | `Card` | `ChartCard` | High | Keep chart logic outside wrapper. |
| Status/severity labels | `Chip` | `Badge` / `StatusChip` | High | Text + tone; no color-only meaning. |
| Toolbar buttons | `Button` | `Button` | High | Use semantic variants. |
| Search/filter input | `Input` | `SearchInput` | Medium | Use aria-label and controlled values. |
| Segmented controls | `Tabs` or internal segmented control | `SegmentedTabs` | Medium | Use Tabs only for real tabbed content. |
| Dense tables | `Table` | `DataTable` | Medium-Late | Start with one reference table; do not migrate all diagnostics at once. |
| Drawer/sheet | `Drawer` | `DrawerPanel` | Medium-Late | Good for Processed Data Viewer and detail panels. |
| Loading state | `Skeleton`, `Spinner` | `StateBlock` | Medium | Same size as final content to avoid layout shift. |
| Alerts | `Alert` or Card+Chip | `AlertBlock` | Medium | Must keep deterministic vs AI boundaries. |
| Avatar/icon user markers | `Avatar` | optional | Low | Mostly decorative for this project. |
| Dropdown filters | `Dropdown`, `Select` | `FilterDropdown` | Medium | Use only after verifying exports/types. |
| Scroll container | `ScrollShadow` | `ScrollArea` | Low-Medium | Useful for sidebar/drawers, but test mobile. |

---

## 3. Smart Farm wrapper contracts

### 3.1 DashboardCard

```ts
interface DashboardCardProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  footer?: React.ReactNode;
  variant?: 'default' | 'subtle' | 'elevated' | 'transparent';
  className?: string;
  children: React.ReactNode;
}
```

Rules:

- no data fetching;
- no analytics computation;
- no timestamp decisions;
- no Gemini logic;
- purely presentation.

### 3.2 MetricCard

```ts
interface MetricCardProps {
  label: string;
  value: string | number | null;
  unit?: string;
  sourceLabel?: string;
  timestampLabel?: string;
  reliability?: 'high' | 'medium' | 'low' | 'invalid' | 'unknown';
  trendLabel?: string;
  chart?: React.ReactNode;
}
```

Rules:

- render null as `—` or `Not available`;
- do not compute trends;
- do not invent percentages;
- show timestamp semantics in footer/support row.

### 3.3 StatusChip

```ts
interface StatusChipProps {
  tone: 'default' | 'info' | 'success' | 'warning' | 'danger' | 'neutral';
  children: React.ReactNode;
}
```

Recommended semantic mapping:

```text
ok -> success
partial -> warning
missing -> warning/neutral depending context
error -> danger
critical -> danger
high reliability -> success
medium reliability -> warning/info
low reliability -> warning
invalid reliability -> danger
```

### 3.4 ChartCard

```ts
interface ChartCardProps {
  title: string;
  description?: string;
  controls?: React.ReactNode;
  confidence?: React.ReactNode;
  children: React.ReactNode;
}
```

Rules:

- chart data supplied by page/hook layer;
- no data transforms in wrapper;
- wrapper can show confidence strip slot;
- subtitle should include time basis where needed.

### 3.5 DataTable

```ts
interface DataTableProps {
  'aria-label': string;
  toolbar?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
}
```

Rules:

- start with existing table behavior if HeroUI Table migration is risky;
- do not break filtering/pagination/export;
- mobile stacked-card fallback remains required.

### 3.6 DrawerPanel

```ts
interface DrawerPanelProps {
  trigger: React.ReactNode;
  title: string;
  description?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
  placement?: 'right' | 'bottom';
}
```

Rules:

- right drawer on desktop;
- bottom/near-fullscreen sheet on mobile;
- sticky header/footer;
- focus management and close control required.

---

## 4. Direct HeroUI API snippets to verify locally

### Card

```tsx
import { Card } from '@heroui/react';

<Card>
  <Card.Header>
    <Card.Title>Title</Card.Title>
    <Card.Description>Description</Card.Description>
  </Card.Header>
  <Card.Content>Content</Card.Content>
  <Card.Footer>Footer</Card.Footer>
</Card>
```

### Button

```tsx
import { Button } from '@heroui/react';

<Button variant="primary" onPress={handlePress}>Download</Button>
<Button variant="tertiary" aria-label="Search">...</Button>
<Button variant="danger">Delete</Button>
```

### Chip

```tsx
import { Chip } from '@heroui/react';

<Chip variant="success" size="sm">High reliability</Chip>
<Chip variant="warning" size="sm">Missing data</Chip>
<Chip variant="danger" size="sm">Error</Chip>
```

### Table

```tsx
import { Table } from '@heroui/react';

<Table>
  <Table.ScrollContainer>
    <Table.Content aria-label="Recent system events">
      <Table.Header>
        <Table.Column>Time</Table.Column>
        <Table.Column>Severity</Table.Column>
      </Table.Header>
      <Table.Body>
        <Table.Row>
          <Table.Cell>2026-05-06</Table.Cell>
          <Table.Cell>Warning</Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table.Content>
  </Table.ScrollContainer>
</Table>
```

### Drawer

```tsx
import { Drawer, Button } from '@heroui/react';

<Drawer>
  <Button>View processed data</Button>
  <Drawer.Backdrop>
    <Drawer.Content>
      <Drawer.Dialog>
        <Drawer.CloseTrigger />
        <Drawer.Header>
          <Drawer.Heading>Processed data lineage</Drawer.Heading>
        </Drawer.Header>
        <Drawer.Body>{children}</Drawer.Body>
        <Drawer.Footer>{footer}</Drawer.Footer>
      </Drawer.Dialog>
    </Drawer.Content>
  </Drawer.Backdrop>
</Drawer>
```

### Tabs

```tsx
import { Tabs } from '@heroui/react';

<Tabs>
  <Tabs.ListContainer>
    <Tabs.List aria-label="Overview sections">
      <Tabs.Tab id="overview">Overview</Tabs.Tab>
      <Tabs.Tab id="alerts">Alerts</Tabs.Tab>
    </Tabs.List>
  </Tabs.ListContainer>
  <Tabs.Panel id="overview">...</Tabs.Panel>
  <Tabs.Panel id="alerts">...</Tabs.Panel>
</Tabs>
```

---

## 5. Anti-patterns

Do not do this:

```tsx
// Bad: direct import in a feature page before local export/type check
import { CardBody, CardHeader, Chip } from '@heroui/react';
```

Do this instead:

```tsx
// Good: local wrapper hides library details
import { DashboardCard, StatusChip } from '@/components/ui';
```

Do not do this:

```tsx
// Bad: UI wrapper computes reliability
const score = computeReliability(readings);
```

Do this instead:

```tsx
// Good: reliability is passed from deterministic layer
<StatusChip tone={toneFromReliability(level)}>{label}</StatusChip>
```

Do not do this:

```tsx
// Bad: missing values hidden for aesthetics
{value || 0}
```

Do this:

```tsx
{value == null ? '—' : formatMetric(value)}
```

---

## 6. Migration sequence by component risk

### Low risk

- Button wrapper
- Chip/Badge wrapper
- Card wrapper
- SectionHeader wrapper
- StateBlock wrapper

### Medium risk

- AppShell sidebar/topbar
- Overview KPI cards
- Chart card containers
- filter/search bars

### High risk

- Logs table
- Processed Data Viewer table/drawer
- System Health dense panels
- Agronomic intelligence panel
- Gemini panel

High-risk surfaces must be migrated one at a time.
