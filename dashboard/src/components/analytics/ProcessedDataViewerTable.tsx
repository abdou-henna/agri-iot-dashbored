import { useMemo, useState } from 'react';
import type { ProcessedDataViewerFilters, ProcessedDataViewerModel, ProcessedDataViewerRow } from '../../types/processedDataViewer';
import { AlertSeverityBadge, QcFlagBadge, ReliabilityBadge, StatusBadge } from './ProcessedDataViewerBadges';

const initialFilters: ProcessedDataViewerFilters = { domain: 'all', status: 'all', reliability_band: 'all', qc_severity: 'all', alert_severity: 'all', search: '' };

function valueLabel(value: number | string | null): string {
  return value == null ? 'Missing' : String(value);
}

function provenanceLabel(source: 'snapshot_provenance' | 'snapshot_aggregate_fallback'): string {
  return source === 'snapshot_provenance' ? 'Snapshot provenance' : 'Aggregate fallback';
}

const SEL = 'h-8 rounded-lg border border-zinc-200 bg-white px-2 text-xs dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100';

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
    <td className="px-3 py-2">{row.domain}</td>
    <td className="px-3 py-2">{row.source_label}</td>
    <td className="px-3 py-2">{provenanceLabel(row.provenance_source)}</td>
    <td className="px-3 py-2 font-mono text-[11px]">{row.metric}</td>
    <td className="px-3 py-2 font-mono text-[11px]">{valueLabel(row.raw_value)}</td>
    <td className="px-3 py-2 font-mono text-[11px]">{valueLabel(row.cleaned_value)}</td>
    <td className="px-3 py-2 font-mono text-[11px]">{valueLabel(row.processed_value)}</td>
    <td className="px-3 py-2"><StatusBadge status={row.processing_status} /></td>
    <td className="px-3 py-2">
      <div className="flex flex-wrap gap-1">
        {row.qc_flags.length ? row.qc_flags.map((f) => <QcFlagBadge key={`${row.id}:${f.code}`} code={f.code} severity={f.severity} />) : <span className="text-zinc-400">—</span>}
      </div>
    </td>
    <td className="px-3 py-2"><ReliabilityBadge reliability={row.reliability} /></td>
    <td className="px-3 py-2">
      <div className="flex flex-wrap gap-1">
        {row.deterministic_alerts.length ? row.deterministic_alerts.map((a) => <span key={a.alert_id}><AlertSeverityBadge severity={a.severity} /></span>) : <span className="text-zinc-400">—</span>}
      </div>
    </td>
    <td className="whitespace-nowrap px-3 py-2 font-mono text-[11px]">
      {row.timestamps.measured_at ? `measured_at: ${row.timestamps.measured_at}` : row.timestamps.event_time ? `event_time: ${row.timestamps.event_time}` : row.timestamps.started_at ? `started_at: ${row.timestamps.started_at}` : row.timestamps.upload_received_at ? `upload_received_at: ${row.timestamps.upload_received_at}` : 'Not available'}
    </td>
    <td className="max-w-[200px] px-3 py-2">
      <div className="line-clamp-2 text-zinc-500 dark:text-zinc-400">{row.limitations.join(' · ')}</div>
    </td>
  </>);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <input
          className="h-8 w-52 min-w-0 rounded-lg border border-zinc-200 bg-white px-3 text-xs placeholder:text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          placeholder="Search metric / id / rule"
          value={filters.search}
          onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
        />
        <select className={SEL} value={filters.domain} onChange={(e) => setFilters((p) => ({ ...p, domain: e.target.value as ProcessedDataViewerFilters['domain'] }))}><option value="all">All domains</option><option value="sensor">sensor</option><option value="system">system</option><option value="agronomic">agronomic</option><option value="upload">upload</option></select>
        <select className={SEL} value={filters.status} onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value as ProcessedDataViewerFilters['status'] }))}><option value="all">All status</option><option value="accepted">accepted</option><option value="downgraded">downgraded</option><option value="excluded">excluded</option><option value="missing">missing</option><option value="derived_only">derived_only</option></select>
        <select className={SEL} value={filters.reliability_band} onChange={(e) => setFilters((p) => ({ ...p, reliability_band: e.target.value as ProcessedDataViewerFilters['reliability_band'] }))}><option value="all">All reliability</option><option value="high">high</option><option value="medium">medium</option><option value="low">low</option><option value="invalid">invalid</option><option value="unknown">unknown</option></select>
        <select className={SEL} value={filters.qc_severity} onChange={(e) => setFilters((p) => ({ ...p, qc_severity: e.target.value as ProcessedDataViewerFilters['qc_severity'] }))}><option value="all">All QC severity</option><option value="low">low</option><option value="medium">medium</option><option value="high">high</option><option value="critical">critical</option></select>
        <select className={SEL} value={filters.alert_severity} onChange={(e) => setFilters((p) => ({ ...p, alert_severity: e.target.value as ProcessedDataViewerFilters['alert_severity'] }))}><option value="all">All alert severity</option><option value="low">low</option><option value="medium">medium</option><option value="high">high</option><option value="critical">critical</option></select>
        <span className="text-xs text-zinc-400 dark:text-zinc-500">{filteredRows.length} rows</span>
      </div>

      <div className="hidden overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700 md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800">
                {['domain', 'source/node', 'provenance', 'metric', 'raw', 'cleaned', 'processed', 'status', 'QC', 'reliability', 'alerts', 'timestamp', 'limitations'].map((h) => (
                  <th key={h} className="whitespace-nowrap px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-700">
              {filteredRows.map((row) => (
                <tr key={row.id} className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                  {rowView(row)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-2 md:hidden">
        {filteredRows.map((row) => (
          <div key={row.id} className="rounded-xl border border-zinc-200 bg-white p-3 text-xs dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-300">
            <div className="font-semibold text-zinc-900 dark:text-zinc-100">{row.metric} · {row.source_label}</div>
            <div className="mt-0.5 font-mono text-[11px] text-zinc-500 dark:text-zinc-400">Provenance: {provenanceLabel(row.provenance_source)}</div>
            <div className="mt-1.5 flex items-center gap-2">
              <StatusBadge status={row.processing_status} />
            </div>
            <div className="mt-1 font-mono text-[11px]">Raw: {valueLabel(row.raw_value)} · Cleaned: {valueLabel(row.cleaned_value)} · Processed: {valueLabel(row.processed_value)}</div>
            {row.limitations.length ? <div className="mt-1 text-zinc-500 dark:text-zinc-400">Limitations: {row.limitations.join(' · ')}</div> : null}
          </div>
        ))}
      </div>
    </div>
  );
}
