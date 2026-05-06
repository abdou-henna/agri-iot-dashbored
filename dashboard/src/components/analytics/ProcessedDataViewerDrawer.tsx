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
    <button type="button" className="rounded-md border border-slate-300 px-3 py-2 text-sm" onClick={() => setOpen(true)}>View processed data</button>
    {open ? <div className="fixed inset-0 z-50 bg-black/30">
      <div className="absolute right-0 top-0 h-full w-full overflow-y-auto bg-white p-4 md:w-[80%] lg:w-[70%]">
        <div className="mb-3 flex items-center justify-between"><h3 className="text-lg font-semibold">Processed Data / Cleaned Analytics Viewer</h3><button type="button" className="rounded border px-3 py-1" onClick={() => setOpen(false)}>Close</button></div>
        <p className="mb-3 text-xs text-slate-600">This viewer shows deterministic processed data. Gemini interpretation is not processed data.</p>
        <div className="mb-3 rounded border p-3 text-xs">Snapshot metadata: {model.snapshot_meta.snapshot_id} · {model.snapshot_meta.window_start} → {model.snapshot_meta.window_end}</div>
        <ProcessedDataViewerTable model={model} />
        <div className="mt-3 grid gap-2 text-xs md:grid-cols-3"><div className="rounded border p-2">QC summary: {model.snapshot_qc_flags.length} flags</div><div className="rounded border p-2">Reliability summary: {model.snapshot_reliability.level}</div><div className="rounded border p-2">Deterministic alerts: {model.snapshot_alerts.length}</div></div>
        <div className="mt-3"><button type="button" className="rounded bg-slate-900 px-3 py-2 text-sm text-white" onClick={onExport}>Export CSV</button></div>
      </div>
    </div> : null}
  </>;
}
