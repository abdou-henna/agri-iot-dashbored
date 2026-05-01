import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Link } from 'react-router-dom';
import { EmptyState, ErrorBlock, LoadingBlock } from '../../components/feedback/States';
import { COLORS } from '../../config/constants';
import { useTimeZone } from '../../hooks/useTimeZone';
import { useUploads } from '../../hooks/useUploads';
import { formatDisplayDate, formatDisplayTime } from '../../utils/time';

export function UploadsPage() {
  const { timezone } = useTimeZone();
  const uploads = useUploads({ limit: 50 });
  const uploadRows = uploads.data?.uploads ?? [];
  const dailyRows = useMemo(() => {
    if (!uploadRows.length) return [];
    const toDayKey = (iso: string | null) => (iso ? iso.slice(0, 10) : null);
    const byDay = new Map<string, { day: string; success: number; failed: number }>();
    for (const upload of uploadRows) {
      const day = toDayKey(upload.received_at);
      if (!day) continue;
      const current = byDay.get(day) ?? { day, success: 0, failed: 0 };
      if (upload.status === 'failed') current.failed += 1;
      else current.success += 1;
      byDay.set(day, current);
    }
    const orderedDays = Array.from(byDay.keys()).sort();
    const first = new Date(`${orderedDays[0]}T00:00:00Z`);
    const last = new Date(`${orderedDays[orderedDays.length - 1]}T00:00:00Z`);
    const rows: Array<{ day: string; displayDay: string; success: number; failed: number; gap: number }> = [];
    for (let d = new Date(first); d <= last; d.setUTCDate(d.getUTCDate() + 1)) {
      const day = d.toISOString().slice(0, 10);
      const found = byDay.get(day);
      const success = found?.success ?? 0;
      const failed = found?.failed ?? 0;
      const gap = success + failed === 0 ? 1 : 0;
      rows.push({ day, displayDay: formatDisplayDate(day, timezone), success, failed, gap });
    }
    return rows;
  }, [uploadRows, timezone]);

  const perUploadRows = useMemo(
    () =>
      uploadRows
        .slice()
        .sort((a, b) => new Date(a.received_at ?? 0).getTime() - new Date(b.received_at ?? 0).getTime())
        .map((upload) => ({
          received_at: upload.received_at,
          displayTime: formatDisplayTime(upload.received_at, { timezone }),
          upload_id: upload.upload_id,
          readings_count: upload.raw_summary?.readings_count ?? upload.records_count ?? 0,
          events_count: upload.raw_summary?.events_count ?? upload.events_count ?? 0,
        })),
    [uploadRows, timezone],
  );

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700">
        This page shows when data was transferred, not when measurements occurred.
      </div>
      {uploads.isLoading ? <LoadingBlock label="Loading uploads" /> : null}
      {uploads.isError ? <ErrorBlock error={uploads.error} onRetry={() => uploads.refetch()} /> : null}
      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="hidden grid-cols-[1.2fr_1fr_1fr_1fr_120px_100px_120px] gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase text-slate-500 md:grid">
          <span>Upload ID</span>
          <span>Device upload start</span>
          <span>Device upload finish</span>
          <span>Server received</span>
          <span>Readings</span>
          <span>Events</span>
          <span>Status</span>
        </div>
        {uploads.data?.uploads?.length ? (
          <div className="divide-y divide-slate-100">
            {uploads.data.uploads.map((upload) => (
              <details key={upload.upload_id}>
                <summary className="grid cursor-pointer gap-2 px-4 py-3 text-sm md:grid-cols-[1.2fr_1fr_1fr_1fr_120px_100px_120px]">
                  <span className="font-mono">{upload.upload_id}</span>
                  <span>{formatDisplayTime(upload.started_at, { timezone })}</span>
                  <span>{formatDisplayTime(upload.finished_at, { timezone })}</span>
                  <span>{formatDisplayTime(upload.received_at, { timezone })}</span>
                  <span>{upload.raw_summary?.readings_count ?? upload.records_count}</span>
                  <span>{upload.raw_summary?.events_count ?? upload.events_count}</span>
                  <span className="font-semibold">{upload.status}</span>
                </summary>
                <div className="bg-slate-50 px-4 py-4 text-sm">
                  <div>Device upload finish: {formatDisplayTime(upload.finished_at, { timezone })}</div>
                  <div>Notes: {upload.notes ?? '-'}</div>
                  <pre className="mt-3 overflow-auto rounded-md bg-white p-3 text-xs">{JSON.stringify(upload.raw_summary ?? {}, null, 2)}</pre>
                  <Link className="mt-3 inline-block text-slate-900 underline" to={`/diagnostics/logs?upload_id=${upload.upload_id}`}>
                    Filter logs by this upload
                  </Link>
                </div>
              </details>
            ))}
          </div>
        ) : (
          <div className="p-4">
            <EmptyState message="No upload sessions found." />
          </div>
        )}
      </section>
      <section className="rounded-lg border border-slate-200 bg-white p-4 text-sm">
        <div className="font-semibold">U-1: Uploads per day</div>
        <div className="mt-3 h-64">
          {dailyRows.length ? (
            <ResponsiveContainer>
              <BarChart data={dailyRows} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="displayDay" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="success" stackId="uploads" fill={COLORS.pivot1} name="Successful uploads" />
                <Bar dataKey="failed" stackId="uploads" fill={COLORS.error} name="Failed uploads" />
                <Bar dataKey="gap" stackId="uploads" fill={COLORS.missing} name="No upload (gap day)" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-slate-500">No uploads to chart.</div>
          )}
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4 text-sm">
        <div className="font-semibold">U-2: Readings count per upload</div>
        <div className="mt-3 h-64">
          {perUploadRows.length ? (
            <ResponsiveContainer>
              <BarChart data={perUploadRows} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="displayTime" hide />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value: number, name: string, payload: { payload?: { events_count?: number } }) => [
                    value,
                    `${name} (events: ${payload.payload?.events_count ?? 0})`,
                  ]}
                  labelFormatter={(_, payload) => `Upload ${payload?.[0]?.payload?.upload_id ?? ''}`}
                />
                <Bar dataKey="readings_count" fill={COLORS.weather} name="Readings count" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-slate-500">No uploads to chart.</div>
          )}
        </div>
      </section>
    </div>
  );
}
