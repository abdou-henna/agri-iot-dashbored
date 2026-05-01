import { AlertTriangle } from 'lucide-react';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Sparkline } from '../../components/charts/BasicCharts';
import { COLORS, NODE_LABELS } from '../../config/constants';
import { useEvents } from '../../hooks/useEvents';
import { useReadingAggregates } from '../../hooks/useReadingAggregates';
import { useStatus } from '../../hooks/useStatus';
import { useTimeZone } from '../../hooks/useTimeZone';
import { useUploads } from '../../hooks/useUploads';
import type { MetricKey, NodeId } from '../../types/common';
import type { LatestReadingStatus } from '../../types/status';
import { toTimeSeriesPoints } from '../../utils/chartData';
import { ageLabel, formatDisplayTime, isOlderThanHours, rangeForPreset } from '../../utils/time';
import { EmptyState, ErrorBlock, LoadingBlock } from '../../components/feedback/States';

function latestFor(readings: LatestReadingStatus[] | undefined, nodeId: LatestReadingStatus['node_id']) {
  return readings?.find((reading) => reading.node_id === nodeId);
}

function readingValue(reading: LatestReadingStatus | undefined, key: keyof LatestReadingStatus, unit: string) {
  const value = reading?.[key];
  return typeof value === 'number' ? `${value.toFixed(1)} ${unit}` : '—';
}

function KpiCard({
  label,
  value,
  color,
  nodeId,
  metric,
  timezone,
}: {
  label: string;
  value: string;
  color: string;
  nodeId: NodeId;
  metric: MetricKey;
  timezone: string;
}) {
  const range = useMemo(() => rangeForPreset('24h'), []);
  const sparkline = useReadingAggregates(nodeId, metric, range, '1hour');

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="text-xs font-semibold uppercase text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-slate-950">{value}</div>
      <div className="mt-4">
        <Sparkline points={toTimeSeriesPoints(sparkline.data, timezone)} color={color} />
      </div>
    </div>
  );
}

export function OverviewPage() {
  const { timezone } = useTimeZone();
  const status = useStatus();
  const uploads = useUploads({ limit: 1 });
  const events = useEvents({ severity: ['warning', 'error', 'critical'], limit: 5 });

  if (status.isLoading) return <LoadingBlock label="Loading overview" />;
  if (status.isError) return <ErrorBlock error={status.error} onRetry={() => status.refetch()} />;

  const gateway = status.data?.gateways?.[0];
  const latestUpload = uploads.data?.uploads?.[0];
  const lastUploadAt = gateway?.last_upload_at ?? latestUpload?.started_at ?? null;
  const sortedMeasurementTimes =
    status.data?.latest_readings
      ?.map((reading) => reading.measured_at)
      .filter(Boolean)
      .sort() ?? [];
  const latestMeasurementAt = sortedMeasurementTimes.length ? sortedMeasurementTimes[sortedMeasurementTimes.length - 1] : null;

  const p1 = latestFor(status.data?.latest_readings, 'MAIN');
  const p2 = latestFor(status.data?.latest_readings, 'N2');
  const weather = latestFor(status.data?.latest_readings, 'N3');

  const kpis = [
    ['Pivot 1 Moisture', readingValue(p1, 'soil_moisture_percent', '%'), COLORS.pivot1, 'MAIN', 'soil_moisture_percent'],
    ['Pivot 1 Temp', readingValue(p1, 'soil_temperature_c', 'C'), COLORS.pivot1, 'MAIN', 'soil_temperature_c'],
    ['Pivot 2 Moisture', readingValue(p2, 'soil_moisture_percent', '%'), COLORS.pivot2, 'N2', 'soil_moisture_percent'],
    ['Pivot 2 Temp', readingValue(p2, 'soil_temperature_c', 'C'), COLORS.pivot2, 'N2', 'soil_temperature_c'],
    ['Air Temp', readingValue(weather, 'air_temperature_c', 'C'), COLORS.weather, 'N3', 'air_temperature_c'],
    ['Air Humidity', readingValue(weather, 'air_humidity_percent', '%'), COLORS.weather, 'N3', 'air_humidity_percent'],
    ['Air Pressure', readingValue(weather, 'air_pressure_hpa', 'hPa'), COLORS.weather, 'N3', 'air_pressure_hpa'],
  ] as const;

  if (!status.data?.latest_readings?.length) {
    return <EmptyState message="No data received. Trigger an upload from the field device." />;
  }

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <div className="text-xs font-semibold uppercase text-slate-500">Latest field measurement</div>
            <div className="text-lg font-semibold text-slate-900">{formatDisplayTime(latestMeasurementAt, { timezone })}</div>
            <div className="text-sm text-slate-500">Data age: {ageLabel(latestMeasurementAt)}</div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase text-slate-500">Last data upload</div>
            <div className="text-lg font-semibold text-slate-900">{formatDisplayTime(lastUploadAt, { timezone })}</div>
            <div className="text-sm text-slate-500">Upload age: {ageLabel(lastUploadAt)}</div>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          {isOlderThanHours(lastUploadAt, 24) ? (
            <div className="flex gap-2 rounded-md bg-orange-50 p-3 text-sm text-orange-800">
              <AlertTriangle className="h-5 w-5" /> Last upload was over 24 hours ago. Dashboard may not reflect latest SD card data.
            </div>
          ) : null}
          {isOlderThanHours(latestMeasurementAt, 2) ? (
            <div className="flex gap-2 rounded-md bg-slate-100 p-3 text-sm text-slate-700">
              <AlertTriangle className="h-5 w-5" /> No recent field measurement received.
            </div>
          ) : null}
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {kpis.map(([label, value, color, nodeId, metric]) => (
          <KpiCard key={label} label={label} value={value} color={color} nodeId={nodeId} metric={metric} timezone={timezone} />
        ))}
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        {(['MAIN', 'N2', 'N3'] as const).map((nodeId) => {
          const reading = latestFor(status.data?.latest_readings, nodeId);
          return (
            <div key={nodeId} className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900">{NODE_LABELS[nodeId]}</div>
                  <div className="text-sm text-slate-500">{nodeId}</div>
                </div>
                <span className="rounded-full bg-slate-100 px-2 py-1 text-xs">{reading?.status ?? '—'}</span>
              </div>
              <div className="mt-4 text-sm text-slate-600">Last measured: {formatDisplayTime(reading?.measured_at, { timezone })}</div>
              <div className="mt-1 text-sm text-slate-600">RSSI: {typeof reading?.rssi === 'number' ? reading.rssi : '—'}</div>
            </div>
          );
        })}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Recent Alerts</h2>
          <Link className="text-sm text-slate-700 underline" to="/diagnostics/logs">
            View all logs
          </Link>
        </div>
        {events.isLoading ? <LoadingBlock label="Loading alerts" /> : null}
        {events.data?.events?.length ? (
          <div className="divide-y divide-slate-100">
            {events.data.events.slice(0, 5).map((event) => (
              <div key={event.event_id} className="grid gap-2 py-3 text-sm md:grid-cols-[170px_90px_1fr]">
                <span className="text-slate-500">{formatDisplayTime(event.event_time, { timezone })}</span>
                <span className="font-semibold uppercase text-orange-700">{event.severity}</span>
                <span className="font-mono text-slate-800">{event.event_type}</span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState message="No warning or error events in the current alert feed." />
        )}
      </section>
    </div>
  );
}
