import { useState } from 'react';
import { useSeason } from '../../hooks/useAgronomyPhase5';
import { formatDisplayTime } from '../../utils/time';

function localNoonIsoFromDate(dateValue: string) {
  const targetDate = dateValue || new Date().toISOString().slice(0, 10);
  return new Date(`${targetDate}T12:00:00`).toISOString();
}

const INPUT_CLASS = 'mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm';
const SELECT_CLASS = 'mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200';

export function SeasonPage() {
  const { activeSeason, startSeason, endSeason, isLoading, error } = useSeason();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [targetScope, setTargetScope] = useState<'farm' | 'pivot_1' | 'pivot_2' | 'both_pivots'>('farm');
  const [confidence, setConfidence] = useState<'exact' | 'estimated'>('exact');
  const [formError, setFormError] = useState<string | null>(null);

  return <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
    <h2 className="text-lg font-semibold">Season</h2>
    <div className="text-sm">Active season: {activeSeason ? `${formatDisplayTime(activeSeason.started_at)}${activeSeason.ended_at ? ` → ${formatDisplayTime(activeSeason.ended_at)}` : ' (active)'}` : 'None'}</div>
    {activeSeason?.notes ? <div className="text-sm text-slate-600">Notes: {activeSeason.notes}</div> : null}

    <div className="grid gap-3 md:grid-cols-2">
      <div>
        <label className="text-sm font-medium">Season start date</label>
        <input type="date" className={INPUT_CLASS} value={startDate} onChange={(event) => setStartDate(event.target.value)} />
      </div>
      <div>
        <label className="text-sm font-medium">Season end date (optional)</label>
        <input type="date" className={INPUT_CLASS} value={endDate} onChange={(event) => setEndDate(event.target.value)} />
      </div>
      <div>
        <label className="text-sm font-medium">Target scope</label>
        <select className={SELECT_CLASS} value={targetScope} onChange={(event) => setTargetScope(event.target.value as typeof targetScope)}>
          <option value="farm">Farm</option>
          <option value="pivot_1">Pivot 1</option>
          <option value="pivot_2">Pivot 2</option>
          <option value="both_pivots">Both pivots</option>
        </select>
      </div>
      <div>
        <label className="text-sm font-medium">Confidence</label>
        <select className={SELECT_CLASS} value={confidence} onChange={(event) => setConfidence(event.target.value as 'exact' | 'estimated')}>
          <option value="exact">Exact</option>
          <option value="estimated">Estimated</option>
        </select>
      </div>
    </div>
    <div>
      <label className="text-sm font-medium">Notes (optional)</label>
      <textarea className={INPUT_CLASS} rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} />
    </div>

    <div className="grid grid-cols-2 gap-2">
      <button className="rounded-md bg-green-600 px-3 py-2 text-white disabled:opacity-50" disabled={isLoading} onClick={async () => {
        setFormError(null);
        await startSeason({ target_scope: targetScope, started_at: localNoonIsoFromDate(startDate), confidence, notes: notes.trim() || null, details: {} });
      }}>Save season start</button>
      <button className="rounded-md bg-red-600 px-3 py-2 text-white disabled:opacity-50" disabled={!activeSeason || isLoading} onClick={async () => {
        setFormError(null);
        if (!activeSeason) return setFormError('No active season to end.');
        await endSeason({ target_scope: activeSeason.target_scope, started_at: activeSeason.started_at, ended_at: localNoonIsoFromDate(endDate), confidence, notes: notes.trim() || activeSeason.notes || null, details: {} });
      }}>Save season end</button>
    </div>
    {formError ? <div className="text-sm text-red-600">{formError}</div> : null}
    {error ? <div className="text-sm text-red-600">{(error as Error).message}</div> : null}
  </section>;
}
