# Interaction Flows

## 1. Purpose

This document defines the user interaction flows for the Smart Farm IoT Dashboard.

It focuses on how a farm operator or engineer interacts with the dashboard, especially on mobile devices.

The flows are designed around the system's three separated data domains:

1. Sensor data
2. Manual agronomic events
3. System logs and diagnostics

This document does not define backend schemas. It describes user journeys, UI behavior, validation, and expected results.

---

## 2. Core UX Principles

```text
1. Daily field actions must be fast on mobile.
2. Sensor data must remain separate from manual events.
3. Technical logs must remain separate from agronomic operations.
4. Time must be shown in local/farm time.
5. Every manual event must have a clear timestamp.
6. All forms must allow correction/backfill.
7. The dashboard must never hide missing data or failed uploads.
```

---

## 3. User Roles

| Role | Main actions |
|---|---|
| Farm operator | Record irrigation, cutting, fertilization, yield, notes |
| Field technician | Review logs, troubleshoot missing nodes, check uploads |
| System engineer | Inspect raw timing, system events, node health |
| Project owner | Review productivity, crop history, dashboard status |

---

# PART A — Daily Mobile Flows

---

## 4. Flow: Open Dashboard on Phone

## Goal

Quickly answer:

```text
Is the system current?
Was data uploaded?
What is the latest field condition?
Do I need to record irrigation?
```

## Entry

User opens dashboard on mobile.

## Screen

Mobile Home / Overview.

## UI shows

```text
- Last upload time
- Latest measurement time
- Current timezone
- Pivot 1 latest moisture
- Pivot 2 latest moisture
- Current irrigation status
- Recent warning if any
```

## Expected behavior

If data is stale:

```text
Show warning:
"Last upload was more than 24h ago. Dashboard may not contain latest SD data."
```

If measurement is stale:

```text
Show warning:
"No recent field measurement received."
```

These warnings must be separate.

---

## 5. Flow: Start Irrigation

## Goal

Record exact irrigation start time.

## Entry points

- Mobile Home irrigation card
- Daily Operations page
- Floating quick action button if enabled

## Steps

```text
1. User taps "Start Irrigation".
2. UI opens confirmation sheet.
3. User selects target scope:
   - Pivot 1
   - Pivot 2
   - Both pivots
   - Unknown
4. Timestamp defaults to current local time.
5. User may edit timestamp if needed.
6. User optionally adds note.
7. User taps "Start".
8. System creates irrigation_session with started_at.
9. UI shows active irrigation timer.
```

## Required fields

| Field | Required | Default |
|---|---:|---|
| target_scope | yes | both_pivots |
| started_at | yes | now |
| confidence | yes | exact |
| notes | no | empty |

## Result

Create agronomic event:

```text
event_category = irrigation
event_type = irrigation_session
started_at = selected time
ended_at = null
```

## UI after success

```text
Irrigation running
Started: 06:10
Duration: 00h 01m
[End irrigation]
```

---

## 6. Flow: End Irrigation

## Goal

Record exact irrigation end time and duration.

## Entry

Active irrigation card.

## Steps

```text
1. User taps "End Irrigation".
2. Timestamp defaults to current local time.
3. User may edit end time.
4. User adds optional note.
5. User taps "Save".
6. System updates the active irrigation event with ended_at.
7. UI shows completed irrigation summary.
```

## Validation

```text
ended_at must be after started_at.
If not, show error and prevent save.
```

## Result

Event becomes complete:

```text
started_at = irrigation start
ended_at = irrigation end
details.duration_min = calculated duration
```

## UI after success

```text
Irrigation completed
06:10 → 08:00
Duration: 1h 50m
```

---

## 7. Flow: Backfill Irrigation

## Goal

Allow operator to enter irrigation after it happened.

This is required because field work may happen without opening the dashboard at the exact moment.

## Entry points

- Daily Operations page
- Irrigation card: "Backfill irrigation"
- Agronomy history page

## Steps

