import { describe, expect, it } from 'vitest';

import type { AnalyticsSnapshot } from '../../types/analytics';
import { buildProcessedDataViewerModel } from './processedDataViewerAdapter';

function baseSnapshot(overrides?: Partial<AnalyticsSnapshot>): AnalyticsSnapshot {
  return {
    snapshot_id: 'snap-1',
    identity: {
      domain: 'sensor_readings',
      node_id: 'MAIN',
      metric: 'soil_moisture_percent',
      window_start: '2026-05-01T00:00:00Z',
      window_end: '2026-05-01T01:00:00Z',
      bucket: 'hour',
      analytics_version: '1.0.0',
      qc_version: '1.0.0',
      filters_hash: 'hash',
    },
    cursor: {},
    payload: {},
    quality: {
      processed_count: 1,
      valid_count: 1,
      missing_count: 0,
      duplicate_count: 0,
      conflict_count: 0,
      qc_flag_count: 0,
    },
    invalidated: false,
    created_at: '2026-05-01T01:00:00Z',
    updated_at: '2026-05-01T01:00:00Z',
    ...overrides,
  };
}

describe('buildProcessedDataViewerModel', () => {
  it('maps provenance-present sensor row with lineage, qc, reliability, and alerts', () => {
    const snapshot = baseSnapshot({
      payload: {
        provenance_rows: [
          {
            row_id: 'row-1', domain: 'sensor', source_label: 'MAIN', metric: 'soil_moisture_percent', unit: '%',
            raw_value: 12.5, cleaned_value: 12.2, processed_value: 12.2, processing_status: 'accepted',
            qc_flags: [{ code: 'ok', severity: 'info', domain: 'sensor', start_time: '2026-05-01T00:00:00Z', message: 'good' }],
            reliability: { score: 0.92, level: 'high', reasons: ['stable'] },
            deterministic_alert_refs: [{ alert_id: 'a-1', title: 'Normal', severity: 'info', alert_type: 'operational' }],
            timestamps: { measured_at: '2026-05-01T00:10:00Z' },
            limitations: ['none'],
          },
        ],
      },
    });

    const model = buildProcessedDataViewerModel(snapshot);
    const row = model.rows[0];
    expect(row.provenance_source).toBe('snapshot_provenance');
    expect(row.raw_value).toBe(12.5);
    expect(row.cleaned_value).toBe(12.2);
    expect(row.processed_value).toBe(12.2);
    expect(row.timestamps.measured_at).toBe('2026-05-01T00:10:00Z');
    expect(row.qc_flags).toEqual([{ code: 'ok', severity: 'info', message: 'good', domain: 'sensor' }]);
    expect(row.reliability).toEqual({ score: 0.92, level: 'high', reasons: ['stable'] });
    expect(row.deterministic_alerts).toEqual([{ alert_id: 'a-1', title: 'Normal', severity: 'info', alert_type: 'operational' }]);
    expect(row.limitations).not.toContain('Raw/cleaned pair is not available in this snapshot contract.');
  });

  it('builds aggregate fallback rows and preserves nulls without zero conversion', () => {
    const snapshot = baseSnapshot({
      payload: {
        aggregates: [{ bucket_start: '2026-05-01T00:00:00Z', avg: null, min: null, max: null, count: 3, missing_count: 3 }],
      },
    });

    const model = buildProcessedDataViewerModel(snapshot);
    const row = model.rows[0];
    expect(row.provenance_source).toBe('snapshot_aggregate_fallback');
    expect(row.raw_value).toBeNull();
    expect(row.cleaned_value).toBeNull();
    expect(row.processed_value).toBeNull();
    expect(row.timestamps.measured_at).toBe('2026-05-01T00:00:00Z');
    expect(row.limitations).toContain('Raw/cleaned pair is not available in this snapshot contract.');
    expect(row.processing_status).toBe('missing');
  });

  it('keeps domain timestamp semantics distinct for provenance rows', () => {
    const snapshot = baseSnapshot({
      payload: {
        provenance_rows: [
          { row_id: 's', domain: 'sensor', source_label: 'MAIN', raw_value: 1, cleaned_value: 1, processed_value: 1, processing_status: 'accepted', qc_flags: [], reliability: null, deterministic_alert_refs: [], timestamps: { measured_at: '2026-05-01T00:00:00Z' }, limitations: [] },
          { row_id: 'sys', domain: 'system', source_label: 'SYS', raw_value: 'evt', cleaned_value: 'evt', processed_value: 'evt', processing_status: 'accepted', qc_flags: [], reliability: null, deterministic_alert_refs: [], timestamps: { event_time: '2026-05-01T00:01:00Z' }, limitations: [] },
          { row_id: 'ag', domain: 'agronomic', source_label: 'AG', raw_value: 'start', cleaned_value: 'start', processed_value: 'start', processing_status: 'accepted', qc_flags: [], reliability: null, deterministic_alert_refs: [], timestamps: { started_at: '2026-05-01T00:02:00Z', ended_at: '2026-05-01T00:03:00Z' }, limitations: [] },
          { row_id: 'u', domain: 'upload', source_label: 'UP', raw_value: 'ok', cleaned_value: 'ok', processed_value: 'ok', processing_status: 'accepted', qc_flags: [], reliability: null, deterministic_alert_refs: [], timestamps: { upload_received_at: '2026-05-01T00:04:00Z' }, limitations: [] },
        ],
      },
    });
    const model = buildProcessedDataViewerModel(snapshot);
    const [sensor, system, agronomic, upload] = model.rows;
    expect(sensor.timestamps.measured_at).toBe('2026-05-01T00:00:00Z');
    expect(sensor.timestamps.event_time).toBeNull();
    expect(system.timestamps.event_time).toBe('2026-05-01T00:01:00Z');
    expect(system.timestamps.measured_at).toBeNull();
    expect(agronomic.timestamps.started_at).toBe('2026-05-01T00:02:00Z');
    expect(agronomic.timestamps.ended_at).toBe('2026-05-01T00:03:00Z');
    expect(upload.timestamps.upload_received_at).toBe('2026-05-01T00:04:00Z');
  });

  it('preserves null missing values for provenance and fallback', () => {
    const provenanceSnapshot = baseSnapshot({
      payload: {
        provenance_rows: [
          { row_id: 'm1', domain: 'sensor', source_label: 'MAIN', raw_value: null, cleaned_value: null, processed_value: null, processing_status: 'missing', qc_flags: [], reliability: null, deterministic_alert_refs: [], timestamps: { measured_at: '2026-05-01T00:00:00Z' }, limitations: [] },
        ],
      },
    });
    const fallbackSnapshot = baseSnapshot({ payload: { aggregates: [{ bucket_start: '2026-05-01T00:00:00Z', avg: null, min: null, max: null, count: 0, missing_count: 1 }] } });
    const provenanceRow = buildProcessedDataViewerModel(provenanceSnapshot).rows[0];
    const fallbackRow = buildProcessedDataViewerModel(fallbackSnapshot).rows[0];
    expect(provenanceRow.raw_value).toBeNull();
    expect(provenanceRow.cleaned_value).toBeNull();
    expect(provenanceRow.processed_value).toBeNull();
    expect(provenanceRow.processing_status).toBe('missing');
    expect(fallbackRow.processed_value).toBeNull();
    expect(fallbackRow.processing_status).toBe('missing');
  });
});
