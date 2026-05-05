# UX Wireframes — Text Layout

All layouts are described in ASCII for technology-neutral review. Proportions are approximate.
Responsive breakpoints: Desktop ≥ 1024px · Tablet 768–1023px · Mobile < 768px.

---

## Global Shell

```
╔══════════════════════════════════════════════════════════════════════╗
║  SIDEBAR (240px)          │  TOP BAR (full width, 56px tall)        ║
║  ┌──────────────────┐     │  ┌──────────────────────────────────┐   ║
║  │  ≡  Smart Farm   │     │  │ [Page Title]          [UTC ▾] [?]│   ║
║  ├──────────────────┤     │  └──────────────────────────────────┘   ║
║  │  ● Overview      │     │                                          ║
║  │  ▾ Soil          │     │  CONTENT AREA                           ║
║  │    ○ Pivot 1     │     │                                          ║
║  │    ○ Pivot 2     │     │                                          ║
║  │    ○ Comparison  │     │                                          ║
║  │  ○ Weather       │     │                                          ║
║  │  ▾ Diagnostics   │     │                                          ║
║  │    ○ Uploads     │     │                                          ║
║  │    ○ Logs/Events │     │                                          ║
║  │    ○ Sys Health  │     │                                          ║
║  │  ○ Settings      │     │                                          ║
║  └──────────────────┘     │                                          ║
╚══════════════════════════════════════════════════════════════════════╝
```

**Mobile:** Sidebar collapses to icon rail (48px). Hamburger menu expands it as overlay.
**Tablet:** Sidebar collapses to icon rail by default; user can pin it open.

Top bar: Page title (left) · Time zone selector (right) · Help icon (far right).
Time zone selector defaults to UTC. Affects all displayed timestamps.

---

## 1. Overview Page

```
┌─────────────────────────────────────────────────────────────────────┐
│  SYNC STATUS BAR                                                    │
│  ● Last upload: 2026-04-25 10:30 UTC (4h ago)   [Normal]           │
│  ⚠ No upload in the last 24h — check device     [Warning if stale] │
├────────────┬────────────┬────────────┬────────────┬────────────────┤
│ KPI CARD   │ KPI CARD   │ KPI CARD   │ KPI CARD   │ KPI CARD       │
│ P1 Moisture│ P1 Temp    │ P2 Moisture│ P2 Temp    │ Air Temp       │
│   38.2 %   │  21.4 °C   │  41.0 %   │  20.8 °C   │  24.3 °C       │
│ ~~sparkline│ ~~sparkline│ ~~sparkline│ ~~sparkline│ ~~sparkline    │
│ ↑ +2%      │ → stable   │ ↓ −3%     │ → stable   │ ↑ +1.2°       │
├────────────┴────────────┴────────────┴────────────┴────────────────┤
│ KPI CARD        │ KPI CARD                                          │
│ Air Humidity    │ Air Pressure                                      │
│ 48.5 %          │ 1012.8 hPa                                        │
│ ~~sparkline     │ ~~sparkline                                        │
├─────────────────┴───────────────────────────────────────────────────┤
│  NODE STATUS                                                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │ PIVOT 1      │  │ PIVOT 2      │  │ WEATHER      │              │
│  │ (MAIN)       │  │ (N2)         │  │ (N3)         │              │
│  │ ● Online     │  │ ● Online     │  │ ● Online     │              │
│  │ 10:00 UTC    │  │ 09:50 UTC    │  │ 10:00 UTC    │              │
│  │ Status: ok   │  │ Status: ok   │  │ Status: ok   │              │
│  │ RSSI: —      │  │ RSSI: −94   │  │ RSSI: −90   │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
├─────────────────────────────────────────────────────────────────────┤
│  RECENT ALERTS (last 5 events, severity ≥ warning)                  │
│  ⚠ 09:40  N2  node_missing       NODE_TIMEOUT                       │
│  ⚠ 09:30  —   false_button_wake  4-click timeout: only 2 clicks    │
│  ✕ 08:20  MAIN sensor_error      LOCAL_RS485_TIMEOUT                │
│  [View all logs →]                                                  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. Pivot Soil Page (Pivot 1 and Pivot 2 — same layout)

```
┌─────────────────────────────────────────────────────────────────────┐
│  PAGE HEADER: Pivot 1 — Local Soil (MAIN node)                      │
│  [24h] [7d] [30d] [Custom ▾]            Showing: Apr 18–Apr 25     │
├─────────────────────────────────────────────────────────────────────┤
│  STAT PILLS (latest reading)                                        │
│  Moisture: 38.2%  │  Temp: 21.4 °C  │  EC: 1450 µS/cm  │ ok       │
├─────────────────────────────────────────────────────────────────────┤
│  CHART: Soil Moisture %                             [expand ↗]      │
│  100%├─────────────────────────────────────────────────────────    │
│      │                  ____                                         │
│   50%│  ________/\/\/\/    \___/\/\/\/\____                         │
│      │             ● error marker                                    │
│    0%└──────────────────────────────────────────────────────────── │
│       Apr 18    Apr 19    Apr 20    Apr 21    Apr 22  Apr 25        │
│       [gap ████ = missing data]                                     │
├─────────────────────────────────────────────────────────────────────┤
│  CHART: Soil Temperature °C               (same width as above)     │
├─────────────────────────────────────────────────────────────────────┤
│  CHART: Soil EC µS/cm                     (same width as above)     │
├─────────────────────────────────────────────────────────────────────┤
│  DAILY SUMMARY TABLE                                                │
│  Date      │ Moisture avg/min/max │ Temp avg/min/max │ EC avg      │
│  Apr 25    │ 38.4 / 35.1 / 42.0  │ 21.1/20.0/22.5  │ 1445        │
│  Apr 24    │ 40.1 / 37.2 / 43.5  │ 20.8/19.5/22.1  │ 1438        │
│  ...                                                                │
├─────────────────────────────────────────────────────────────────────┤
│  STATUS BREAKDOWN (bar per day)                                     │
│  Apr 25: ████████████████ ok(138) ▓▓ partial(4) ░░ missing(2)      │
└─────────────────────────────────────────────────────────────────────┘
```

**Pivot 2 only — additional section below status breakdown:**
```
│  LORA SIGNAL QUALITY                                                │
│  RSSI (dBm): −90 avg  │  SNR (dB): +8.1 avg                        │
│  [RSSI chart — line over time]                                      │
│  [SNR chart — line over time]                                       │
```

---

## 3. Pivot Comparison Page

```
┌─────────────────────────────────────────────────────────────────────┐
│  Pivot Comparison                                                   │
│  [24h] [7d] [30d] [Custom ▾]           ── Pivot 1  ── Pivot 2      │
├─────────────────────────────────────────────────────────────────────┤
│  DELTA PANEL (latest values)                                        │
│  Moisture: P1 38.2% vs P2 41.0% → P2 is 2.8% wetter              │
│  Temp:     P1 21.4°C vs P2 20.8°C → P1 is 0.6°C warmer           │
│  EC:       P1 1450 vs P2 1480 → similar                            │
├─────────────────────────────────────────────────────────────────────┤
│  CHART: Soil Moisture Comparison                                    │
│  ──── Pivot 1 (blue solid)                                          │
│  ─ ─ Pivot 2 (green dashed)                                         │
│  [chart body, shared Y-axis 0–100%]                                 │
├─────────────────────────────────────────────────────────────────────┤
│  CHART: Soil Temperature Comparison                                 │
│  [same dual-line format]                                            │
├─────────────────────────────────────────────────────────────────────┤
│  CHART: Soil EC Comparison                                          │
│  [same dual-line format]                                            │
├─────────────────────────────────────────────────────────────────────┤
│  SCATTER: Soil Moisture vs Air Temperature  [only for range ≥ 7d]  │
│  ● Pivot 1 (blue)   ● Pivot 2 (green)                              │
│  X: Air temp (°C)   Y: Soil moisture (%)                           │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 4. Logs / Events Page

