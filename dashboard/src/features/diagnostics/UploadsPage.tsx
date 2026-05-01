import { Link } from 'react-router-dom';
import { EmptyState, ErrorBlock, LoadingBlock } from '../../components/feedback/States';
import { useTimeZone } from '../../hooks/useTimeZone';
import { useUploads } from '../../hooks/useUploads';
import { formatDisplayTime } from '../../utils/time';

export function UploadsPage() {
  const { timezone } = useTimeZone();
  const uploads = useUploads({ limit: 50 });

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700">
        This page shows when data was transferred, not when measurements occurred.
      </div>
      {uploads.isLoading ? <LoadingBlock label="Loading uploads" /> : null}
      {uploads.isError ? <ErrorBlock error={uploads.error} onRetry={() => uploads.refetch()} /> : null}
      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="hidden grid-cols-[1.4fr_1fr_1fr_120px_100px_120px] gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase text-slate-500 md:grid">
          <span>Upload ID</span>
          <span>Device upload start</span>
          <span>Server received</span>
          <span>Readings</span>
          <span>Events</span>
          <span>Status</span>
        </div>
        {uploads.data?.uploads?.length ? (
          <div className="divide-y divide-slate-100">
            {uploads.data.uploads.map((upload) => (
              <details key={upload.upload_id}>
                <summary className="grid cursor-pointer gap-2 px-4 py-3 text-sm md:grid-cols-[1.4fr_1fr_1fr_120px_100px_120px]">
                  <span className="font-mono">{upload.upload_id}</span>
                  <span>{formatDisplayTime(upload.started_at, { timezone })}</span>
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
    </div>
  );
}

