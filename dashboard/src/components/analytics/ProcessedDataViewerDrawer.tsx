import { useMemo, useState } from 'react';
import type { AgronomicIntelligenceOutput } from '../../types/agronomicIntelligence';
import type { AnalyticsSnapshot } from '../../types/analytics';
import { buildProcessedDataViewerModel } from '../../utils/analytics/processedDataViewerAdapter';
import { processedDataViewerToCsv } from '../../utils/analytics/processedDataViewerExport';
import { ProcessedDataViewerTable } from './ProcessedDataViewerTable';

export function ProcessedDataViewerDrawer({ snapshot, agronomicIntelligence, contextLabel }: { snapshot: AnalyticsSnapshot; agronomicIntelligence?: AgronomicIntelligenceOutput | null; contextLabel?: string }) {
  const [open, setOpen] = useState(false);
  const model = useMemo(() => buildProcessedDataViewerModel(snapshot, agronomicIntelligence, contextLabel), [snapshot, agronomicIntelligence, contextLabel]);

  const onExport = () => {
    const blob = new Blob([processedDataViewerToCsv(model)], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `processed_data_${model.snapshot_meta.snapshot_id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return <>
    <button type="button" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800" onClick={() => setOpen(true)}>View processed data</button>
    {open ? (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 md:p-8">
        <div className="flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex shrink-0 items-start justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
            <div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Processed Data / Cleaned Analytics Viewer</h3>
              <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">Read-only · deterministic processed data · Gemini interpretation is not processed data</p>
            </div>
            <button type="button" className="ml-4 shrink-0 rounded-lg border border-zinc-200 px-3 py-1 text-sm transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800" onClick={() => setOpen(false)}>Close</button>
          </div>
          <div className="overflow-y-auto px-6 py-4">
            <div className="mb-3 rounded-lg border border-zinc-200 bg-zinc-50/60 p-3 text-xs text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-300">Snapshot metadata: {model.snapshot_meta.snapshot_id} · {model.snapshot_meta.window_start} → {model.snapshot_meta.window_end}</div>
            <div className="mb-3 rounded-lg border border-zinc-200 bg-zinc-50/60 p-3 text-xs text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-300">Provenance source: {model.rows.some((row) => row.provenance_source === 'snapshot_provenance') ? 'Snapshot provenance' : 'Aggregate fallback'}</div>
            <ProcessedDataViewerTable model={model} />
            <div className="mt-3 grid gap-2 text-xs md:grid-cols-3">
              <div className="rounded-lg border border-zinc-200 bg-zinc-50/60 p-2 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-300">QC summary: {model.snapshot_qc_flags.length} flags</div>
              <div className="rounded-lg border border-zinc-200 bg-zinc-50/60 p-2 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-300">Reliability summary: {model.snapshot_reliability.level}</div>
              <div className="rounded-lg border border-zinc-200 bg-zinc-50/60 p-2 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-300">Deterministic alerts: {model.snapshot_alerts.length}</div>
            </div>
            <div className="mt-4 flex gap-2">
              <button type="button" className="rounded-lg bg-emerald-600 px-3 py-2 text-sm text-white transition-colors hover:bg-emerald-700" onClick={onExport}>Export CSV</button>
              <button type="button" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800" onClick={() => setOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      </div>
    ) : null}
  </>;
}