```
┌─────────────────────────────────────────────────────────────────────┐
│  Logs / Events                                                      │
├─────────────────────────────────────────────────────────────────────┤
│  FILTERS                                                            │
│  Severity: [INFO ✓] [WARN ✓] [ERROR ✓] [CRITICAL ✓]               │
│  Node:     [All ▾]   Event type: [All ▾]   Error code: [All ▾]     │
│  Date:     [Apr 18 ▾] to [Apr 25 ▾]    Upload ID: [_________]      │
│                                          [Clear filters]  [Export ↓]│
├─────────────────────────────────────────────────────────────────────┤
│  MINI HISTOGRAM (events/day by severity)                            │
│  ████ Apr 18  ██ Apr 19  ████ Apr 20  █ Apr 21  ██ Apr 22  █ Apr 25│
│  (red=error, orange=warn, grey=info, dark=critical)                 │
├──────────┬──────────┬────────┬──────────────────────┬──────────────┤
│ Time     │ Severity │ Node   │ Event Type           │ Message      │
├──────────┼──────────┼────────┼──────────────────────┼──────────────┤
│ 10:00:39 │ ● INFO   │ N3     │ packet_received      │ Weather pac… │
│ 10:00:15 │ ● INFO   │ —      │ upload_success       │ Upload succe…│
│ 10:00:00 │ ● INFO   │ —      │ upload_started       │ Manual uploa…│
│ 09:50:20 │ ⚠ WARN  │ —      │ rtc_drift_detected   │ RTC drift ex…│
│ 09:40:05 │ ✕ ERROR  │ MAIN   │ sensor_error         │ Local RS485 …│
│▶ 09:30:00│ ⚠ WARN  │ N2     │ node_missing         │ Node N2 did …│
├──────────┴──────────┴────────┴──────────────────────┴──────────────┤
│  ▼ EXPANDED ROW (node_missing for N2)                               │
│  event_id:   EVT-GW01-20260425-093000-002                           │
│  error_code: NODE_TIMEOUT                                           │
│  upload_id:  UPL-GW01-20260425-103000                               │
│  details:    {}                                                     │
│  message:    Node N2 did not transmit during expected window        │
│  [View nearby Pivot 2 readings →]  [Filter by this upload_id →]    │
├─────────────────────────────────────────────────────────────────────┤
│  ← Prev     Page 1 of 8     Next →         50 per page             │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 5. System Health Page

```
┌─────────────────────────────────────────────────────────────────────┐
│  System Health                                                      │
├───────────────────────┬─────────────────────────────────────────────┤
│  GATEWAY              │  NODES                                      │
│  GW01                 │  ┌──────┐  ┌──────┐  ┌──────┐             │
│  Firmware: gw-1.0.0   │  │ MAIN │  │  N2  │  │  N3  │             │
│  Last upload: 10:30   │  │ soil │  │ soil │  │ wthr │             │
│  Last seen:  10:30    │  │ ok   │  │ ok   │  │ ok   │             │
│                       │  │seq:— │  │seq:124│ │seq:4511│           │
│                       │  └──────┘  └──────┘  └──────┘             │
├───────────────────────┴─────────────────────────────────────────────┤
│  RSSI TREND — N2 (green) & N3 (amber)         [7d ▾]               │
│  [dual-line chart]                                                  │
├─────────────────────────────────────────────────────────────────────┤
│  SNR TREND — N2 & N3                                                │
│  [dual-line chart]                                                  │
├─────────────────────────────────────────────────────────────────────┤
│  ERROR CODE FREQUENCY (last 30d)                                    │
│  LOCAL_RS485_TIMEOUT      ████████████████  144                     │
│  NODE_TIMEOUT             ████             12                       │
│  BME280_NOT_FOUND         ██               3                        │
│  PACKET_PARSE_FAILED      █                1                        │
├─────────────────────────────────────────────────────────────────────┤
│  SEVERITY DISTRIBUTION    BOOT EVENTS (last 30d)                   │
│  [donut chart]            rtc_lost_power:    2                      │
│  INFO    84%              rtc_drift_detected: 5                     │
│  WARNING 12%              lora_init_failed:   0                     │
│  ERROR    4%              rtc_sync_applied:   5                     │
│  CRITICAL 0%                                                        │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Responsive Notes

