import { useState } from 'react';
import { useFertilization } from '../../hooks/useAgronomyPhase5';

export function FertilizationPage() {
  const { data, createFertilization } = useFertilization();
  const [startedAt, setStartedAt] = useState('');
  const [error, setError] = useState<string | null>(null);
  const rows = data?.events ?? [];
  return <section className="rounded-lg border border-slate-200 bg-white p-4">
    <h2 className="text-lg font-semibold">Fertilization</h2>
    <input type="datetime-local" className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2" value={startedAt} onChange={(e) => setStartedAt(e.target.value)} />
    <button className="mt-2 rounded-md bg-slate-900 px-3 py-2 text-white" onClick={async () => {
      setError(null);
      if (!startedAt) return setError('Valid datetime required.');
      await createFertilization({ target_scope: 'farm', started_at: new Date(startedAt).toISOString(), confidence: 'exact', details: { fertilizer_type: 'general', amount: 1, unit: 'kg' } });
    }}>Record fertilization</button>
    {error ? <div className="mt-2 text-sm text-red-600">{error}</div> : null}
    <div className="mt-3 space-y-2 text-sm">{rows.length ? rows.map((item) => <div key={item.agro_event_id} className="rounded bg-slate-50 p-2">{item.agro_event_id}</div>) : 'No fertilization events yet.'}</div>
  </section>;
}
