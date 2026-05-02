import { EmptyState, ErrorBlock, LoadingBlock } from '../../components/feedback/States';
import { useNodes } from '../../hooks/useNodes';
import { useStatus } from '../../hooks/useStatus';
import { useTimeZone } from '../../hooks/useTimeZone';
import { formatDisplayTime } from '../../utils/time';

export function SystemHealthPage() {
  const { timezone } = useTimeZone();
  const status = useStatus();
  const nodes = useNodes();

  if (status.isLoading || nodes.isLoading) return <LoadingBlock label="Loading system health" />;
  if (status.isError) return <ErrorBlock error={status.error} onRetry={() => status.refetch()} />;

  const gateway = status.data?.gateways?.[0];

  return (
    <div className="space-y-5">
      <section className="grid gap-4 md:grid-cols-[280px_1fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="font-semibold text-slate-900">Gateway</h2>
          <div className="mt-3 space-y-2 text-sm text-slate-600">
            <div>ID: {gateway?.gateway_id ?? 'GW01'}</div>
            <div>Firmware: {gateway?.firmware_version ?? '-'}</div>
            <div>Last upload: {formatDisplayTime(gateway?.last_upload_at, { timezone })}</div>
            <div>Last seen: {formatDisplayTime(gateway?.last_seen_at, { timezone })}</div>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="font-semibold text-slate-900">Nodes</h2>
          {nodes.data?.nodes?.length ? (
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              {nodes.data.nodes.map((node) => (
                <div key={node.node_id} className="rounded-md border border-slate-200 p-3 text-sm">
                  <div className="font-semibold">{node.node_id}</div>
                  <div>{node.node_type}</div>
                  <div>Last seen: {formatDisplayTime(node.last_seen_at, { timezone })}</div>
                  <div>Seq: {node.last_seq ?? '-'}</div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="No node metadata returned by the WebService." />
          )}
        </div>
      </section>
      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="font-semibold text-slate-900">Diagnostics</h2>
        <p className="mt-2 text-sm text-slate-500">RSSI/SNR trend charts and error frequency are reserved for the diagnostics layer.</p>
      </section>
    </div>
  );
}

