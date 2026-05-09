import { useEffect, useMemo, useState } from 'react';
import { createAgronomicEvent } from '../../api/agronomy.api';
import { useAgronomicEvents } from '../../hooks/useAgronomicEvents';
import { useIrrigationSession } from '../../hooks/useIrrigationSession';
import { getCurrentDisplayTimezone, formatDisplayTime } from '../../utils/time';

export function AgronomyPage() {
  const [note, setNote] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [nowTs, setNowTs] = useState(Date.now());
  const [backfillStartedAt, setBackfillStartedAt] = useState('');
  const [backfillEndedAt, setBackfillEndedAt] = useState('');
  const [backfillDurationMinutes, setBackfillDurationMinutes] = useState('');
  const [backfillTargetScope, setBackfillTargetScope] = useState<'pivot_1' | 'pivot_2' | 'both_pivots' | 'farm' | 'unknown'>('both_pivots');
  const [backfillConfidence, setBackfillConfidence] = useState<'exact' | 'estimated'>('exact');
  const [backfillNotes, setBackfillNotes] = useState('');
  const timezone = getCurrentDisplayTimezone();
  const { activeSession, todaySessions, isIrrigating, startIrrigation, endIrrigation, refetchSession, isStarting, isEnding, error } = useIrrigationSession();
  const noteEvents = useAgronomicEvents({ event_category: 'field_note', limit: 10 });
  useEffect(() => {
    const id = window.setInterval(() => setNowTs(Date.now()), 30_000);
    return () => window.clearInterval(id);
  }, []);
  useEffect(() => {
    refetchSession();
  }, [refetchSession]);
  const durationText = useMemo(() => {
    if (!activeSession?.started_at) return '—';
    const diffMin = Math.max(0, Math.floor((nowTs - new Date(activeSession.started_at).getTime()) / 60_000));
    const h = Math.floor(diffMin / 60);
    const m = diffMin % 60;
    return h ? `${h}h ${m}m` : `${m}m`;
  }, [activeSession?.started_at, nowTs]);
  const isStaleActiveSession = useMemo(() => {
    if (!activeSession?.started_at) return false;
    return nowTs - new Date(activeSession.started_at).getTime() > 12 * 60 * 60 * 1000;
  }, [activeSession?.started_at, nowTs]);

  return (
    <div className="mx-auto max-w-[420px] space-y-4 px-3 pb-6">
      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold">Irrigation</h2>
        <div className="mt-1 text-xs text-zinc-500">All times shown in {timezone}</div>
        <div className="mt-3 text-sm text-zinc-600">Current state: {isIrrigating ? 'Running' : 'Stopped'}</div>
        <div className={`mt-2 rounded-md px-3 py-2 text-sm ${isIrrigating ? 'bg-green-50 text-green-700 transition-colors duration-300' : 'bg-zinc-100 text-zinc-600'}`}>
          Active timer: {isIrrigating ? durationText : 'No active session'}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            className="min-h-12 rounded-md bg-green-600 px-4 text-white transition-transform duration-150 active:scale-[0.98] disabled:opacity-50"
            disabled={Boolean(activeSession) || isStarting}
            onClick={async () => {
              setFormError(null);
              if (isIrrigating) {
                setFormError('Irrigation already active. End current session first.');
                return;
              }
              await startIrrigation({ target_scope: 'both_pivots', confidence: 'exact', started_at: new Date().toISOString() });
              await refetchSession();
            }}
          >
            {isStarting ? 'Starting...' : 'Start'}
          </button>
          <button
            className="min-h-12 rounded-md bg-red-600 px-4 text-white transition-transform duration-150 active:scale-[0.98] disabled:opacity-50"
            disabled={!activeSession || isEnding}
            onClick={async () => {
              setFormError(null);
              try {
                await endIrrigation({ ended_at: new Date().toISOString(), confidence: 'exact' });
                await refetchSession();
              } catch (operationError) {
                const message = typeof operationError === 'object' && operationError !== null && 'message' in operationError
                  ? String((operationError as { message: unknown }).message)
                  : 'Failed to end irrigation session.';
                setFormError(message);
              }
            }}
          >
            {isEnding ? 'Ending...' : 'End'}
          </button>
        </div>
        {isStaleActiveSession ? (
          <div className="mt-2 text-sm text-amber-700">This irrigation session has been running for a long time.</div>
        ) : null}
        {formError ? <div className="mt-2 text-sm text-red-600">{formError}</div> : null}
        {error ? <div className="mt-2 text-sm text-red-600">{(error as Error).message ?? 'Operation failed'}</div> : null}
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold">Recent sessions</h2>
        <div className="mt-3 space-y-2">
          {todaySessions.length ? (
            todaySessions.slice(0, 5).map((session) => {
              const mins = session.ended_at ? Math.max(0, Math.round((new Date(session.ended_at).getTime() - new Date(session.started_at).getTime()) / 60_000)) : 0;
              return (
                <div key={session.agro_event_id} className="rounded-xl bg-zinc-50 p-3 text-sm">
                  <div className="font-semibold">Irrigation session</div>
                  <div>Start: {formatDisplayTime(session.started_at)}</div>
                  <div>End: {formatDisplayTime(session.ended_at)}</div>
                  <div>Duration: {mins} min</div>
                </div>
              );
            })
          ) : (
            <div className="text-sm text-zinc-500">No completed sessions today.</div>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold">IrrigationStartForm (scaffold)</h2>
        <p className="mt-2 text-sm text-zinc-500">Uses defaults: target_scope=both_pivots, confidence=exact, started_at=now.</p>
      </section>
      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold">IrrigationEndForm (scaffold)</h2>
        <p className="mt-2 text-sm text-zinc-500">ended_at defaults to now and must be after started_at.</p>
      </section>
      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold">Add completed irrigation</h2>
        <div className="mt-3 grid gap-2">
          <label className="text-sm text-zinc-700">Started at</label>
          <input className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" type="datetime-local" value={backfillStartedAt} onChange={(e) => setBackfillStartedAt(e.target.value)} />
          <label className="text-sm text-zinc-700">Ended at</label>
          <input className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" type="datetime-local" value={backfillEndedAt} onChange={(e) => setBackfillEndedAt(e.target.value)} />
          <label className="text-sm text-zinc-700">OR Duration minutes</label>
          <input className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" type="number" min={1} placeholder="e.g. 45" value={backfillDurationMinutes} onChange={(e) => setBackfillDurationMinutes(e.target.value)} />
          <label className="text-sm text-zinc-700">Target scope</label>
          <select className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" value={backfillTargetScope} onChange={(e) => setBackfillTargetScope(e.target.value as typeof backfillTargetScope)}>
            <option value="both_pivots">Both pivots</option><option value="pivot_1">Pivot 1</option><option value="pivot_2">Pivot 2</option><option value="farm">Farm</option><option value="unknown">Unknown</option>
          </select>
          <label className="text-sm text-zinc-700">Confidence</label>
          <select className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" value={backfillConfidence} onChange={(e) => setBackfillConfidence(e.target.value as 'exact' | 'estimated')}>
            <option value="exact">exact</option><option value="estimated">estimated</option>
          </select>
          <label className="text-sm text-zinc-700">Notes</label>
          <textarea className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" value={backfillNotes} onChange={(e) => setBackfillNotes(e.target.value)} />
          <button className="mt-2 min-h-10 rounded-lg bg-emerald-600 px-3 text-white hover:bg-emerald-700" onClick={async () => {
            setFormError(null);
            if (!backfillStartedAt) return setFormError('started_at is required.');
            const startedAt = new Date(backfillStartedAt).toISOString();
            let endedAt = backfillEndedAt ? new Date(backfillEndedAt).toISOString() : '';
            const duration = backfillDurationMinutes ? Number(backfillDurationMinutes) : 0;
            if (endedAt && new Date(endedAt) <= new Date(startedAt)) return setFormError('ended_at must be after started_at.');
            if (!endedAt) {
              if (!duration || duration <= 0) return setFormError('Provide ended_at or duration_minutes > 0.');
              endedAt = new Date(new Date(startedAt).getTime() + duration * 60_000).toISOString();
            }
            const durationMin = Math.max(1, Math.round((new Date(endedAt).getTime() - new Date(startedAt).getTime()) / 60_000));
            await createAgronomicEvent({
              event_category: 'irrigation',
              event_type: 'irrigation_session',
              target_scope: backfillTargetScope,
              started_at: startedAt,
              ended_at: endedAt,
              confidence: backfillConfidence,
              details: { duration_min: durationMin, status: 'completed' },
              notes: backfillNotes.trim() || null,
            });
            setBackfillStartedAt('');
            setBackfillEndedAt('');
            setBackfillDurationMinutes('');
            setBackfillNotes('');
            await refetchSession();
          }}>Save completed irrigation</button>
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold">Manual Notes</h2>
        <textarea className="mt-3 min-h-28 w-full rounded-md border border-zinc-300 p-3" placeholder="Add field note..." value={note} onChange={(e) => setNote(e.target.value)} />
        <button
          className="mt-3 min-h-12 w-full rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
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
        {noteEvents.data?.events?.length ? <div className="mt-3 text-xs text-zinc-500">Recent notes: {noteEvents.data.count}</div> : null}
      </section>
    </div>
  );
}
