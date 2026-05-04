import { useState } from 'react';
import { useSeason } from '../../hooks/useAgronomyPhase5';

export function SeasonPage() {
  const { activeSeason, startSeason, endSeason, isLoading, error } = useSeason();
  const [formError, setFormError] = useState<string | null>(null);
  return <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
    <h2 className="text-lg font-semibold">Season</h2>
    <div className="text-sm">Active season: {activeSeason ? activeSeason.agro_event_id : 'None'}</div>
    <div className="grid grid-cols-2 gap-2">
      <button className="rounded-md bg-green-600 px-3 py-2 text-white disabled:opacity-50" disabled={Boolean(activeSeason) || isLoading} onClick={async () => {
        setFormError(null);
        if (activeSeason) return setFormError('Active season exists. End it before starting another.');
        await startSeason({ target_scope: 'farm', started_at: new Date().toISOString(), confidence: 'exact' });
      }}>Start season</button>
      <button className="rounded-md bg-red-600 px-3 py-2 text-white disabled:opacity-50" disabled={!activeSeason || isLoading} onClick={async () => {
        setFormError(null);
        if (!activeSeason) return setFormError('No active season to end.');
        await endSeason({ target_scope: activeSeason.target_scope, started_at: activeSeason.started_at, ended_at: new Date().toISOString(), confidence: 'exact' });
      }}>End season</button>
    </div>
    {formError ? <div className="text-sm text-red-600">{formError}</div> : null}
    {error ? <div className="text-sm text-red-600">{(error as Error).message}</div> : null}
  </section>;
}