```text
1. User taps "Backfill irrigation".
2. User selects date.
3. User enters start time.
4. User enters end time OR duration.
5. User selects target scope.
6. User optionally enters notes.
7. User marks time confidence:
   - exact
   - estimated
8. User saves.
```

## Validation

```text
- start time required
- either end time or duration required
- end time must be after start time
- target scope required
```

## Result

Create completed irrigation_session.

## UI after success

```text
Show irrigation marker on charts.
Show in irrigation history.
Update reminders.
```

---

## 8. Flow: Add Field Note

## Goal

Record any field observation with time and location.

## Entry points

- Mobile Home quick action
- Field Notes page
- Chart context menu later

## Steps

```text
1. User taps "Add field note".
2. Select note type.
3. Select target scope.
4. Select severity.
5. Timestamp defaults to now.
6. User writes note.
7. User saves.
```

## Note types

```text
general
damage
disease_suspected
pest_suspected
yellowing
equipment_issue
irrigation_issue
weather_damage
other
```

## Result

Create agronomic event:

```text
event_category = field_note
event_type = field_observation
```

## Display

- Field Notes timeline
- Optional chart marker
- Not shown in technical Logs / Events table

---

# PART B — Season Setup Flows

---

## 9. Flow: Enter Planting Date

## Goal

Create crop timeline baseline.

## Entry

Field Setup / Season page.

## Steps

```text
1. User opens Field Setup.
2. User selects Planting Date.
3. Timestamp defaults to date-only, optional time.
4. User optionally enters variety or planting method.
5. User saves.
```

## Result

Create event:

```text
event_category = season_setup
event_type = planting_date
```

## Follow-up reminder

If emergence date is missing after configured days:

```text
"Has emergence started?"
```

---

## 10. Flow: Enter Emergence Date

## Important clarification

Emergence happens after planting only.

It is not repeated after every cutting.

After cutting, the correct concept is regrowth.

## Steps

```text
1. User opens Field Setup.
2. User selects Emergence Date.
3. User enters date.
4. User optionally selects confidence.
5. User saves.
```

## Result

Create event:

```text
event_type = emergence_date
```

## Dashboard use

- establishment timeline
- emergence suitability chart
- days after planting

---

## 11. Flow: Enter Season Start

## Goal

Define production season window.

## Steps

```text
1. User opens Field Setup.
2. User enters season start date.
3. User saves.
```

## Result

Create event:

```text
event_type = season_start
```

---

## 12. Flow: Enter Season End

## Goal

Close season later.

## Rule

Season end is often unknown at the start, so it must be optional.

## Steps

```text
1. User opens Field Setup.
2. User selects Season End.
3. User enters date.
4. User optionally adds reason.
5. User saves.
```

## Result

Create event:

```text
event_type = season_end
```

---

## 13. Flow: Enter Soil Type / Calibration

## Goal

Improve moisture interpretation.

## Entry

Field Setup / Season page.

## Steps

```text
1. User selects target scope:
   - farm
   - Pivot 1
   - Pivot 2
2. User selects soil texture if known.
3. User optionally enters:
   - field capacity
   - refill point
   - wilting point
4. User saves.
```

## Validation

If thresholds are entered:

```text
wilting_point < refill_point < field_capacity
```

## Result

Create or update soil_type season_setup event.

## Dashboard behavior

If calibration exists:

```text
Moisture charts show safe/refill/too wet zones.
```

If not:

```text
Dashboard shows trend only, not absolute irrigation judgment.
```

---

# PART C — Periodic Agronomy Flows

---

## 14. Flow: Record Cutting

## Goal

Record alfalfa cutting date and cutting number.

## Entry

- Cutting & Yield page
- Reminder card when due

## Steps

```text
1. User taps "Record cutting".
2. Date/time defaults to now.
3. System suggests cutting number = previous cutting + 1.
4. User confirms or edits cutting number.
5. User optionally adds notes.
6. User saves.
```

## Result

Create event:

