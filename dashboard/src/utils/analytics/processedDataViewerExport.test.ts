import { describe, expect, it } from 'vitest';

import type { ProcessedDataViewerModel } from '../../types/processedDataViewer';
import { processedDataViewerToCsv } from './processedDataViewerExport';

const baseModel: ProcessedDataViewerModel = {
  snapshot_meta: {
    snapshot_id: 'snap',
    domain: 'sensor_readings',
    node_id: 'MAIN',
    metric: 'soil_moisture_percent',
    window_start: '2026-05-01T00:00:00Z',
    window_end: '2026-05-01T01:00:00Z',
    bucket: 'hour',
    analytics_version: '1.0.0',
    qc_version: '1.0.0',
  },
  rows: [],
  snapshot_qc_flags: [],
  snapshot_alerts: [],
  snapshot_reliability: { score: null, level: 'unknown', reasons: [] },
  limitations: [],
};

describe('processedDataViewerToCsv', () => {
  it('exports provenance CSV with required lineage and semantic timestamp columns', () => {
    const csv = processedDataViewerToCsv({
      ...baseModel,
      rows: [{
        id: 'r1', domain: 'sensor', provenance_source: 'snapshot_provenance', source_label: 'MAIN', metric: 'soil_moisture_percent',
        raw_value: 10, cleaned_value: 9.5, processed_value: 9.5, processing_status: 'accepted', unit: '%',
        qc_flags: [{ code: 'ok', severity: 'info', message: 'ok', domain: 'sensor' }],
        reliability: { score: 0.9, level: 'high', reasons: ['stable'] },
        deterministic_alerts: [{ alert_id: 'a1', title: 'ok', severity: 'info', alert_type: 'operational' }],
        timestamps: { measured_at: '2026-05-01T00:00:00Z' },
        limitations: [],
      }],
    });

    expect(csv).toContain('provenance_source');
    expect(csv).toContain('raw_value');
    expect(csv).toContain('cleaned_value');
    expect(csv).toContain('processed_value');
    expect(csv).toContain('processing_status');
    expect(csv).toContain('qc_flags');
    expect(csv).toContain('reliability_score');
    expect(csv).toContain('alert_refs');
    expect(csv).toContain('2026-05-01T00:00:00Z');
  });

  it('exports aggregate fallback CSV with blank raw/cleaned and missing processed marker', () => {
    const csv = processedDataViewerToCsv({
      ...baseModel,
      rows: [{
        id: 'r2', domain: 'sensor', provenance_source: 'snapshot_aggregate_fallback', source_label: 'MAIN', metric: 'soil_moisture_percent',
        raw_value: null, cleaned_value: null, processed_value: null, processing_status: 'missing', unit: null,
        qc_flags: [], reliability: { score: null, level: 'unknown', reasons: [] }, deterministic_alerts: [],
        timestamps: { measured_at: '2026-05-01T00:00:00Z' }, limitations: [],
      }],
    });

    expect(csv).toContain('snapshot_aggregate_fallback');
    expect(csv).toContain(',,,missing,missing,');
    expect(csv).not.toContain(',0,');
  });

  it('does not leak forbidden secret markers in output', () => {
    const csv = processedDataViewerToCsv({
      ...baseModel,
      rows: [{
        id: 'safe-row', domain: 'system', provenance_source: 'snapshot_provenance', source_label: 'SAFE', metric: 'status',
        raw_value: 'safe_dummy', cleaned_value: 'safe_dummy', processed_value: 'safe_dummy', processing_status: 'accepted', unit: null,
        qc_flags: [], reliability: { score: null, level: 'unknown', reasons: [] }, deterministic_alerts: [], timestamps: { event_time: '2026-05-01T00:00:00Z' }, limitations: [],
      }],
    });

    expect(csv).not.toContain('raw_payload');
    expect(csv).not.toContain('DATABASE_URL');
    expect(csv).not.toContain('postgresql://');
    expect(csv).not.toContain('API_KEY');
    expect(csv).not.toContain('x-api-key');
    expect(csv).not.toContain('AIza');
  });

  it('escapes comma, quote, and newline values stably', () => {
    const csv = processedDataViewerToCsv({
      ...baseModel,
      rows: [{
        id: 'r3', domain: 'system', provenance_source: 'snapshot_provenance', source_label: 'sys,source', metric: 'line\n"break"',
        raw_value: 'a,b', cleaned_value: 'x"y', processed_value: 'line1\nline2', processing_status: 'accepted', unit: null,
        qc_flags: [], reliability: { score: null, level: 'unknown', reasons: [] }, deterministic_alerts: [], timestamps: { event_time: '2026-05-01T00:00:00Z' }, limitations: [],
      }],
    });

    expect(csv).toContain('"sys,source"');
    expect(csv).toContain('"line\n""break"""');
    expect(csv).toContain('"a,b"');
    expect(csv).toContain('"x""y"');
    expect(csv).toContain('"line1\nline2"');
  });
});