**Mobile (< 768px):**
- Sidebar collapses to hamburger; content takes full width
- KPI cards on Overview wrap to 2-column grid (not 5-column)
- Charts: pinch-to-zoom enabled; time-range selector moves above chart
- Comparison page: Pivot 1 and Pivot 2 charts shown sequentially, not side-by-side
- Table columns: hide Node and Upload ID; show only Time + Severity + Event Type + expand button

**Tablet (768–1023px):**
- Sidebar is icon rail (48px) by default; user can pin
- KPI cards: 3-column grid
- Comparison chart: side-by-side maintained if viewport > 900px

**Desktop (≥ 1024px):**
- Sidebar pinned at 240px
- All charts full width within content area
- Comparison page: pivots share one chart frame with dual lines

**Chart interaction (all breakpoints):**
- Hover tooltip: shows exact value, timestamp, status, node_id
- Click on anomaly marker: opens nearest event row in inline panel (not page navigation)
- Range zoom: drag on chart to zoom in; reset button top-right of chart


---

# Revision Addendum — Mobile-First Agronomic UX

## Mobile Home Priority

On phones, the first screen should prioritize daily field actions:

```text
Top mobile cards:
1. Last Upload / Last Sync
2. Current irrigation state
3. Latest Pivot 1 moisture
4. Latest Pivot 2 moisture
5. Recent warning
```

## Irrigation UX

A single “Done” button is not sufficient because irrigation has a start time and duration.

Recommended component:

```text
Irrigation Quick Card
┌─────────────────────────────┐
│ Irrigation                  │
│ Status: Not running         │
│ [Start irrigation]          │
│ [Backfill irrigation]       │
└─────────────────────────────┘
```

When active:

```text
┌─────────────────────────────┐
│ Irrigation running          │
│ Started: 06:10              │
│ Duration: 01h 12m           │
│ Target: Both pivots         │
│ [End irrigation]            │
└─────────────────────────────┘
```

Backfill form:

```text
Date
Start time
End time OR duration
Target scope
Notes
[Save]
```

## Cutting UX

Cutting is periodic and should not dominate the mobile home.

Place under:

```text
Agronomy → Cutting & Yield
```

Show reminder cards only when due:

```text
Cutting may be due soon — 24 days since last cutting.
[Record cutting]
```

## Yield UX

After a cutting is recorded:

```text
Yield missing for cutting #N.
[Enter yield]
```

Yield entry should support estimated values.

## Season Setup UX

Low-frequency form. Do not place on main dashboard.

Fields:
- planting date
- emergence date
- season start
- season end
- soil type
- optional moisture calibration thresholds

## Field Notes UX

Mobile quick action:

```text
[Add field note]
```

Minimal fields:
- note type
- target scope
- severity
- note text
- timestamp defaults to now

## Mobile Navigation Update

```text
Bottom navigation or mobile drawer:
- Home
- Irrigation
- Soil
- Agronomy
- Logs
```

The desktop sidebar can keep the full hierarchy.