```text
event_category = cutting
event_type = cutting
```

## After success

Dashboard creates reminder:

```text
"Enter yield for cutting #N"
```

## Display

- Cutting timeline
- Regrowth view
- Chart marker
- Cutting interval counter

---

## 15. Flow: Enter Yield Per Cutting

## Goal

Record production after each cutting.

## Rule

Yield is recorded per cutting. Season yield is calculated from all cutting yields.

## Entry

- Cutting & Yield page
- Reminder after cutting
- Cutting detail panel

## Steps

```text
1. User selects cutting number.
2. User enters yield value.
3. User selects unit:
   - ton
   - kg
   - bales
   - custom
4. User marks confidence:
   - exact
   - estimated
5. User optionally adds notes.
6. User saves.
```

## Result

Create event:

```text
event_category = yield
event_type = yield_per_cutting
```

## Display

- yield bar chart
- cumulative season yield
- cutting detail view

---

## 16. Flow: Record Fertilization

## Goal

Record fertilizer application and explain later EC changes.

## Entry

- Fertilization page
- Agronomy quick action
- Optional EC chart context

## Steps

```text
1. User taps "Record fertilization".
2. Select date/time.
3. Select target scope.
4. Select fertilizer type.
5. Enter product name if known.
6. Enter amount and unit if known.
7. Select application method.
8. Mark as regular or exceptional.
9. If exceptional, enter reason.
10. Save.
```

## Validation

```text
If is_regular = false:
  reason is required
```

## Result

Create event:

```text
event_category = fertilization
event_type = fertilization
```

## Display

- Fertilization timeline
- EC chart overlay marker
- Fertilization impact window later

---

# PART D — Sensor and Chart Flows

---

## 17. Flow: View Pivot Soil Page

## Goal

Inspect sensor values for one pivot.

## Steps

```text
1. User opens Pivot 1 or Pivot 2.
2. Select time range.
3. Dashboard loads sensor readings.
4. Dashboard loads agronomic overlays for matching pivot.
5. Dashboard loads technical event markers for matching node.
6. Chart renders separate layers:
   - sensor line
   - agronomic overlays
   - technical error markers
```

## Important separation

```text
Sensor values come from sensor_readings.
Irrigation/cutting/fertilization markers come from agronomic_events.
Errors come from system_events.
```

## User actions

- Tap chart point → see measured value and measured time
- Tap irrigation band → open irrigation event detail
- Tap technical error marker → open log detail
- Tap field note marker → open note detail

---

## 18. Flow: View Pivot Comparison

## Goal

Compare Pivot 1 and Pivot 2 without mixing their identity.

## Steps

```text
1. User opens Pivot Comparison.
2. Select time range.
3. Dashboard loads MAIN and N2 soil readings.
4. Data is aligned by time for visualization only.
5. Lines remain separate.
```

## Rule

Never average Pivot 1 and Pivot 2 into a single soil value.

---

## 19. Flow: View Weather Context

## Goal

Understand shared environmental context.

## Steps

```text
1. User opens Weather page.
2. Dashboard loads N3 readings.
3. User sees air temp, humidity, pressure.
4. Weather can be used as overlay/context on soil analysis later.
```

## Rule

Weather is shared context, not assigned to Pivot 1 or Pivot 2.

---

# PART E — Diagnostics Flows

---

## 20. Flow: Investigate Missing Data

## Goal

Find why a chart has a gap.

## Steps

```text
1. User sees gap in soil chart.
2. User taps missing marker.
3. Dashboard opens related technical event or Logs page.
4. Logs filter automatically:
   node_id = matching node
   time window = ±5 minutes
5. User sees node_missing / sensor_error / packet_parse_failed.
6. User can inspect event details.
```

## Result

User can trace chart anomaly back to technical cause.

---

## 21. Flow: Use Logs / Events

## Goal

Troubleshoot technical issues.

## Steps

