import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useEventsAggregate } from '../../hooks/useEventsAggregate';
import { EmptyState, ErrorBlock, LoadingBlock } from '../../components/feedback/States';
import { useEvents } from '../../hooks/useEvents';
import { useTimeZone } from '../../hooks/useTimeZone';
import type { EventSeverity, NodeId } from '../../types/common';
import type { SystemEvent } from '../../types/events';
import { getEvents } from '../../api/events.api';
import { formatDisplayTime, rangeForPreset } from '../../utils/time';
import { Badge, Button, Card, CardContent, SectionHeader } from '../../components/ui';

interface EnhancedEventsData {
  events: SystemEvent[];
  count?: number;
  total_count?: number;
  limit?: number;
  offset?: number;
}

const severities: EventSeverity[] = ['info', 'warning', 'error', 'critical'];

function severityVariant(severity: EventSeverity): 'info' | 'warning' | 'danger' | 'critical' {
  if (severity === 'error') return 'danger';
  if (severity === 'critical') return 'critical';
  if (severity === 'warning') return 'warning';
  return 'info';
}

const SEVERITY_ACTIVE: Record<EventSeverity, string> = {
  info: 'border border-sky-200 bg-sky-100 text-sky-800 dark:border-sky-800 dark:bg-sky-950/60 dark:text-sky-300',
  warning: 'border border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
  error: 'border border-rose-200 bg-rose-100 text-rose-800 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-300',
  critical: 'border border-purple-200 bg-purple-100 text-purple-800 dark:border-purple-800 dark:bg-purple-950/60 dark:text-purple-300',
};
const SEVERITY_INACTIVE = 'border border-zinc-200 bg-zinc-100 text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400';
const SEVERITY_TEXT: Record<string, string> = {
  info: 'text-sky-700 dark:text-sky-400',
  warning: 'text-amber-700 dark:text-amber-400',
  error: 'text-rose-700 dark:text-rose-400',
  critical: 'text-purple-700 dark:text-purple-400',
};

const DATE_PRESETS = [
  { label: 'Last 24h', value: '24h' },
  { label: 'Last 7d', value: '7d' },
  { label: 'Last 30d', value: '30d' },
  { label: 'Custom', value: 'custom' },
] as const;

const LIMIT_PRESETS = [
  { label: '50', value: '50' },
  { label: '100', value: '100' },
  { label: '250', value: '250' },
  { label: '500', value: '500' },
  { label: 'Custom', value: 'custom' },
] as const;

