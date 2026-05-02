import { useMemo, useState } from 'react';
import { getReadingByRecordId } from '../../api/readings.api';
import { ChartFrame, DualMetricChart } from '../../components/charts/BasicCharts';
import { EmptyState, ErrorBlock, LoadingBlock } from '../../components/feedback/States';
import { COLORS } from '../../config/constants';
import { useEvents } from '../../hooks/useEvents';
import { useNodes } from '../../hooks/useNodes';
import { useReadingAggregates } from '../../hooks/useReadingAggregates';
import { useReadings } from '../../hooks/useReadings';
import { useStatus } from '../../hooks/useStatus';
import { useTimeZone } from '../../hooks/useTimeZone';
import { alignDualSeries, toTimeSeriesPoints } from '../../utils/chartData';
import { formatDisplayTime } from '../../utils/time';

export function SystemHealthPage() {
  const { timezone } = useTimeZone();
  const status = useStatus();
  const nodes = useNodes();
  const [rawPayload, setRawPayload] = useState<Record<string, unknown> | null>(null);
  const range = useMemo(() => ({ from: new Date(Date.now() - 30 * 24 * 3_600_000).toISOString(), to: new Date().toISOString() }), []);
  const n2Rssi = useReadingAggregates('N2', 'rssi', range);
  const n3Rssi = useReadingAggregates('N3', 'rssi', range);
  const n2Snr = useReadingAggregates('N2', 'snr', range);
  const n3Snr = useReadingAggregates('N3', 'snr', range);
  const events = useEvents({ from: range.from, to: range.to, limit: 1000 });
  const rawReadings = useReadings({ from: range.from, to: range.to, limit: 1000 });

  if (status.isLoading || nodes.isLoading) return <LoadingBlock label="Loading system health" />;
  if (status.isError) return <ErrorBlock error={status.error} onRetry={() => status.refetch()} />;

  const gateway = status.data?.gateways?.[0];
  const severityCounts = (events.data?.events ?? []).reduce<Record<string, number>>((acc, event) => {
    acc[event.severity] = (acc[event.severity] ?? 0) + 1;
    return acc;
  }, {});
  const errorCounts = (events.data?.events ?? []).reduce<Record<string, number>>((acc, event) => {
    if (event.error_code) acc[event.error_code] = (acc[event.error_code] ?? 0) + 1;
    return acc;
  }, {});
  const bootEvents = (events.data?.events ?? []).filter((event) => ['rtc_lost_power', 'rtc_init_failed', 'lora_init_failed', 'rtc_drift_detected', 'rtc_sync_applied'].includes(event.event_type));
  const seqGaps = (rawReadings.data?.readings ?? []).slice().sort((a, b) => (a.node_id + a.node_seq).localeCompare(b.node_id + b.node_seq)).filter((row, i, arr) => {
    if (i === 0) return false;
    const prev = arr[i - 1];
    return row.node_id === prev.node_id && row.node_seq !== null && prev.node_seq !== null && row.node_seq - prev.node_seq > 1;
  });
  const rssiPoints = alignDualSeries(toTimeSeriesPoints(n2Rssi.data, timezone), toTimeSeriesPoints(n3Rssi.data, timezone));
  const snrPoints = alignDualSeries(toTimeSeriesPoints(n2Snr.data, timezone), toTimeSeriesPoints(n3Snr.data, timezone));

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
                  <button
                    className="mt-2 rounded border border-slate-200 px-2 py-1 text-xs"
                    onClick={async () => {
                      const latest = (rawReadings.data?.readings ?? []).find((reading) => reading.node_id === node.node_id);
                      if (!latest) return;
                      const full = await getReadingByRecordId(latest.record_id);
                      setRawPayload((full as { raw_payload?: Record<string, unknown> | null }).raw_payload ?? null);
                    }}
                  >
                    View raw payload
                  </button>
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
        <div className="mt-3 grid gap-2 text-sm">
          <div>Severity summary: info {severityCounts.info ?? 0} · warning {severityCounts.warning ?? 0} · error {severityCounts.error ?? 0} · critical {severityCounts.critical ?? 0}</div>
          <div>Error code frequency: {Object.entries(errorCounts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([code, count]) => `${code}(${count})`).join(', ') || '—'}</div>
          <div>Boot/RTC events (30d): {bootEvents.length}</div>
        </div>
      </section>
      <ChartFrame title="RSSI Trend (N2 vs N3)">
        <DualMetricChart points={rssiPoints} leftName="N2" rightName="N3" leftColor={COLORS.pivot2} rightColor={COLORS.weather} yDomain={[-120, -60]} />
      </ChartFrame>
      <ChartFrame title="SNR Trend (N2 vs N3)">
        <DualMetricChart points={snrPoints} leftName="N2" rightName="N3" leftColor={COLORS.pivot2} rightColor={COLORS.weather} yDomain={[-20, 15]} />
      </ChartFrame>
      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="font-semibold text-slate-900">Sequence Gap Detector</h3>
        <div className="mt-2 space-y-1 text-sm">
          {seqGaps.length ? seqGaps.slice(0, 20).map((row) => <div key={row.record_id}>{row.node_id} gap before seq {row.node_seq} at {formatDisplayTime(row.measured_at, { timezone })}</div>) : <span>No sequence gaps found.</span>}
        </div>
      </section>
      {rawPayload ? (
        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="font-semibold text-slate-900">Raw Payload</h3>
          <pre className="mt-2 overflow-auto rounded-md bg-slate-50 p-3 text-xs">{JSON.stringify(rawPayload, null, 2)}</pre>
        </section>
      ) : null}
    </div>
  );
}