```text
1. User opens Logs / Events.
2. Select severity filter.
3. Select node or error code.
4. Expand row.
5. View details JSON.
6. Click "View nearby readings" if needed.
```

## Rule

Logs page shows only `system_events`.

Manual agronomic events do not appear here.

---

## 22. Flow: View Upload History

## Goal

Understand when data was transferred.

## Steps

```text
1. User opens Upload History.
2. Dashboard lists upload sessions.
3. User sees:
   - device upload start
   - server received time
   - readings count
   - events count
   - status
4. User expands row for raw summary.
5. User can filter logs by upload_id.
```

## Important message

Upload time is not measurement time.

The page should explicitly state:

```text
This page shows when data was transferred, not when measurements occurred.
```

---

## 23. Flow: System Health Review

## Goal

Engineer checks system reliability.

## Steps

```text
1. User opens System Health.
2. Checks gateway last upload.
3. Checks node last_seen.
4. Reviews RSSI/SNR trends.
5. Reviews error frequency.
6. Reviews RTC sync history.
```

---

# PART F — Reminder Flows

---

## 24. Flow: Daily Irrigation Reminder

## Trigger

No irrigation event recorded today.

## UI

Mobile Home / Daily Operations:

```text
No irrigation recorded today.
[Start irrigation] [Backfill]
```

## Rule

Do not say irrigation is required unless analytics/calibration supports it.

Use neutral wording:

```text
"No irrigation recorded today"
```

not:

```text
"You must irrigate"
```

---

## 25. Flow: Cutting Reminder

## Trigger

Days since last cutting exceeds configured threshold.

## UI

```text
24 days since last cutting.
[Record cutting]
```

## Rule

Do not force recommendation. Use soft language:

```text
"Cutting may be due soon"
```

---

## 26. Flow: Yield Reminder

## Trigger

Cutting exists but no yield_per_cutting event for the same cutting number.

## UI

```text
Yield missing for cutting #3.
[Enter yield]
```

---

## 27. Flow: Emergence Reminder

## Trigger

Planting date exists and emergence date missing after configured period.

## UI

```text
Planting was recorded 7 days ago.
Has emergence started?
[Enter emergence date]
```

---

# PART G — Editing and Correction Flows

---

## 28. Flow: Edit Manual Event

## Goal

Correct wrong time or details.

## Steps

```text
1. User opens agronomic event detail.
2. User taps Edit.
3. Existing fields are prefilled.
4. User changes values.
5. User saves.
6. Event updated_at changes.
```

## Rule

Do not delete history silently if audit is later needed. For first version, simple update is acceptable. Later, add audit trail.

---

## 29. Flow: Delete Manual Event

## Recommendation

Prefer soft delete later.

For first implementation:

```text
Show confirmation:
"Delete this manual event? This may affect chart overlays and reminders."
```

---

# PART H — Time and Localization Flow

---

## 30. Flow: Change Display Timezone

## Goal

Allow operator/engineer to switch between local and UTC display.

## Steps

```text
1. User opens Settings.
2. Select timezone:
   - farm local time
   - browser local time
   - UTC
3. Dashboard updates all displayed times.
4. API data remains unchanged.
```

## Rule

The UI must always state current timezone.

Example:

```text
All times shown in Africa/Algiers
```

---

# PART I — Final Interaction Rules

## 31. Non-Negotiable UX Rules

```text
1. Irrigation requires timing, not just a done button.
2. Manual events must be editable/backfillable.
3. Sensor readings, agronomic events, and logs remain separate.
4. Chart integration uses overlays, not mixed data arrays.
5. All displayed times are local/farm time by default.
6. UTC may be shown in debug mode.
7. Missing data must be visible.
8. Upload time must not be confused with measurement time.
9. Cutting yield is entered per cutting.
10. Emergence date is after planting only, not after every cutting.
```

---

## 32. Final Principle

```text
The dashboard must match how farm work happens in the field:
fast daily actions on mobile,
clear periodic workflows,
and strict separation between measurements, agronomy, and diagnostics.
```