export function LogsPage() {
  const [selectedSeverities, setSelectedSeverities] = useState<EventSeverity[]>(severities);
  const [nodeId, setNodeId] = useState<NodeId | ''>('');
  const [searchParams] = useSearchParams();
  const [uploadId, setUploadId] = useState(searchParams.get('upload_id') ?? '');
  const [eventType, setEventType] = useState('');
  const [errorCode, setErrorCode] = useState('');
  const { timezone } = useTimeZone();

  const [datePreset, setDatePreset] = useState<'24h' | '7d' | '30d' | 'custom'>('7d');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [limitPreset, setLimitPreset] = useState<'50' | '100' | '250' | '500' | 'custom'>('50');
  const [customLimitStr, setCustomLimitStr] = useState('');
  const [offset, setOffset] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const range = useMemo(() => {
    if (datePreset === 'custom') {
      return { from: customStart || undefined, to: customEnd || undefined };
    }
    return rangeForPreset(datePreset);
  }, [datePreset, customStart, customEnd]);

  const customRangeInvalid = datePreset === 'custom' && !!customStart && !!customEnd && customStart >= customEnd;

  const effectiveLimit = useMemo(() => {
    if (limitPreset === 'custom') {
      const n = parseInt(customLimitStr);
      return Number.isFinite(n) && n >= 1 ? Math.min(n, 1000) : 50;
    }
    return parseInt(limitPreset);
  }, [limitPreset, customLimitStr]);

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

  useEffect(() => {
    setOffset(0);
  }, [selectedSeverities, nodeId, uploadId, eventType, errorCode, range.from, range.to, effectiveLimit]);

  const events = useEvents({
    ...sharedFilters,
    limit: effectiveLimit,
    offset,
  });

  const eventsData = events.data as EnhancedEventsData | undefined;

  const histogram = useEventsAggregate({
    ...sharedFilters,
    bucket: 'day',
    group_by: 'severity',
  });
  const histogramRows = histogram.data?.points?.slice(0, 30) ?? [];
  const eventRows = eventsData?.events ?? [];
  const totalCount = eventsData?.total_count;

  const canPrev = offset > 0;
  const canNext = totalCount != null ? offset + effectiveLimit < totalCount : eventRows.length === effectiveLimit;

  const showingLabel = totalCount != null
    ? `Showing ${eventRows.length} of ${totalCount} events`
    : `Showing ${eventRows.length} events`;

  const exportLabel = isExporting
    ? 'Exporting…'
    : totalCount != null && Math.min(totalCount, 1000) > eventRows.length
      ? totalCount > 1000
        ? `Export 1000 of ${totalCount} events (CSV)`
        : `Export all ${totalCount} events (CSV)`
      : 'Export CSV';

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

  const handleExport = async () => {
    setIsExporting(true);
    setExportError(null);
    try {
      const result = await getEvents({ ...sharedFilters, limit: 1000, offset: 0 });
      const rows = (result as EnhancedEventsData).events ?? [];
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
      const fromSlug = (range.from ?? new Date().toISOString()).slice(0, 10).replace(/-/g, '');
      const toSlug = (range.to ?? new Date().toISOString()).slice(0, 10).replace(/-/g, '');
      link.download = `events_${fromSlug}_${toSlug}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      setExportError('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card><CardContent className="p-3">
        {/* Severity + node filters */}
        <div className="flex min-w-0 flex-wrap gap-2">
          <div className="flex min-w-0 flex-wrap gap-1.5">
            {severities.map((severity) => {
              const active = selectedSeverities.includes(severity);
              return (
                <button
                  key={severity}
                  type="button"
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase transition-colors ${active ? SEVERITY_ACTIVE[severity] : SEVERITY_INACTIVE}`}
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
          <div className="h-5 w-px self-center bg-zinc-200 dark:bg-zinc-700" />
          <div className="flex flex-wrap items-center gap-1">
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
        </div>

        {/* Date range */}
        <div className="mt-2 flex min-w-0 flex-wrap items-center gap-1.5">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">Range:</span>
          {DATE_PRESETS.map((p) => (
            <Button
              key={p.value}
              size="sm"
              variant={datePreset === p.value ? 'primary' : 'secondary'}
              className="px-2.5 py-1 text-xs"
              onClick={() => setDatePreset(p.value)}
            >
              {p.label}
            </Button>
          ))}
          {datePreset === 'custom' && (
            <>
              <input
                type="datetime-local"
                className="h-8 min-w-0 rounded-lg border border-zinc-300 bg-white px-2 text-xs dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
              />
              <span className="text-xs text-zinc-400">to</span>
              <input
                type="datetime-local"
                className="h-8 min-w-0 rounded-lg border border-zinc-300 bg-white px-2 text-xs dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
              />
              {customRangeInvalid && (
                <span className="text-xs text-rose-600 dark:text-rose-400">End must be after start.</span>
              )}
            </>
          )}
        </div>

        {/* Limit */}
        <div className="mt-2 flex min-w-0 flex-wrap items-center gap-1.5">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">Limit:</span>
          {LIMIT_PRESETS.map((p) => (
            <Button
              key={p.value}
              size="sm"
              variant={limitPreset === p.value ? 'primary' : 'secondary'}
              className="px-2.5 py-1 text-xs"
              onClick={() => setLimitPreset(p.value)}
            >
              {p.label}
            </Button>
          ))}
          {limitPreset === 'custom' && (
            <input
              type="number"
              min={1}
              max={1000}
              className="h-8 w-24 min-w-0 rounded-lg border border-zinc-300 bg-white px-2 text-xs dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              placeholder="1–1000"
              value={customLimitStr}
              onChange={(e) => setCustomLimitStr(e.target.value)}
            />
          )}
        </div>

        {/* Text filters + action buttons */}
        <div className="mt-2 flex min-w-0 flex-wrap items-center gap-2">
          <input
            className="h-8 w-44 min-w-0 rounded-lg border border-zinc-300 bg-white px-3 text-xs dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            placeholder="Upload ID (e.g. UPL-...)"
            value={uploadId}
            onChange={(event) => setUploadId(event.target.value)}
          />
          <input className="h-8 w-36 min-w-0 rounded-lg border border-zinc-300 bg-white px-3 text-xs dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" placeholder="Event Type" value={eventType} onChange={(event) => setEventType(event.target.value)} />
          <input className="h-8 w-36 min-w-0 rounded-lg border border-zinc-300 bg-white px-3 text-xs dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" placeholder="Error Code" value={errorCode} onChange={(event) => setErrorCode(event.target.value)} />
          <Button
            type="button"
            disabled={!latestUploadId}
            title={!latestUploadId ? 'No upload id available.' : ''}
            variant={latestUploadOnly ? 'primary' : 'secondary'}
            size="sm"
            className="h-8 whitespace-nowrap px-3 text-xs"
            onClick={() => {
              if (!latestUploadId) return;
              setLatestUploadOnly((prev) => !prev);
              if (!latestUploadOnly) setUploadId(latestUploadId);
            }}
          >
            Latest upload logs
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="h-8 whitespace-nowrap px-3 text-xs"
            onClick={() => {
              setSelectedSeverities(severities);
              setNodeId('');
              setUploadId('');
              setEventType('');
              setErrorCode('');
              setLatestUploadOnly(false);
              setDatePreset('7d');
              setCustomStart('');
              setCustomEnd('');
              setLimitPreset('50');
              setCustomLimitStr('');
              setOffset(0);
            }}
          >
            Clear filters
          </Button>
          {!latestUploadId ? <span className="text-xs text-zinc-500">No upload id available.</span> : null}
        </div>
      </CardContent></Card>

      <Card><CardContent className="p-4">
        <SectionHeader title="Event Histogram (daily)" />
        <div className="mt-2 grid max-h-52 gap-1 overflow-auto text-xs">
          {histogramRows.length ? histogramRows.map((row, idx) => (
            <div key={`${row.bucket_start}-${row.group_key}-${idx}`} className="grid grid-cols-[1fr_120px_80px] rounded-lg bg-zinc-50/80 px-2 py-1 dark:bg-zinc-800/60 dark:text-zinc-300">
              <span>{formatDisplayTime(row.bucket_start, { timezone })}</span>
              <span className={`uppercase ${SEVERITY_TEXT[row.group_key] ?? 'text-zinc-500 dark:text-zinc-400'}`}>{row.group_key}</span>
              <span>{row.count}</span>
            </div>
          )) : <span className="text-zinc-500">No aggregated events in selected range.</span>}
        </div>
      </CardContent></Card>

      {events.isLoading ? <LoadingBlock label="Loading events" /> : null}
      {events.isError ? <ErrorBlock error={events.error} onRetry={() => events.refetch()} /> : null}
      <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="hidden grid-cols-[180px_110px_90px_1fr_160px_1fr] gap-3 border-b border-zinc-200 bg-zinc-50 px-4 py-3 text-xs font-semibold uppercase text-zinc-500 md:grid dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
          <span>Time</span>
          <span>Severity</span>
          <span>Node</span>
          <span>Event Type</span>
          <span>Error Code</span>
          <span>Message</span>
        </div>
        {eventRows.length ? (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {eventRows.map((event) => (
              <details key={event.event_id} className="group">
                <summary className="grid cursor-pointer gap-2 px-4 py-3 text-sm transition-colors hover:bg-zinc-50/70 md:grid-cols-[180px_110px_90px_1fr_160px_1fr] dark:hover:bg-zinc-800/50">
                  <span>{formatDisplayTime(event.event_time, { timezone, includeSeconds: true })}</span>
                  <Badge variant={severityVariant(event.severity)} className="w-fit uppercase">{event.severity}</Badge>
                  <span>{event.node_id ?? 'Gateway'}</span>
                  <span className="font-mono">{event.event_type}</span>
                  <span className="font-mono">{event.error_code ?? '-'}</span>
                  <span>{event.message ?? '-'}</span>
                </summary>
                <div className="bg-zinc-50 px-4 py-4 text-sm dark:bg-zinc-800/50 dark:text-zinc-300">
                  <div className="grid gap-2 md:grid-cols-2">
                    <div>event_id: <span className="font-mono">{event.event_id}</span></div>
                    <div>gateway_id: <span className="font-mono">{event.gateway_id}</span></div>
                    <div>upload_id: <span className="font-mono">{event.upload_id ?? '-'}</span></div>
                    <div>Server received: {formatDisplayTime(event.received_at, { timezone, includeSeconds: true })}</div>
                  </div>
                  <pre className="mt-3 overflow-auto rounded-md bg-white p-3 text-xs dark:bg-zinc-900 dark:text-zinc-300">{JSON.stringify(event.details ?? {}, null, 2)}</pre>
                  {event.node_id ? (
                    <Link
                      className="mt-3 inline-block text-zinc-900 underline dark:text-zinc-300"
                      to={`${event.node_id === 'N3' ? '/weather' : event.node_id === 'N2' ? '/soil/pivot-2' : '/soil/pivot-1'}?from=${encodeURIComponent(new Date(new Date(event.event_time).getTime() - 5 * 60_000).toISOString())}&to=${encodeURIComponent(new Date(new Date(event.event_time).getTime() + 5 * 60_000).toISOString())}`}
                    >
                      View nearby readings
                    </Link>
                  ) : null}
                  {event.upload_id ? (
                    <Link className="ms-4 inline-block text-zinc-900 underline dark:text-zinc-300" to={`/diagnostics/logs?upload_id=${encodeURIComponent(event.upload_id)}`}>
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

      {/* Pagination + export footer */}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="secondary"
          size="sm"
          className="px-3 text-xs"
          disabled={!canPrev}
          onClick={() => setOffset((o) => Math.max(0, o - effectiveLimit))}
        >
          Prev
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="px-3 text-xs"
          disabled={!canNext}
          onClick={() => setOffset((o) => o + effectiveLimit)}
        >
          Next
        </Button>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">{showingLabel}</span>
        <Button
          variant="secondary"
          disabled={isExporting || customRangeInvalid}
          onClick={handleExport}
          className="ms-auto"
        >
          {exportLabel}
        </Button>
        {exportError ? <span className="text-xs text-rose-600 dark:text-rose-400">{exportError}</span> : null}
      </div>
    </div>
  );
}
