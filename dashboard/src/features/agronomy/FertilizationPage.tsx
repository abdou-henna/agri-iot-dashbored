import { useState } from 'react';
import { useFertilization } from '../../hooks/useAgronomyPhase5';
import type { TargetScope } from '../../types/common';

export function FertilizationPage() {
  const { data, createFertilization } = useFertilization();
  const [startedAt, setStartedAt] = useState('');
  const [fertilizerName, setFertilizerName] = useState('');
  const [amount, setAmount] = useState('');
  const [unit, setUnit] = useState('');
  const [targetScope, setTargetScope] = useState<TargetScope>('farm');
  const [confidence, setConfidence] = useState<'exact' | 'estimated'>('exact');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const rows = data?.events ?? [];

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-lg font-semibold">Fertilization</h2>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <label className="text-sm">
          <div className="mb-1 font-medium text-zinc-700">Date & time *</div>
          <input type="datetime-local" className="w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" value={startedAt} onChange={(e) => setStartedAt(e.target.value)} />
        </label>
        <label className="text-sm">
          <div className="mb-1 font-medium text-zinc-700">Fertilizer name/type *</div>
          <input type="text" className="w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" value={fertilizerName} onChange={(e) => setFertilizerName(e.target.value)} placeholder="e.g. Urea 46%" />
        </label>
        <label className="text-sm">
          <div className="mb-1 font-medium text-zinc-700">Amount</div>
          <input type="number" min="0" step="any" className="w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </label>
        <label className="text-sm">
          <div className="mb-1 font-medium text-zinc-700">Unit</div>
          <input type="text" className="w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="kg / L" />
        </label>
        <label className="text-sm">
          <div className="mb-1 font-medium text-zinc-700">Target scope *</div>
          <select className="w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" value={targetScope} onChange={(e) => setTargetScope(e.target.value as TargetScope)}>
            <option value="farm">farm</option>
            <option value="pivot_1">pivot_1</option>
            <option value="pivot_2">pivot_2</option>
          </select>
        </label>
        <label className="text-sm">
          <div className="mb-1 font-medium text-zinc-700">Confidence *</div>
          <select className="w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" value={confidence} onChange={(e) => setConfidence(e.target.value as 'exact' | 'estimated')}>
            <option value="exact">exact</option>
            <option value="estimated">estimated</option>
          </select>
        </label>
        <label className="text-sm md:col-span-2">
          <div className="mb-1 font-medium text-zinc-700">Notes</div>
          <textarea className="w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
        </label>
      </div>

      <button
        className="mt-3 rounded-lg bg-emerald-600 px-3 py-2 text-white hover:bg-emerald-700"
        onClick={async () => {
          setError(null);
          if (!startedAt) return setError('Datetime is required.');
          if (!fertilizerName.trim()) return setError('Fertilizer name/type is required.');

          const parsedAmount = amount.trim() ? Number(amount) : null;
          if (parsedAmount !== null && Number.isNaN(parsedAmount)) return setError('Amount must be numeric.');

          const details: Record<string, unknown> = { fertilizer_name: fertilizerName.trim(), fertilizer_type: fertilizerName.trim() };
          if (parsedAmount !== null) details.amount = parsedAmount;
          if (unit.trim()) details.unit = unit.trim();

          await createFertilization({
            target_scope: targetScope,
            started_at: new Date(startedAt).toISOString(),
            confidence,
            notes: notes.trim() || undefined,
            details,
          });

          setStartedAt('');
          setFertilizerName('');
          setAmount('');
          setUnit('');
          setNotes('');
        }}
      >
        Record fertilization
      </button>
      {error ? <div className="mt-2 text-sm text-red-600">{error}</div> : null}

      <div className="mt-4 space-y-2 text-sm">
        {rows.length
          ? rows.map((item) => {
              const details = item.details as Record<string, unknown>;
              const name = String(details.fertilizer_name ?? details.fertilizer_type ?? '—');
              const amountText = typeof details.amount === 'number' ? `${details.amount}${details.unit ? ` ${String(details.unit)}` : ''}` : '—';
              return (
                <div key={item.agro_event_id} className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800">
                  <div><span className="font-medium">Time:</span> {new Date(item.started_at).toLocaleString()}</div>
                  <div><span className="font-medium">Fertilizer:</span> {name}</div>
                  <div><span className="font-medium">Amount:</span> {amountText}</div>
                  <div><span className="font-medium">Target scope:</span> {item.target_scope}</div>
                  {item.notes ? <div><span className="font-medium">Notes:</span> {item.notes}</div> : null}
                </div>
              );
            })
          : 'No fertilization events yet.'}
      </div>
    </section>
  );
}
