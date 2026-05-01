# Agronomic Manual Events — Alfalfa Context Layer

## Purpose

This document defines the manual agronomic context layer for the alfalfa dashboard.

These records are **not sensor readings** and they are **not firmware/system debug logs**. They are operator-entered field events used to interpret the IoT data correctly.

They answer questions that sensors alone cannot answer:

- When was the crop planted?
- When did emergence start?
- When did irrigation actually start and end?
- When was cutting performed?
- Was fertilizer applied?
- What was the yield per cutting?
- Did the operator observe damage, disease, unusual color, equipment failure, or any field issue?

This layer turns the dashboard from a monitoring UI into an alfalfa decision-support system.

---

## Core Design Rule

Manual agronomic records must be stored separately from:

1. `sensor_readings`
2. technical `system_events`

Recommended logical group:

```text
agronomic_events
```

If the current backend does not yet contain this table, it should be added as a future schema extension.

---

## Event Categories

| Category | Frequency | Examples | UX Priority |
|---|---:|---|---|
| `season_setup` | once / rarely | planting date, emergence date, season start/end, soil type | settings-style page |
| `irrigation` | daily or near-daily | irrigation start/end, duration, notes | fast mobile entry |
| `cutting` | every ~20+ days | cutting date, cutting number, yield prompt | periodic workflow |
| `fertilization` | occasional / repeated | fertilizer type, amount, reason | operations form |
| `yield` | after each cutting + season summary | yield per cutting, total yield | performance page |
| `field_note` | anytime | damage, disease, equipment issue, observation | quick note entry |

---

## Recommended Table: `agronomic_events`

| Column | Type | Required | Description |
|---|---|---:|---|
| `agro_event_id` | TEXT UNIQUE | yes | `AGRO-GW01-YYYYMMDD-HHMMSS-NNN` |
| `gateway_id` | TEXT | yes | Current gateway, e.g. `GW01` |
| `event_category` | TEXT | yes | `season_setup`, `irrigation`, `cutting`, `fertilization`, `yield`, `field_note` |
| `event_type` | TEXT | yes | Specific type, e.g. `irrigation_session`, `cutting`, `fertilization` |
| `target_scope` | TEXT | yes | `farm`, `pivot_1`, `pivot_2`, `both_pivots`, `unknown` |
| `started_at` | TIMESTAMPTZ | yes | Start time or event time |
| `ended_at` | TIMESTAMPTZ NULL | no | End time if duration matters |
| `created_at` | TIMESTAMPTZ | yes | Server creation time |
| `updated_at` | TIMESTAMPTZ NULL | no | Last edit time |
| `entered_by` | TEXT NULL | no | Optional operator name |
| `source` | TEXT | yes | `manual` |
| `confidence` | TEXT | yes | `exact`, `estimated`, `unknown` |
| `details` | JSONB | yes | Event-specific data |
| `notes` | TEXT NULL | no | Free-text operator note |

---

## 1. Season Setup Events

These are low-frequency records and should live in a dedicated **Field Setup / Season** page, not on the daily dashboard.

### 1.1 Planting Date

```json
{
  "event_category": "season_setup",
  "event_type": "planting_date",
  "target_scope": "farm",
  "started_at": "2026-03-01T08:00:00Z",
  "confidence": "exact",
  "details": {
    "crop": "alfalfa",
    "variety": null,
    "planting_method": null
  }
}
```

### 1.2 Emergence Date

Emergence is normally recorded **after planting only**, not after every cutting.

After cutting, the correct concept is **regrowth**, not emergence.

```json
{
  "event_category": "season_setup",
  "event_type": "emergence_date",
  "target_scope": "farm",
  "started_at": "2026-03-08T08:00:00Z",
  "confidence": "estimated",
  "details": {
    "days_after_planting": 7,
    "emergence_uniformity": null
  }
}
```

### 1.3 Season Start / End

Season start is usually known early. Season end may be entered later.

```json
{
  "event_category": "season_setup",
  "event_type": "season_start",
  "target_scope": "farm",
  "started_at": "2026-03-01T00:00:00Z",
  "details": {
    "season_year": 2026
  }
}
```

```json
{
  "event_category": "season_setup",
  "event_type": "season_end",
  "target_scope": "farm",
  "started_at": "2026-10-15T18:00:00Z",
  "details": {
    "reason": "end_of_production"
  }
}
```

### 1.4 Soil Type

Soil type is optional but very valuable because moisture thresholds depend strongly on soil texture.

```json
{
  "event_category": "season_setup",
  "event_type": "soil_type",
  "target_scope": "pivot_1",
  "started_at": "2026-03-01T00:00:00Z",
  "confidence": "estimated",
  "details": {
    "soil_texture": "loam",
    "field_capacity_percent": null,
    "refill_point_percent": null,
    "wilting_point_percent": null
  }
}
```

If exact field capacity/refill point are unknown, the dashboard must mark irrigation thresholds as **unconfigured**.

---

## 2. Irrigation Events

Irrigation is daily or near-daily and must be optimized for mobile entry.

A single “Done” button is not enough because irrigation has timing and duration.

### Professional UX Recommendation

Use a **two-mode mobile workflow**:

#### Mode A — Real-time session

For use when the operator is present at the start of irrigation.

1. Tap **Start Irrigation**
2. Dashboard records `started_at = current time`
3. UI shows active irrigation timer
4. Tap **End Irrigation**
5. Dashboard records `ended_at = current time`

This is the most accurate workflow.

