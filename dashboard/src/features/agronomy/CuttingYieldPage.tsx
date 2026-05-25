import { useMemo, useState } from 'react';
import { useCuttingEvents, useSeason, useYield } from '../../hooks/useAgronomyPhase5';
import type { TargetScope } from '../../types/common';
import { formatDisplayTime } from '../../utils/time';

const SELECT_CLASS = 'mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100';

function localNoonIsoFromDate(dateValue: string) {
  const targetDate = dateValue || new Date().toISOString().slice(0, 10);
  const local = new Date(`${targetDate}T12:00:00`);
  return local.toISOString();
}

export function CuttingYieldPage() {
  const { activeSeason } = useSeason();
  const { data: cuttingData, createCutting } = useCuttingEvents();
  const { data: yieldData, createYield } = useYield();
  const [targetScope, setTargetScope] = useState<TargetScope>('farm');
  const [confidence, setConfidence] = useState<'exact' | 'estimated'>('exact');
  const [cuttingDate, setCuttingDate] = useState('');
  const [yieldCuttingId, setYieldCuttingId] = useState('');
  const [yieldAmount, setYieldAmount] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const cuttings = cuttingData?.events ?? [];
  const yields = yieldData?.events ?? [];
  const sortedCuttings = useMemo(() => cuttings, [cuttings]);

  return <div className="space-y-4">
    <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-lg font-semibold">Cutting</h2>
      <label className="mt-3 block text-sm font-medium">Date</label>
      <input type="date" className={SELECT_CLASS} value={cuttingDate} onChange={(event) => setCuttingDate(event.target.value)} />
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Target scope</label>
          <select className={SELECT_CLASS} value={targetScope} onChange={(e) => setTargetScope(e.target.value as TargetScope)}>
            <option value="farm">Farm</option>
            <option value="pivot_1">Pivot 1</option>
            <option value="pivot_2">Pivot 2</option>
            <option value="both_pivots">Both pivots</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Confidence</label>
          <select className={SELECT_CLASS} value={confidence} onChange={(e) => setConfidence(e.target.value as 'exact' | 'estimated')}>
            <option value="exact">Exact</option>
            <option value="estimated">Estimated</option>
          </select>
        </div>
      </div>
      <button className="mt-3 rounded-lg bg-emerald-600 px-3 py-2 text-white hover:bg-emerald-700 disabled:opacity-50" disabled={!activeSeason} onClick={async () => {
        setFormError(null);
        if (!activeSeason) return setFormError('Active season required for cutting events.');
        await createCutting({ target_scope: targetScope, started_at: localNoonIsoFromDate(cuttingDate), confidence });
      }}>Record cutting</button>
      <div className="mt-3 space-y-2 text-sm">{sortedCuttings.length ? sortedCuttings.map((item) => <div key={item.agro_event_id} className="rounded bg-zinc-50 p-2">{formatDisplayTime(item.started_at)} · {item.agro_event_id}</div>) : 'No cuttings yet.'}</div>
    </section>

    <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-lg font-semibold">Yield</h2>
      <select className={SELECT_CLASS} value={yieldCuttingId} onChange={(e) => setYieldCuttingId(e.target.value)}>
        <option value="">Select cutting event</option>
        {sortedCuttings.map((cutting) => <option key={cutting.agro_event_id} value={cutting.agro_event_id}>{cutting.agro_event_id}</option>)}
      </select>
      <label className="mt-2 block text-sm font-medium">Yield amount (alfalfa cubes)</label>
      <input className="mt-2 w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" placeholder="e.g. 65" value={yieldAmount} onChange={(e) => setYieldAmount(e.target.value)} />
      <button className="mt-2 rounded-lg bg-emerald-600 px-3 py-2 text-white hover:bg-emerald-700" onClick={async () => {
        setFormError(null);
        if (!yieldCuttingId) return setFormError('Yield must reference a cutting_event.');
        const selectedCutting = sortedCuttings.find((c) => c.agro_event_id === yieldCuttingId);
        if (!selectedCutting) return setFormError('Selected cutting event not found.');
        const amount = Number(yieldAmount);
        if (!amount || amount <= 0) return setFormError('Yield amount must be > 0.');
        await createYield({ target_scope: 'farm', started_at: selectedCutting.started_at, confidence: 'exact', details: { cutting_event_id: yieldCuttingId, yield_amount: amount, yield_unit: 'alfalfa_cube' } });
        setYieldAmount('');
      }}>Add yield record</button>
      {formError ? <div className="mt-2 text-sm text-red-600">{formError}</div> : null}
      <div className="mt-3 space-y-2 text-sm">{yields.length ? yields.map((item) => {
        const d = (item.details ?? {}) as { yield_amount?: number; yield_unit?: string; cutting_event_id?: string };
        const unitLabel = d.yield_unit === 'alfalfa_cube' ? 'alfalfa cubes' : d.yield_unit === 'kg' ? 'kg (legacy)' : d.yield_unit ?? '';
        return <div key={item.agro_event_id} className="rounded bg-zinc-50 p-2">{d.yield_amount} {unitLabel} · Cutting: {d.cutting_event_id ?? item.agro_event_id}</div>;
      }) : 'No yield records yet.'}</div>
    </section>
  </div>;
}
