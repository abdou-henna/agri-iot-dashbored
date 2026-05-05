# Analytics Snapshot Contract (Phase 7.x)

## 1. Purpose

This document defines the **production-grade analytics snapshot contract** for the Smart Farm IoT Dashboard.

The snapshot system exists to support incremental analytics:

- reuse previously computed analytics results;
- process only new records after the last analyzed timestamp boundary;
- reduce recomputation cost;
- prepare safe inputs for future Gemini interpretation;
- preserve the immutability of all source data.

This is a **contract document only**. It does not create database tables, backend APIs, or UI behavior by itself.

---

## 2. Core Principles

### 2.1 Immutable Source Data

The following source domains are immutable from the analytics layer:

- `sensor_readings`
- `system_events`
- `uploads`
- `agronomic_events`

Analytics MUST NOT update, delete, normalize, overwrite, or backfill raw rows.

### 2.2 Derived-Only Snapshots

A snapshot is a derived artifact. It may contain:

- aggregates;
- QC flags;
- reliability scores;
- alert evaluations;
- feature summaries;
- cursors;
- metadata about the processing version.

It MUST NOT become a replacement for source data.

### 2.3 Deterministic Processing

Snapshot generation must be deterministic:

```text
same raw input + same rules + same versions = same snapshot output
```

AI must not participate in snapshot generation.

### 2.4 Domain-Specific Time Semantics

Each domain has one canonical processing cursor:

| Domain | Canonical cursor |
|---|---|
| `sensor_readings` | `measured_at` |
| `system_events` | `event_time` |
| `agronomic_events` | `started_at` / `ended_at` |
| `uploads` | operational freshness only |

Uploads must not become an agronomic time axis.

---

## 3. Snapshot TypeScript Contract

The following interfaces describe the expected shape of snapshot-related data. They are documentation contracts and may later be translated into `src/types/analytics.ts`.

```ts
export type SnapshotDomain =
  | 'sensor_readings'
  | 'system_events'
  | 'agronomic_events'
  | 'uploads';

export type SnapshotBucket =
  | '10min'
  | 'hour'
  | 'day'
  | 'event_window'
  | 'none';

export interface SnapshotIdentity {
  domain: SnapshotDomain;
  node_id?: 'MAIN' | 'N2' | 'N3';
  metric?: string;
  window_start: string;
  window_end: string;
  bucket: SnapshotBucket;
  analytics_version: string;
  qc_version: string;
  calibration_version?: string;
  filters_hash: string;
}

export interface SnapshotCursor {
  last_measured_at?: string;
  last_event_time?: string;
  last_started_at?: string;
  last_ended_at?: string;
  last_received_at?: string;
  last_record_id?: string;
  last_event_id?: string;
  last_agro_event_id?: string;
}

export interface SnapshotQualitySummary {
  expected_count?: number;
  processed_count: number;
  valid_count: number;
  missing_count: number;
  duplicate_count: number;
  conflict_count: number;
  qc_flag_count: number;
  window_quality_score?: number;
  reliability_score?: number;
  reliability_level?: 'high' | 'medium' | 'low' | 'invalid';
}

export interface SnapshotPayload {
  aggregates?: Array<{
    bucket_start: string;
    avg: number | null;
    min: number | null;
    max: number | null;
    count: number;
    missing_count: number;
  }>;

  qc_flags?: Array<{
    code: string;
    severity: 'info' | 'warning' | 'error' | 'critical';
    domain: 'sensor' | 'system' | 'upload' | 'agronomy';
    node_id?: string;
    start_time: string;
    end_time?: string;
    message: string;
    details?: Record<string, unknown>;
  }>;

  reliability?: {
    score: number;
    level: 'high' | 'medium' | 'low' | 'invalid';
    reasons: string[];
  };

  alerts?: Array<{
    alert_id: string;
    alert_type: string;
    domain: 'agronomic' | 'operational';
    severity: 'info' | 'warning' | 'error' | 'critical';
    confidence: 'high' | 'medium' | 'low';
    title: string;
    message: string;
    triggered_at: string;
    evidence: Record<string, unknown>;
    limitations: string[];
  }>;

  features?: Record<string, unknown>;
}

export type SnapshotInvalidationReason =
  | 'analytics_version_changed'
  | 'qc_version_changed'
  | 'metric_definition_changed'
  | 'timestamp_semantics_changed'
  | 'query_filters_changed'
  | 'calibration_metadata_changed'
  | 'manual_event_changed'
  | 'source_window_changed';

export interface AnalyticsSnapshot {
  snapshot_id: string;
  identity: SnapshotIdentity;
  cursor: SnapshotCursor;
  payload: SnapshotPayload;
  quality: SnapshotQualitySummary;
  invalidated: boolean;
  invalidation_reason?: SnapshotInvalidationReason;
  created_at: string;
  updated_at: string;
}

export interface SnapshotMergeResult {
  previous_snapshot_id?: string;
  new_snapshot: AnalyticsSnapshot;
  processed_new_records: number;
  skipped_duplicate_records: number;
  conflict_count: number;
  invalidated_previous: boolean;
  invalidation_reason?: SnapshotInvalidationReason;
}
```

