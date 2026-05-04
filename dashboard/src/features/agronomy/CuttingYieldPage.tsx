import { useMemo, useState } from 'react';
import { useCuttingEvents, useSeason, useYield } from '../../hooks/useAgronomyPhase5';

export function CuttingYieldPage() {
  const { activeSeason } = useSeason();
  const { data: cuttingData, createCutting } = useCuttingEvents();
  const { data: yieldData, createYield } = useYield();
  const [yieldCuttingId, setYieldCuttingId] = useState('');
  const [yieldAmount, setYieldAmount] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const cuttings = cuttingData?.events ?? [];
  const yields = yieldData?.events ?? [];
  const sortedCuttings = useMemo(() => cuttings, [cuttings]);

  return <div className="space-y-4">
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="text-lg font-semibold">Cutting</h2>
      <button className="mt-2 rounded-md bg-slate-900 px-3 py-2 text-white disabled:opacity-50" disabled={!activeSeason} onClick={async () => {
        setFormError(null);
        if (!activeSeason) return setFormError('Active season required for cutting events.');
        await createCutting({ target_scope: activeSeason.target_scope, started_at: new Date().toISOString(), confidence: 'exact' });
      }}>Record cutting</button>
      <div className="mt-3 space-y-2 text-sm">{sortedCuttings.length ? sortedCuttings.map((item) => <div key={item.agro_event_id} className="rounded bg-slate-50 p-2">{item.agro_event_id}</div>) : 'No cuttings yet.'}</div>
    </section>

    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="text-lg font-semibold">Yield</h2>
      <select className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2" value={yieldCuttingId} onChange={(e) => setYieldCuttingId(e.target.value)}>
        <option value="">Select cutting event</option>
        {sortedCuttings.map((cutting) => <option key={cutting.agro_event_id} value={cutting.agro_event_id}>{cutting.agro_event_id}</option>)}
      </select>
      <input className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2" placeholder="Yield amount" value={yieldAmount} onChange={(e) => setYieldAmount(e.target.value)} />
      <button className="mt-2 rounded-md bg-slate-900 px-3 py-2 text-white" onClick={async () => {
        setFormError(null);
        if (!yieldCuttingId) return setFormError('Yield must reference a cutting_event.');
        const amount = Number(yieldAmount);
        if (!amount || amount <= 0) return setFormError('Yield amount must be > 0.');
        await createYield({ target_scope: 'farm', started_at: new Date().toISOString(), confidence: 'exact', details: { cutting_event_id: yieldCuttingId, yield_amount: amount, yield_unit: 'kg' } });
        setYieldAmount('');
      }}>Add yield record</button>
      {formError ? <div className="mt-2 text-sm text-red-600">{formError}</div> : null}
      <div className="mt-3 space-y-2 text-sm">{yields.length ? yields.map((item) => <div key={item.agro_event_id} className="rounded bg-slate-50 p-2">{item.agro_event_id}</div>) : 'No yield records yet.'}</div>
    </section>
  </div>;
}
