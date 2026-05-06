import type { ProcessedDataViewerModel } from '../../types/processedDataViewer';

function csvEscape(value: string): string {
  const escaped = value.replace(/"/g, '""');
  return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
}

export function processedDataViewerToCsv(model: ProcessedDataViewerModel): string {
  const headers = [
    'id','domain','source_label','metric','raw_value','cleaned_value','processed_value','processing_status','qc_flags','reliability_score','alert_refs','measured_at','event_time','started_at','upload_received_at','limitations',
  ];
  const lines = model.rows.map((row) => {
    const qcFlags = row.qc_flags.map((flag) => `${flag.code}:${flag.severity}`).join('|');
    const alertRefs = row.deterministic_alerts.map((alert) => `${alert.alert_id}:${alert.severity}`).join('|');
    return [
      row.id,
      row.domain,
      row.source_label,
      row.metric,
      row.raw_value == null ? '' : String(row.raw_value),
      row.cleaned_value == null ? '' : String(row.cleaned_value),
      row.processed_value == null ? 'missing' : String(row.processed_value),
      row.processing_status,
      qcFlags,
      row.reliability.score == null ? '' : String(row.reliability.score),
      alertRefs,
      row.timestamps.measured_at ?? '',
      row.timestamps.event_time ?? '',
      row.timestamps.started_at ?? '',
      row.timestamps.upload_received_at ?? '',
      row.limitations.join(' | '),
    ].map((item) => csvEscape(item));
  });

  return [headers.join(','), ...lines.map((line) => line.join(','))].join('\n');
}