---

## 4. Snapshot Identity Rules

A snapshot identity must uniquely describe **what was processed and under which rules**.

Required identity fields:

| Field | Required | Purpose |
|---|---:|---|
| `domain` | yes | Source domain |
| `node_id` | when applicable | MAIN / N2 / N3 |
| `metric` | when applicable | e.g. soil_moisture_percent |
| `window_start` | yes | Processing window start |
| `window_end` | yes | Processing window end |
| `bucket` | yes | Aggregation granularity |
| `analytics_version` | yes | Metric logic version |
| `qc_version` | yes | QC rules version |
| `calibration_version` | when applicable | Soil/EC calibration version |
| `filters_hash` | yes | Stable hash of query filters |

### Rule

Two snapshots may be merged only if their identity is compatible:

```text
same domain
same node/metric where applicable
same bucket
same analytics_version
same qc_version
same calibration metadata
compatible adjacent or overlapping time window
```

If identity is not compatible, a new snapshot must be created rather than merged.

---

## 5. Cursor Rules

The cursor records the last source boundary included in the snapshot.

### 5.1 Sensor Readings

Use:

```text
last_measured_at
```

Fetch delta records using:

```text
measured_at > last_measured_at
```

If multiple readings share the same `measured_at`, use `record_id` as a tie-breaker.

### 5.2 System Events

Use:

```text
last_event_time
```

Fetch delta records using:

```text
event_time > last_event_time
```

If multiple events share the same `event_time`, use `event_id` as a tie-breaker.

### 5.3 Agronomic Events

Use:

```text
last_started_at
last_ended_at
```

Because agronomic records may be edited manually, future production logic must also detect event updates, not only newly created events.

For now, the safe rule is:

```text
if agronomic events in a window changed, invalidate affected event-window snapshots
```

### 5.4 Uploads

Uploads are operational metadata only. They may support freshness or transfer diagnostics but must not be used as an agronomic time axis.

---

## 6. Merge Algorithm

Snapshot merge must be deterministic and source-safe.

### Step-by-step

```text
1. Load previous snapshot.
2. Verify snapshot identity compatibility.
3. Read cursor from previous snapshot.
4. Fetch source rows strictly after the cursor.
5. Validate timestamps using domain-specific time fields.
6. Clean and deduplicate only the new rows.
7. Detect duplicate/conflict metadata.
8. Compute delta metrics from new rows.
9. Merge delta metrics into previous derived payload.
10. Recompute affected buckets/windows only.
11. Update cursor to the newest processed domain timestamp.
12. Return a new derived snapshot object.
13. Never mutate raw rows or previous snapshot objects in place.
```

### Merge Rules by Payload Type

| Payload part | Merge rule |
|---|---|
| Aggregates | merge by `bucket_start`; recompute affected bucket |
| QC flags | append new flags; deduplicate by code + node + time |
| Reliability | recompute score for affected node/window |
| Alerts | regenerate deterministic alerts for affected window |
| Features | merge by feature key and window identity |

### Non-Mutation Rule

Implementation must follow copy-on-write behavior:

```ts
const nextSnapshot = {
  ...previousSnapshot,
  payload: {
    ...previousSnapshot.payload,
    aggregates: mergedAggregates
  }
};
```

Never mutate:

```ts
previousSnapshot.payload.aggregates.push(...)
rawReading.soil_moisture_percent = 0
```

---

## 7. Duplicate and Conflict Rules

### Duplicate Key Priority

For `sensor_readings`:

```text
record_id
fallback: node_id + measured_at
```

For `system_events`:

```text
event_id
fallback: node_id + event_time + event_type
```

For `agronomic_events`:

```text
agro_event_id
fallback: event_category + event_type + started_at + target_scope
```

