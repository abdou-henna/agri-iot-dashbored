import type { AgronomicIntelligenceOutput } from '../../types/agronomicIntelligence';
import type { AnalyticsSnapshot, QcFlag } from '../../types/analytics';
import type { ProcessedDataReliability, ProcessedDataStatus, ProcessedDataViewerModel, ProcessedDataViewerRow } from '../../types/processedDataViewer';

export function formatProcessedValue(value: number | string | null): string {
  if (value == null) return 'Missing';
  if (typeof value === 'number') return Number.isFinite(value) ? value.toFixed(2) : 'Not available';
  return value;
}

export function statusFromQcAndReliability(qcFlags: QcFlag[], reliability: ProcessedDataReliability): ProcessedDataStatus {
  if (qcFlags.some((flag) => flag.code === 'qc_excluded')) return 'excluded';
  if (qcFlags.some((flag) => flag.severity === 'error' || flag.severity === 'warning')) return 'downgraded';
  if (reliability.level === 'low' || reliability.level === 'invalid') return 'downgraded';
  if (reliability.level === 'unknown') return 'derived_only';
  return 'accepted';
}

export function buildProcessedDataViewerModel(snapshot: AnalyticsSnapshot, agronomicIntelligence?: AgronomicIntelligenceOutput | null, contextLabel?: string): ProcessedDataViewerModel {
  const snapshotReliability: ProcessedDataReliability = {
    score: snapshot.payload.reliability?.score ?? snapshot.quality.reliability_score ?? null,
    level: snapshot.payload.reliability?.level ?? snapshot.quality.reliability_level ?? 'unknown',
    reasons: snapshot.payload.reliability?.reasons ?? [],
  };

  const baseLimitations = [
    'QC flags are available at snapshot summary level and may not map to each processed aggregate row.',
  ];

  const provenanceRows = snapshot.payload.provenance_rows ?? [];
  const rows: ProcessedDataViewerRow[] = provenanceRows.length ? provenanceRows.map((row) => ({
    id: row.row_id,
    domain: row.domain,
    source_label: row.source_label,
    metric: row.metric ?? snapshot.identity.metric ?? 'unknown_metric',
    raw_value: row.raw_value,
    cleaned_value: row.cleaned_value,
    processed_value: row.processed_value,
    unit: row.unit ?? null,
    processing_status: row.processing_status,
    qc_flags: row.qc_flags.map((flag) => ({
      code: flag.code,
      severity: flag.severity,
      message: flag.message,
      domain: flag.domain === 'agronomy' ? 'agronomic' : flag.domain,
    })),
    reliability: row.reliability
      ? { score: row.reliability.score, level: row.reliability.level, reasons: row.reliability.reasons }
      : { score: null, level: 'unknown', reasons: [] },
    deterministic_alerts: row.deterministic_alert_refs,
    timestamps: {
      measured_at: row.timestamps.measured_at ?? null,
      event_time: row.timestamps.event_time ?? null,
      started_at: row.timestamps.started_at ?? null,
      ended_at: row.timestamps.ended_at ?? null,
      upload_received_at: row.timestamps.upload_received_at ?? null,
    },
    limitations: [...row.limitations],
    provenance_source: 'snapshot_provenance',
  })) : (snapshot.payload.aggregates ?? []).map((point, index) => {
    const rowQcFlags = (snapshot.payload.qc_flags ?? []).filter((flag) => flag.domain === 'sensor').map((flag) => ({
      code: flag.code,
      severity: flag.severity,
      message: flag.message,
      domain: 'sensor' as const,
    }));

    const rowReliability: ProcessedDataReliability = {
      score: snapshotReliability.score,
      level: snapshotReliability.level,
      reasons: snapshotReliability.reasons,
    };

    return {
      id: `${snapshot.snapshot_id}:${index}`,
      domain: 'sensor',
      source_label: snapshot.identity.node_id ?? 'unknown_source',
      metric: snapshot.identity.metric ?? 'unknown_metric',
      raw_value: null,
      cleaned_value: null,
      processed_value: point.avg,
      unit: null,
      processing_status: point.avg == null ? 'missing' : statusFromQcAndReliability(snapshot.payload.qc_flags?.filter((flag) => flag.domain === 'sensor') ?? [], rowReliability),
      qc_flags: rowQcFlags,
      reliability: rowReliability,
      deterministic_alerts: (snapshot.payload.alerts ?? []).map((alert) => ({
        alert_id: alert.alert_id,
        title: alert.title,
        severity: alert.severity,
        alert_type: alert.alert_type,
      })),
      timestamps: {
        measured_at: point.bucket_start,
      },
      limitations: ['Raw/cleaned pair is not available in this snapshot contract.', ...baseLimitations],
      provenance_source: 'snapshot_aggregate_fallback',
    };
  });

  if (!rows.length) {
    rows.push({
      id: `${snapshot.snapshot_id}:missing`, domain: 'sensor', source_label: snapshot.identity.node_id ?? 'unknown_source', metric: snapshot.identity.metric ?? 'unknown_metric', raw_value: null, cleaned_value: null, processed_value: null, unit: null,
      processing_status: 'missing', qc_flags: [], reliability: snapshotReliability, deterministic_alerts: [], timestamps: { measured_at: null }, limitations: ['Raw/cleaned pair is not available in this snapshot contract.', ...baseLimitations], provenance_source: 'snapshot_aggregate_fallback',
    });
  }

  const limitations = provenanceRows.length
    ? ['Rows are sourced from optional snapshot provenance contract fields.']
    : ['Raw/cleaned pair is not available in this snapshot contract.', ...baseLimitations];

  if (agronomicIntelligence?.limitations?.length) {
    limitations.push('Gemini interpretation is excluded from processed rows and remains a separate interpretive layer.');
  }

  return {
    snapshot_meta: {
      snapshot_id: snapshot.snapshot_id,
      domain: snapshot.identity.domain,
      node_id: snapshot.identity.node_id,
      metric: snapshot.identity.metric,
      window_start: snapshot.identity.window_start,
      window_end: snapshot.identity.window_end,
      bucket: snapshot.identity.bucket,
      analytics_version: snapshot.identity.analytics_version,
      qc_version: snapshot.identity.qc_version,
      context_label: contextLabel,
    },
    rows,
    snapshot_qc_flags: [...(snapshot.payload.qc_flags ?? [])],
    snapshot_alerts: [...(snapshot.payload.alerts ?? [])],
    snapshot_reliability: snapshotReliability,
    limitations,
  };
}