#### Mode B — Manual backfill

For cases where the operator forgot to start the timer.

Form fields:

- irrigation date
- start time
- end time or duration
- target scope: Pivot 1 / Pivot 2 / both pivots / unknown
- optional note

### Irrigation Event Example

```json
{
  "event_category": "irrigation",
  "event_type": "irrigation_session",
  "target_scope": "both_pivots",
  "started_at": "2026-05-01T06:10:00Z",
  "ended_at": "2026-05-01T08:00:00Z",
  "confidence": "exact",
  "details": {
    "method": "pivot",
    "duration_min": 110,
    "amount_mm": null,
    "flow_meter_value": null
  },
  "notes": "Normal morning irrigation"
}
```

### If only start time is known

```json
{
  "event_type": "irrigation_session",
  "started_at": "2026-05-01T06:10:00Z",
  "ended_at": null,
  "confidence": "estimated",
  "details": {
    "duration_min": null,
    "status": "start_only"
  }
}
```

Dashboard must not assume duration if `ended_at` is null.

---

## 3. Cutting Events

Cutting is periodic, usually every 20+ days depending on growth and management.

It should not occupy the first daily action slot. It belongs in **Operations** with reminder support.

```json
{
  "event_category": "cutting",
  "event_type": "cutting",
  "target_scope": "farm",
  "started_at": "2026-05-21T07:00:00Z",
  "confidence": "exact",
  "details": {
    "cutting_number": 2,
    "days_since_previous_cutting": 28,
    "regrowth_stage_note": null
  },
  "notes": "Second cutting completed"
}
```

### Cutting Reminder Logic

- After 20 days since last cutting: show soft reminder
- After 25–30 days: show stronger reminder
- Never force a cutting recommendation from sensors alone
- Allow the user to configure target interval

---

## 4. Yield Events

Yield should be recorded **after each cutting**, not only at season end.

Season yield is a dashboard aggregation:

```text
season_yield = SUM(yield per cutting)
```

```json
{
  "event_category": "yield",
  "event_type": "yield_per_cutting",
  "target_scope": "farm",
  "started_at": "2026-05-21T18:00:00Z",
  "confidence": "estimated",
  "details": {
    "cutting_number": 2,
    "yield_value": 2.8,
    "yield_unit": "ton",
    "area_unit": null,
    "moisture_basis": null
  },
  "notes": "Estimated from collected bales"
}
```

### Yield Reminder Logic

After a cutting event is saved:

```text
Show reminder: “Enter yield for cutting #N”
```

until yield is entered or dismissed.

---

## 5. Fertilization Events

Fertilization can happen multiple times in a season and should support regular and exceptional applications.

```json
{
  "event_category": "fertilization",
  "event_type": "fertilization",
  "target_scope": "pivot_2",
  "started_at": "2026-04-15T09:30:00Z",
  "confidence": "exact",
  "details": {
    "fertilizer_type": "NPK",
    "product_name": "15-15-15",
    "amount": 50,
    "unit": "kg",
    "application_method": "broadcast",
    "is_regular": false,
    "reason": "weak regrowth after cutting"
  },
  "notes": "Applied only on Pivot 2"
}
```

### Fertilization Form Fields

| Field | Required | Notes |
|---|---:|---|
| Date/time | yes | default current time |
| Target scope | yes | Pivot 1 / Pivot 2 / both / farm |
| Fertilizer type | yes | dropdown + free text |
| Product name | no | optional |
| Amount | no | optional if unknown |
| Unit | no | kg, L, bag, custom |
| Regular? | yes | normal program vs exceptional |
| Reason | required if not regular | explains special application |
| Notes | no | free text |

---

## 6. Field Notes

Field notes are general observations with timestamp and optional severity.

They are intentionally flexible.

```json
{
  "event_category": "field_note",
  "event_type": "field_observation",
  "target_scope": "pivot_1",
  "started_at": "2026-05-02T16:20:00Z",
  "confidence": "exact",
  "details": {
    "note_type": "damage",
    "severity": "medium",
    "tags": ["wheel_damage", "yellowing"]
  },
  "notes": "Visible yellowing near the pivot track"
}
```

### Note Types

Recommended values:

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

Field notes should be displayed as an agronomic timeline and may be overlaid on charts.

---

## Mobile UX Priority

Daily phone-first actions:

1. Start / End Irrigation
2. Backfill Irrigation
3. Add Field Note
4. View latest status
5. View last upload time

Periodic actions:

1. Record Cutting
2. Enter Yield
3. Record Fertilization
4. Update season setup

Low-frequency setup:

1. Planting Date
2. Emergence Date
3. Season Start / End
4. Soil Type
5. Moisture thresholds after calibration

---

## Relationship With Alfalfa Analytics

Manual events unlock more useful alfalfa insights:

| Manual event | Enables |
|---|---|
| Planting date | days after planting, establishment timeline |
| Emergence date | establishment success timing |
| Irrigation events | moisture response after irrigation, irrigation effectiveness |
| Cutting events | regrowth monitoring, cutting interval tracking |
| Fertilization events | EC interpretation after application |
| Yield per cutting | productivity trend and season total |
| Soil type | moisture threshold calibration |
| Notes | explain anomalies not visible in sensor data |

---

## Final Rule

Manual agronomic events must support analysis, not just record keeping.

Every event should answer:

```text
What happened?
When did it happen?
Where did it happen?
How certain is the time?
How should it affect interpretation of sensor data?
```