### Conflict Definition

A conflict exists when two source rows share the same duplicate key but have materially different serialized content.

Conflict handling:

- do not mutate raw rows;
- preserve first deterministic row for derived computation;
- record conflict metadata;
- downgrade reliability or window confidence if needed.

---

## 8. Invalidation Strategy

Snapshots must be invalidated when assumptions change.

### Required invalidation reasons

| Reason | Meaning |
|---|---|
| `analytics_version_changed` | Metric logic changed |
| `qc_version_changed` | QC rules or thresholds changed |
| `metric_definition_changed` | Formula or metric semantics changed |
| `timestamp_semantics_changed` | Time-field rules changed |
| `query_filters_changed` | Source query/window changed |
| `calibration_metadata_changed` | Soil/EC calibration changed |
| `manual_event_changed` | Agronomic event edited/deleted |
| `source_window_changed` | Historical source range changed |

### Rule

Invalidation does not delete raw source data.

It only marks a derived snapshot as stale:

```json
{
  "invalidated": true,
  "invalidation_reason": "qc_version_changed"
}
```

---

## 9. Frontend Cache Strategy (Current Phase)

Current short-term strategy:

- React Query cache;
- `useMemo` derived outputs;
- optional in-memory snapshot object;
- no persistent storage required;
- safe to recompute on refresh.

This is acceptable during development because:

- raw data remains untouched;
- no cache is treated as canonical;
- rebuild/recompute is safe.

### Current Limitations

- refresh clears memory cache;
- cache is per browser session;
- no cross-device continuity;
- not suitable as final production persistence.

---

## 10. Future Backend Snapshot Strategy

A future production phase may introduce a backend table:

```sql
analytics_snapshots
```

Potential fields:

```text
snapshot_id
domain
node_id
metric
window_start
window_end
bucket
analytics_version
qc_version
calibration_version
filters_hash
cursor_json
payload_json
quality_json
invalidated
invalidation_reason
created_at
updated_at
```

### Backend Rules

- source tables remain immutable;
- snapshot table stores derived payload only;
- snapshot writes must never update raw data;
- snapshot table can be rebuilt from source data;
- deletion of snapshots must not affect source data.

No backend implementation is part of the current step.

---

## 11. AI / Gemini Boundary

Snapshots may later become Gemini inputs, but Gemini must receive only:

- derived summaries;
- metrics;
- reliability scores;
- confidence levels;
- limitations;
- event context summaries.

Gemini must not receive raw source tables as its primary input.

Gemini must not:

- clean raw data;
- compute base metrics;
- infer missing values;
- convert raw EC to ECe;
- infer ET without wind/solar radiation;
- diagnose disease;
- diagnose nutrients or NPK status;
- overwrite deterministic outputs.

---

## 12. Safety Checklist

Before implementing any snapshot logic, verify:

- [ ] No `POST`, `PATCH`, or `DELETE` to raw data endpoints.
- [ ] No mutation of raw API response objects.
- [ ] No mutation of source arrays in place.
- [ ] Missing values remain missing.
- [ ] `sensor_readings` use `measured_at`.
- [ ] `system_events` use `event_time`.
- [ ] `agronomic_events` use `started_at` / `ended_at`.
- [ ] Upload timestamps remain operational only.
- [ ] EC remains a relative trend indicator only.
- [ ] No ECe conversion.
- [ ] No ET model without wind and solar radiation.
- [ ] No disease diagnosis.
- [ ] No NPK/nutrient diagnosis.
- [ ] No AI in deterministic snapshot generation.

---

## 13. Recommended Implementation Order

Implementation should proceed only after this contract is accepted.

Recommended order:

```text
1. Add TypeScript snapshot types.
2. Add pure snapshot identity helpers.
3. Add pure cursor helpers.
4. Add pure merge helpers.
5. Add invalidation helpers.
6. Add frontend in-memory snapshot hook.
7. Validate with existing analytics hooks.
8. Only later consider backend persistence.
```

---

## 14. Non-Goals

This contract does not require:

- database migration now;
- backend snapshot API now;
- UI integration now;
- Gemini integration now;
- persistent cache now.

It only defines the safe shape and rules for incremental analytics.

---

## 15. Final Decision

Phase 7 incremental analytics must follow this rule:

```text
raw data is the source of truth
snapshots are derived cache
derived cache may be rebuilt
raw data must never be changed by analytics
```

End of document.
