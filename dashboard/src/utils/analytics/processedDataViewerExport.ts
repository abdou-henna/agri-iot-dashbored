import type { ProcessedDataViewerModel, ProcessedDataViewerRow } from '../../types/processedDataViewer';

function csvEscape(value: string): string {
  const escaped = value.replace(/"/g, '""');
  return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
}

function timestampForDomain(row: ProcessedDataViewerRow): { measuredAt: string; eventTime: string; startedAt: string; endedAt: string; uploadReceivedAt: string } {
  if (row.domain === 'sensor') {
    return { measuredAt: row.timestamps.measured_at ?? '', eventTime: '', startedAt: '', endedAt: '', uploadReceivedAt: '' };
  }
  if (row.domain === 'system') {
    return { measuredAt: '', eventTime: row.timestamps.event_time ?? '', startedAt: '', endedAt: '', uploadReceivedAt: '' };
  }
  if (row.domain === 'agronomic') {
    return { measuredAt: '', eventTime: '', startedAt: row.timestamps.started_at ?? '', endedAt: row.timestamps.ended_at ?? '', uploadReceivedAt: '' };
  }
  return { measuredAt: '', eventTime: '', startedAt: '', endedAt: '', uploadReceivedAt: row.timestamps.upload_received_at ?? '' };
}

export function processedDataViewerToCsv(model: ProcessedDataViewerModel): string {
  const headers = [
    'id','domain','provenance_source','source_label','metric','raw_value','cleaned_value','processed_value','processing_status','qc_flags','reliability_score','alert_refs','measured_at','event_time','started_at','ended_at','upload_received_at','limitations',
  ];
  const lines = model.rows.map((row) => {
    const qcFlags = row.qc_flags.map((flag) => `${flag.code}:${flag.severity}`).join('|');
    const alertRefs = row.deterministic_alerts.map((alert) => `${alert.alert_id}:${alert.severity}`).join('|');
    const ts = timestampForDomain(row);
    return [
      row.id,
      row.domain,
      row.provenance_source,
      row.source_label,
      row.metric,
      row.raw_value == null ? '' : String(row.raw_value),
      row.cleaned_value == null ? '' : String(row.cleaned_value),
      row.processed_value == null ? 'missing' : String(row.processed_value),
      row.processing_status,
      qcFlags,
      row.reliability.score == null ? '' : String(row.reliability.score),
      alertRefs,
      ts.measuredAt,
      ts.eventTime,
      ts.startedAt,
      ts.endedAt,
      ts.uploadReceivedAt,
      row.limitations.join(' | '),
    ].map((item) => csvEscape(item));
  });

  return [headers.join(','), ...lines.map((line) => line.join(','))].join('\n');
}
