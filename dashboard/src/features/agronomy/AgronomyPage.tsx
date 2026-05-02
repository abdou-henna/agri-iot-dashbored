import { useMemo, useState } from 'react';
import { createAgronomicEvent } from '../../api/agronomy.api';
import { useAgronomicEvents } from '../../hooks/useAgronomicEvents';
import { useIrrigationSession } from '../../hooks/useIrrigationSession';
import { getCurrentDisplayTimezone, formatDisplayTime } from '../../utils/time';

export function AgronomyPage() {
  const [note, setNote] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const timezone = getCurrentDisplayTimezone();
  const { activeSession, todaySessions, isIrrigating, startIrrigation, endIrrigation, isStarting, isEnding, error } = useIrrigationSession();
  const noteEvents = useAgronomicEvents({ event_category: 'field_note', limit: 10 });
  const durationText = useMemo(() => {
    if (!activeSession?.started_at) return '—';
    const diffMin = Math.max(0, Math.floor((Date.now() - new Date(activeSession.started_at).getTime()) / 60_000));
    const h = Math.floor(diffMin / 60);
    const m = diffMin % 60;
    return h ? `${h}h ${m}m` : `${m}m`;
  }, [activeSession?.started_at]);

  return (
    <div className="mx-auto max-w-[420px] space-y-4 px-3 pb-6">
      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold">Irrigation</h2>
        <div className="mt-1 text-xs text-slate-500">All times shown in {timezone}</div>
        <div className="mt-3 text-sm text-slate-600">Current state: {isIrrigating ? 'Irrigating' : 'Stopped'}</div>
        <div className={`mt-2 rounded-md px-3 py-2 text-sm ${isIrrigating ? 'bg-green-50 text-green-700 transition-colors duration-300' : 'bg-slate-100 text-slate-600'}`}>
          Active timer: {isIrrigating ? durationText : 'No active session'}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            className="min-h-12 rounded-md bg-green-600 px-4 text-white transition-transform duration-150 active:scale-[0.98] disabled:opacity-50"
            disabled={isIrrigating || isStarting}
            onClick={async () => {
              setFormError(null);
              if (isIrrigating) {
                setFormError('Irrigation already active. End current session first.');
                return;
              }
              await startIrrigation({ target_scope: 'both_pivots', confidence: 'exact', started_at: new Date().toISOString() });
            }}
          >
            {isStarting ? 'Starting...' : 'Start'}
          </button>
          <button
            className="min-h-12 rounded-md bg-red-600 px-4 text-white transition-transform duration-150 active:scale-[0.98] disabled:opacity-50"
            disabled={!isIrrigating || isEnding}
            onClick={async () => {
              setFormError(null);
              const endedAt = new Date().toISOString();
              if (activeSession?.started_at && new Date(endedAt) <= new Date(activeSession.started_at)) {
                setFormError('End time must be after start time.');
                return;
              }
              await endIrrigation({ ended_at: endedAt, confidence: 'exact' });
            }}
          >
            {isEnding ? 'Ending...' : 'End'}
          </button>
        </div>
        {formError ? <div className="mt-2 text-sm text-red-600">{formError}</div> : null}
        {error ? <div className="mt-2 text-sm text-red-600">{(error as Error).message ?? 'Operation failed'}</div> : null}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold">Recent sessions</h2>
        <div className="mt-3 space-y-2">
          {todaySessions.length ? (
            todaySessions.slice(0, 5).map((session) => {
              const mins = session.ended_at ? Math.max(0, Math.round((new Date(session.ended_at).getTime() - new Date(session.started_at).getTime()) / 60_000)) : 0;
              return (
                <div key={session.agro_event_id} className="rounded-md bg-slate-50 p-3 text-sm">
                  <div className="font-semibold">Irrigation session</div>
                  <div>Start: {formatDisplayTime(session.started_at)}</div>
                  <div>End: {formatDisplayTime(session.ended_at)}</div>
                  <div>Duration: {mins} min</div>
                </div>
              );
            })
          ) : (
            <div className="text-sm text-slate-500">No completed sessions today.</div>
          )}
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold">IrrigationStartForm (scaffold)</h2>
        <p className="mt-2 text-sm text-slate-500">Uses defaults: target_scope=both_pivots, confidence=exact, started_at=now.</p>
      </section>
      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold">IrrigationEndForm (scaffold)</h2>
        <p className="mt-2 text-sm text-slate-500">ended_at defaults to now and must be after started_at.</p>
      </section>
      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold">IrrigationBackfillForm (scaffold)</h2>
        <p className="mt-2 text-sm text-slate-500">Scaffold only for Phase 4 completion.</p>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold">Manual Notes</h2>
        <textarea className="mt-3 min-h-28 w-full rounded-md border border-slate-300 p-3" placeholder="Add field note..." value={note} onChange={(e) => setNote(e.target.value)} />
        <button
          className="mt-3 min-h-12 w-full rounded-md bg-slate-900 text-white"
          onClick={async () => {
            if (!note.trim()) return;
            await createAgronomicEvent({
              event_category: 'field_note',
              event_type: 'manual_note',
              target_scope: 'both_pivots',
              started_at: new Date().toISOString(),
              confidence: 'exact',
              details: {},
              notes: note.trim(),
            });
            setNote('');
          }}
        >
          Submit Note
        </button>
        {noteEvents.data?.events?.length ? <div className="mt-3 text-xs text-slate-500">Recent notes: {noteEvents.data.count}</div> : null}
      </section>
    </div>
  );
}
