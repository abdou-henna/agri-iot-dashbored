import { useMemo, useState } from 'react';
import { useAgronomicAggregate } from '../../hooks/useAgronomicAggregate';
import { useAgronomicEvents, useCreateAgronomicEvent } from '../../hooks/useAgronomicEvents';
import { formatDisplayDate, formatDisplayTime } from '../../utils/time';

const nodes = ['MAIN', 'N2', 'N3'] as const;

export function AgronomyPage() {
  const [nodeId, setNodeId] = useState<(typeof nodes)[number]>('MAIN');
  const [note, setNote] = useState('');
  const [irrigating, setIrrigating] = useState(false);
  const range = useMemo(() => ({ from: new Date(Date.now() - 24 * 3_600_000).toISOString(), to: new Date().toISOString() }), []);
  const events = useAgronomicEvents({ node_id: nodeId, from: range.from, to: range.to, limit: 50 });
  const aggregate = useAgronomicAggregate({ node_id: nodeId, from: new Date(Date.now() - 7 * 24 * 3_600_000).toISOString(), to: new Date().toISOString(), bucket: 'day' });
  const createMutation = useCreateAgronomicEvent();

  const orderedEvents = events.data?.events?.slice().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) ?? [];

  return (
    <div className="mx-auto max-w-[420px] space-y-4 px-3 pb-6">
      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold">Node Filter</h2>
        <div className="mt-3 flex gap-2">
          {nodes.map((node) => (
            <button key={node} className={`min-h-11 flex-1 rounded-md border px-3 ${nodeId === node ? 'bg-slate-900 text-white' : 'bg-white'}`} onClick={() => setNodeId(node)}>
              {node}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold">Irrigation Quick Actions</h2>
        <div className="mt-3 text-sm text-slate-600">Current state: {irrigating ? 'Irrigating' : 'Stopped'}</div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            className="min-h-12 rounded-md bg-green-600 px-4 text-white"
            onClick={async () => {
              setIrrigating(true);
              await createMutation.mutateAsync({ node_id: nodeId, type: 'irrigation_start' });
            }}
          >
            Start Irrigation
          </button>
          <button
            className="min-h-12 rounded-md bg-red-600 px-4 text-white"
            onClick={async () => {
              setIrrigating(false);
              await createMutation.mutateAsync({ node_id: nodeId, type: 'irrigation_stop' });
            }}
          >
            Stop Irrigation
          </button>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold">Irrigation Timeline (24h)</h2>
        <div className="mt-3 space-y-2">
          {orderedEvents.filter((e) => e.type === 'irrigation_start' || e.type === 'irrigation_stop').length ? (
            orderedEvents
              .filter((e) => e.type === 'irrigation_start' || e.type === 'irrigation_stop')
              .map((event) => (
                <div key={event.id} className={`rounded-md p-3 text-sm ${event.type === 'irrigation_start' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                  <div className="font-semibold">{event.type === 'irrigation_start' ? 'Start' : 'Stop'}</div>
                  <div>{formatDisplayTime(event.created_at)}</div>
                </div>
              ))
          ) : (
            <div className="text-sm text-slate-500">No irrigation events in the last 24h.</div>
          )}
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold">Daily Irrigation Chart</h2>
        <div className="mt-3 space-y-2">
          {aggregate.data?.points?.length ? (
            aggregate.data.points.map((point) => (
              <div key={point.bucket_start} className="rounded-md bg-slate-50 p-2">
                <div className="mb-1 text-xs text-slate-500">{formatDisplayDate(point.bucket_start)}</div>
                <div className="h-3 w-full rounded bg-slate-200">
                  <div className="h-3 rounded bg-blue-600" style={{ width: `${Math.min((point.irrigation_minutes_total / 240) * 100, 100)}%` }} />
                </div>
                <div className="mt-1 text-xs">{point.irrigation_minutes_total.toFixed(1)} min</div>
              </div>
            ))
          ) : (
            <div className="text-sm text-slate-500">No aggregate irrigation data.</div>
          )}
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold">Manual Notes</h2>
        <textarea className="mt-3 min-h-28 w-full rounded-md border border-slate-300 p-3" placeholder="Add field note..." value={note} onChange={(e) => setNote(e.target.value)} />
        <button
          className="mt-3 min-h-12 w-full rounded-md bg-slate-900 text-white"
          onClick={async () => {
            if (!note.trim()) return;
            await createMutation.mutateAsync({ node_id: nodeId, type: 'manual_note', metadata: { note: note.trim() } });
            setNote('');
          }}
        >
          Submit Note
        </button>
      </section>
    </div>
  );
}

