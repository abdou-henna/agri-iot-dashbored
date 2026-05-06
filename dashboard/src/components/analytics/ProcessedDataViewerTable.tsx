import { useMemo, useState } from 'react';
import type { ProcessedDataViewerFilters, ProcessedDataViewerModel, ProcessedDataViewerRow } from '../../types/processedDataViewer';
import { AlertSeverityBadge, QcFlagBadge, ReliabilityBadge, StatusBadge } from './ProcessedDataViewerBadges';

const initialFilters: ProcessedDataViewerFilters = { domain: 'all', status: 'all', reliability_band: 'all', qc_severity: 'all', alert_severity: 'all', search: '' };

function valueLabel(value: number | string | null): string {
  return value == null ? 'Missing' : String(value);
}

export function ProcessedDataViewerTable({ model }: { model: ProcessedDataViewerModel }) {
  const [filters, setFilters] = useState<ProcessedDataViewerFilters>(initialFilters);

  const filteredRows = useMemo(() => model.rows.filter((row) => {
    const text = `${row.id} ${row.metric} ${row.source_label} ${row.deterministic_alerts.map((a) => a.alert_id).join(' ')}`.toLowerCase();
    if (filters.domain !== 'all' && row.domain !== filters.domain) return false;
    if (filters.status !== 'all' && row.processing_status !== filters.status) return false;
    if (filters.reliability_band !== 'all' && row.reliability.level !== filters.reliability_band) return false;
    if (filters.qc_severity !== 'all' && !row.qc_flags.some((flag) => flag.severity === filters.qc_severity)) return false;
    if (filters.alert_severity !== 'all' && !row.deterministic_alerts.some((a) => a.severity === filters.alert_severity)) return false;
    if (filters.search && !text.includes(filters.search.toLowerCase())) return false;
    return true;
  }), [filters, model.rows]);

  const rowView = (row: ProcessedDataViewerRow) => (<>
    <td>{row.domain}</td><td>{row.source_label}</td><td>{row.metric}</td><td>{valueLabel(row.raw_value)}</td><td>{valueLabel(row.cleaned_value)}</td><td>{valueLabel(row.processed_value)}</td>
    <td><StatusBadge status={row.processing_status} /></td>
    <td className="space-x-1">{row.qc_flags.length ? row.qc_flags.map((f) => <QcFlagBadge key={`${row.id}:${f.code}`} code={f.code} severity={f.severity} />) : 'Not available'}</td>
    <td><ReliabilityBadge reliability={row.reliability} /></td>
    <td className="space-x-1">{row.deterministic_alerts.length ? row.deterministic_alerts.map((a) => <span key={a.alert_id}><AlertSeverityBadge severity={a.severity} /></span>) : 'Not available'}</td>
    <td>{row.timestamps.measured_at ? `measured_at: ${row.timestamps.measured_at}` : row.timestamps.event_time ? `event_time: ${row.timestamps.event_time}` : row.timestamps.started_at ? `started_at: ${row.timestamps.started_at}` : row.timestamps.upload_received_at ? `upload_received_at: ${row.timestamps.upload_received_at}` : 'Not available'}</td>
    <td>{row.limitations.join(' | ')}</td>
  </>);

  return <div className="space-y-3">
    <input className="w-full rounded border p-2 text-sm" placeholder="Search metric/id/rule" value={filters.search} onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))} />
    <div className="grid gap-2 md:grid-cols-5">
      <select className="rounded border p-2 text-xs" value={filters.domain} onChange={(e) => setFilters((p) => ({ ...p, domain: e.target.value as ProcessedDataViewerFilters['domain'] }))}><option value="all">All domains</option><option value="sensor">sensor</option><option value="system">system</option><option value="agronomic">agronomic</option><option value="upload">upload</option></select>
      <select className="rounded border p-2 text-xs" value={filters.status} onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value as ProcessedDataViewerFilters['status'] }))}><option value="all">All status</option><option value="accepted">accepted</option><option value="downgraded">downgraded</option><option value="excluded">excluded</option><option value="missing">missing</option><option value="derived_only">derived_only</option></select>
      <select className="rounded border p-2 text-xs" value={filters.reliability_band} onChange={(e) => setFilters((p) => ({ ...p, reliability_band: e.target.value as ProcessedDataViewerFilters['reliability_band'] }))}><option value="all">All reliability</option><option value="high">high</option><option value="medium">medium</option><option value="low">low</option><option value="invalid">invalid</option><option value="unknown">unknown</option></select>
      <select className="rounded border p-2 text-xs" value={filters.qc_severity} onChange={(e) => setFilters((p) => ({ ...p, qc_severity: e.target.value as ProcessedDataViewerFilters['qc_severity'] }))}><option value="all">All QC severity</option><option value="low">low</option><option value="medium">medium</option><option value="high">high</option><option value="critical">critical</option></select>
      <select className="rounded border p-2 text-xs" value={filters.alert_severity} onChange={(e) => setFilters((p) => ({ ...p, alert_severity: e.target.value as ProcessedDataViewerFilters['alert_severity'] }))}><option value="all">All alert severity</option><option value="low">low</option><option value="medium">medium</option><option value="high">high</option><option value="critical">critical</option></select>
    </div>

    <div className="hidden overflow-auto md:block"><table className="min-w-full text-xs"><thead><tr>{['domain','source/node','metric','raw','cleaned','processed','status','QC','reliability','alerts','timestamp','limitations'].map((h) => <th key={h} className="px-2 py-1 text-left">{h}</th>)}</tr></thead><tbody>{filteredRows.map((row) => <tr key={row.id} className="border-t">{rowView(row)}</tr>)}</tbody></table></div>
    <div className="space-y-2 md:hidden">{filteredRows.map((row) => <div key={row.id} className="rounded border p-2 text-xs"><div className="font-semibold">{row.metric} · {row.source_label}</div><div className="mt-1">Status: <StatusBadge status={row.processing_status} /></div><div>Raw: {valueLabel(row.raw_value)} | Cleaned: {valueLabel(row.cleaned_value)} | Processed: {valueLabel(row.processed_value)}</div><div>Limitations: {row.limitations.join(' | ')}</div></div>)}</div>
  </div>;
}
