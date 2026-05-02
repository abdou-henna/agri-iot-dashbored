import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState, ErrorBlock, LoadingBlock } from '../../components/feedback/States';
import { useEvents } from '../../hooks/useEvents';
import { useTimeZone } from '../../hooks/useTimeZone';
import type { EventSeverity, NodeId } from '../../types/common';
import { formatDisplayTime, rangeForPreset } from '../../utils/time';

const severities: EventSeverity[] = ['info', 'warning', 'error', 'critical'];

export function LogsPage() {
  const [selectedSeverities, setSelectedSeverities] = useState<EventSeverity[]>(severities);
  const [nodeId, setNodeId] = useState<NodeId | ''>('');
  const [uploadId, setUploadId] = useState('');
  const { timezone } = useTimeZone();
  const range = useMemo(() => rangeForPreset('7d'), []);
  const events = useEvents({
    severity: selectedSeverities,
    node_id: nodeId || undefined,
    upload_id: uploadId || undefined,
    from: range.from,
    to: range.to,
    limit: 50,
  });

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_160px_1fr_auto]">
          <div className="flex flex-wrap gap-2">
            {severities.map((severity) => {
              const active = selectedSeverities.includes(severity);
              return (
                <button
                  key={severity}
                  className={`rounded-md border px-3 py-2 text-sm uppercase ${
                    active ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-700'
                  }`}
                  onClick={() =>
                    setSelectedSeverities((current) =>
                      current.includes(severity) ? current.filter((item) => item !== severity) : [...current, severity],
                    )
                  }
                >
                  {severity}
                </button>
              );
            })}
          </div>
          <select className="rounded-md border border-slate-200 px-3 py-2" value={nodeId} onChange={(event) => setNodeId(event.target.value as NodeId | '')}>
            <option value="">All nodes</option>
            <option value="MAIN">MAIN</option>
            <option value="N2">N2</option>
            <option value="N3">N3</option>
          </select>
          <input
            className="rounded-md border border-slate-200 px-3 py-2"
            placeholder="Upload ID"
            value={uploadId}
            onChange={(event) => setUploadId(event.target.value)}
          />
          <button
            className="rounded-md border border-slate-200 px-3 py-2 text-sm"
            onClick={() => {
              setSelectedSeverities(severities);
              setNodeId('');
              setUploadId('');
            }}
          >
            Clear filters
          </button>
        </div>
      </section>

      {events.isLoading ? <LoadingBlock label="Loading events" /> : null}
      {events.isError ? <ErrorBlock error={events.error} onRetry={() => events.refetch()} /> : null}
      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="hidden grid-cols-[180px_110px_90px_1fr_160px_1fr] gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase text-slate-500 md:grid">
          <span>Time</span>
          <span>Severity</span>
          <span>Node</span>
          <span>Event Type</span>
          <span>Error Code</span>
          <span>Message</span>
        </div>
        {events.data?.events?.length ? (
          <div className="divide-y divide-slate-100">
            {events.data.events.map((event) => (
              <details key={event.event_id} className="group">
                <summary className="grid cursor-pointer gap-2 px-4 py-3 text-sm md:grid-cols-[180px_110px_90px_1fr_160px_1fr]">
                  <span>{formatDisplayTime(event.event_time, { timezone, includeSeconds: true })}</span>
                  <span className="font-semibold uppercase">{event.severity}</span>
                  <span>{event.node_id ?? '-'}</span>
                  <span className="font-mono">{event.event_type}</span>
                  <span className="font-mono">{event.error_code ?? '-'}</span>
                  <span>{event.message ?? '-'}</span>
                </summary>
                <div className="bg-slate-50 px-4 py-4 text-sm">
                  <div className="grid gap-2 md:grid-cols-2">
                    <div>event_id: <span className="font-mono">{event.event_id}</span></div>
                    <div>gateway_id: <span className="font-mono">{event.gateway_id}</span></div>
                    <div>upload_id: <span className="font-mono">{event.upload_id ?? '-'}</span></div>
                    <div>Server received: {formatDisplayTime(event.received_at, { timezone, includeSeconds: true })}</div>
                  </div>
                  <pre className="mt-3 overflow-auto rounded-md bg-white p-3 text-xs">{JSON.stringify(event.details ?? {}, null, 2)}</pre>
                  {event.node_id ? (
                    <Link className="mt-3 inline-block text-slate-900 underline" to={event.node_id === 'N3' ? '/weather' : event.node_id === 'N2' ? '/soil/pivot-2' : '/soil/pivot-1'}>
                      View nearby readings
                    </Link>
                  ) : null}
                </div>
              </details>
            ))}
          </div>
        ) : (
          <div className="p-4">
            <EmptyState message="No events found for the selected filters. Try widening the date range or clearing some filters." />
          </div>
        )}
      </section>
    </div>
  );
}

