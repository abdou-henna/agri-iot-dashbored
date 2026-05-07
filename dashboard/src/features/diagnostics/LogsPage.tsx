import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useEventsAggregate } from '../../hooks/useEventsAggregate';
import { EmptyState, ErrorBlock, LoadingBlock } from '../../components/feedback/States';
import { useEvents } from '../../hooks/useEvents';
import { useTimeZone } from '../../hooks/useTimeZone';
import type { EventSeverity, NodeId } from '../../types/common';
import { formatDisplayTime, rangeForPreset } from '../../utils/time';
import { Badge, Button, Card, CardContent, SectionHeader } from '../../components/ui';

const severities: EventSeverity[] = ['info', 'warning', 'error', 'critical'];

export function LogsPage() {
  const [selectedSeverities, setSelectedSeverities] = useState<EventSeverity[]>(severities);
  const [nodeId, setNodeId] = useState<NodeId | ''>('');
  const [searchParams] = useSearchParams();
  const [uploadId, setUploadId] = useState(searchParams.get('upload_id') ?? '');
  const [eventType, setEventType] = useState('');
  const [errorCode, setErrorCode] = useState('');
  const { timezone } = useTimeZone();
  const range = useMemo(() => rangeForPreset('7d'), []);
  const normalizedSeverities = selectedSeverities.length === severities.length ? undefined : selectedSeverities;
  const sharedFilters = {
    severity: normalizedSeverities,
    node_id: nodeId || undefined,
    upload_id: uploadId.trim() || undefined,
    event_type: eventType.trim() || undefined,
    error_code: errorCode.trim() || undefined,
    from: range.from,
    to: range.to,
  };
  const events = useEvents({
    ...sharedFilters,
    limit: 50,
  });
  const histogram = useEventsAggregate({
    ...sharedFilters,
    bucket: 'day',
    group_by: 'severity',
  });
  const histogramRows = histogram.data?.points?.slice(0, 30) ?? [];
  const eventRows = events.data?.events ?? [];
  const latestUploadId = useMemo(() => {
    for (const event of eventRows) {
      if (event.upload_id) return event.upload_id;
    }
    return '';
  }, [eventRows]);
  const [latestUploadOnly, setLatestUploadOnly] = useState(false);

  useEffect(() => {
    if (latestUploadOnly && latestUploadId) {
      setUploadId(latestUploadId);
    }
  }, [latestUploadOnly, latestUploadId]);

  return (
    <div className="space-y-6">
      <Card><CardContent className="p-4">
        <div className="grid min-w-0 grid-cols-1 gap-3 md:grid-cols-6">
          <div className="flex min-w-0 max-w-full flex-wrap gap-1.5 md:col-span-2">
            {severities.map((severity) => {
              const active = selectedSeverities.includes(severity);
              return (
                <Button
                  key={severity}
                  size="sm"
                  variant={active ? "primary" : "secondary"}
                  className="rounded-full px-2.5 py-1 text-xs font-semibold uppercase"
                  onClick={() =>
                    setSelectedSeverities((current) =>
                      current.includes(severity) ? current.filter((item) => item !== severity) : [...current, severity],
                    )
                  }
                >
                  {severity}
                </Button>
              );
            })}
          </div>
          <div className="flex min-w-0 max-w-full flex-wrap items-center gap-1">
            {[
              { label: 'All', value: '' },
              { label: 'MAIN', value: 'MAIN' },
              { label: 'N2', value: 'N2' },
              { label: 'N3', value: 'N3' },
            ].map((node) => (
              <Button
                key={node.label}
                size="sm"
                variant={nodeId === node.value ? "primary" : "secondary"}
                className="px-2.5 py-1.5 text-xs"
                onClick={() => setNodeId(node.value as NodeId | '')}
              >
                {node.label}
              </Button>
            ))}
          </div>
          <input
            className="h-9 min-w-0 max-w-full rounded-md border border-slate-300 px-3 text-sm"
            placeholder="Upload ID (e.g. UPL-...)"
            value={uploadId}
            onChange={(event) => setUploadId(event.target.value)}
          />
          <input className="h-9 min-w-0 max-w-full rounded-md border border-slate-300 px-3 text-sm" placeholder="Event Type" value={eventType} onChange={(event) => setEventType(event.target.value)} />
          <input className="h-9 min-w-0 max-w-full rounded-md border border-slate-300 px-3 text-sm" placeholder="Error Code" value={errorCode} onChange={(event) => setErrorCode(event.target.value)} />
          <Button
            type="button"
            disabled={!latestUploadId}
            title={!latestUploadId ? 'No upload id available.' : ''}
            variant={latestUploadOnly ? 'primary' : 'secondary'}
            size="sm"
            className="h-9 min-w-0 max-w-full whitespace-nowrap px-3 text-sm"
            onClick={() => {
              if (!latestUploadId) return;
              setLatestUploadOnly((prev) => !prev);
              if (!latestUploadOnly) setUploadId(latestUploadId);
            }}
          >
            Latest upload logs
          </Button>
          {!latestUploadId ? <div className="text-xs text-slate-500">No upload id available.</div> : null}
          <Button
            variant="secondary"
            size="sm"
            className="h-9 min-w-0 max-w-full whitespace-nowrap px-3 text-sm md:justify-self-end"
            onClick={() => {
              setSelectedSeverities(severities);
              setNodeId('');
              setUploadId('');
              setEventType('');
              setErrorCode('');
              setLatestUploadOnly(false);
            }}
          >
            Clear filters
          </Button>
        </div>
      </CardContent></Card>
      <Card><CardContent className="p-4">
        <SectionHeader title="Event Histogram (daily)" />
        <div className="mt-2 grid max-h-52 gap-1 overflow-auto text-xs">
          {histogramRows.length ? histogramRows.map((row, idx) => (
            <div key={`${row.bucket_start}-${row.group_key}-${idx}`} className="grid grid-cols-[1fr_120px_80px] rounded bg-slate-50 px-2 py-1">
              <span>{formatDisplayTime(row.bucket_start, { timezone })}</span>
              <span className="uppercase">{row.group_key}</span>
              <span>{row.count}</span>
            </div>
          )) : <span className="text-slate-500">No aggregated events in selected range.</span>}
        </div>
      </CardContent></Card>

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
                  <Badge variant="warning" className="w-fit uppercase">{event.severity}</Badge>
                  <span>{event.node_id ?? 'Gateway'}</span>
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
                    <Link
                      className="mt-3 inline-block text-slate-900 underline"
                      to={`${event.node_id === 'N3' ? '/weather' : event.node_id === 'N2' ? '/soil/pivot-2' : '/soil/pivot-1'}?from=${encodeURIComponent(new Date(new Date(event.event_time).getTime() - 5 * 60_000).toISOString())}&to=${encodeURIComponent(new Date(new Date(event.event_time).getTime() + 5 * 60_000).toISOString())}`}
                    >
                      View nearby readings
                    </Link>
                  ) : null}
                  {event.upload_id ? (
                    <Link className="ms-4 inline-block text-slate-900 underline" to={`/diagnostics/logs?upload_id=${encodeURIComponent(event.upload_id)}`}>
                      Filter by this upload_id
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
      <Button
        variant="secondary"
        onClick={() => {
          const rows = events.data?.events ?? [];
          const header = ['event_time', 'severity', 'node_id', 'event_type', 'error_code', 'message', 'details', 'event_id', 'upload_id'];
          const csv = [
            header.join(','),
            ...rows.map((event) => [
              event.event_time,
              event.severity,
              event.node_id ?? '',
              event.event_type,
              event.error_code ?? '',
              JSON.stringify(event.message ?? ''),
              JSON.stringify(event.details ?? {}),
              event.event_id,
              event.upload_id ?? '',
            ].join(',')),
          ].join('\n');
          const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `events_${range.from.slice(0, 10).replace(/-/g, '')}_${range.to.slice(0, 10).replace(/-/g, '')}.csv`;
          link.click();
          URL.revokeObjectURL(url);
        }}
      >
        Export CSV
      </Button>
    </div>
  );
}
