import { AlertTriangle, Clock3, Database, RadioTower, Upload } from 'lucide-react';
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
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle, SectionHeader } from '../../components/ui';

function latestFor(readings: LatestReadingStatus[] | undefined, nodeId: LatestReadingStatus['node_id']) {
  return readings?.find((reading) => reading.node_id === nodeId);
}

function readingValue(reading: LatestReadingStatus | undefined, key: keyof LatestReadingStatus, unit: string) {
  const value = reading?.[key];
  return typeof value === 'number' ? `${value.toFixed(1)} ${unit}` : '—';
}

function severityVariant(severity: string) {
  if (severity === 'critical') return 'critical';
  if (severity === 'error') return 'danger';
  if (severity === 'warning') return 'warning';
  return 'muted';
}

function KpiCard({ label, value, color, nodeId, metric, timezone }: { label: string; value: string; color: string; nodeId: NodeId; metric: MetricKey; timezone: string }) {
  const range = useMemo(() => rangeForPreset('24h'), []);
  const sparkline = useReadingAggregates(nodeId, metric, range, '1hour');

  return (
    <Card className="h-full border-slate-200/80 bg-white/90 dark:border-slate-700/80 dark:bg-slate-900/80">
      <CardContent className="flex h-full flex-col gap-3 p-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
          <p className="text-2xl font-semibold text-slate-950 dark:text-slate-50">{value}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{NODE_LABELS[nodeId]} · {metric}</p>
        </div>
        <div className="rounded-md border border-slate-200/80 bg-slate-50/80 p-2 dark:border-slate-700 dark:bg-slate-800/60">
          <Sparkline points={toTimeSeriesPoints(sparkline.data, timezone)} color={color} />
        </div>
      </CardContent>
    </Card>
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
  const sortedMeasurementTimes = status.data?.latest_readings?.map((reading) => reading.measured_at).filter(Boolean).sort() ?? [];
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
    <div className="space-y-6">
      <Card className="overflow-hidden border-slate-200/90 bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
        <CardHeader className="gap-3 border-b border-slate-200/80 pb-4 dark:border-slate-700/80">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>Operational Snapshot</CardTitle>
              <CardDescription>Live ingestion and measurement freshness for the current field network.</CardDescription>
            </div>
            <Badge variant="info" size="md">Timezone: {timezone}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-4 pt-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border border-slate-200/80 bg-white/80 p-3 dark:border-slate-700 dark:bg-slate-900/60">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Latest field measurement</p>
              <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">{formatDisplayTime(latestMeasurementAt, { timezone })}</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Data age: {ageLabel(latestMeasurementAt)}</p>
            </div>
            <div className="rounded-lg border border-slate-200/80 bg-white/80 p-3 dark:border-slate-700 dark:bg-slate-900/60">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Last data upload</p>
              <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">{formatDisplayTime(lastUploadAt, { timezone })}</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Upload age: {ageLabel(lastUploadAt)}</p>
            </div>
          </div>
          <div className="grid gap-2">
            {isOlderThanHours(lastUploadAt, 24) ? (
              <div className="flex items-start gap-2 rounded-md border border-amber-300/80 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100">
                <AlertTriangle className="mt-0.5 h-4 w-4" aria-hidden="true" />
                <span>Last upload was over 24 hours ago. Dashboard may not reflect latest SD card data.</span>
              </div>
            ) : null}
            {isOlderThanHours(latestMeasurementAt, 2) ? (
              <div className="flex items-start gap-2 rounded-md border border-slate-300/80 bg-slate-100 p-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                <Clock3 className="mt-0.5 h-4 w-4" aria-hidden="true" />
                <span>No recent field measurement received.</span>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map(([label, value, color, nodeId, metric]) => (
          <KpiCard key={label} label={label} value={value} color={color} nodeId={nodeId} metric={metric} timezone={timezone} />
        ))}
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        {(['MAIN', 'N2', 'N3'] as const).map((nodeId) => {
          const reading = latestFor(status.data?.latest_readings, nodeId);
          return (
            <Card key={nodeId} className="border-slate-200/90 dark:border-slate-700/90">
              <CardContent className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-base font-semibold text-slate-900 dark:text-slate-100">{NODE_LABELS[nodeId]}</p>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Node {nodeId}</p>
                  </div>
                  <Badge variant="muted">{reading?.status ?? '—'}</Badge>
                </div>
                <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                  <p className="flex items-center gap-2"><Database className="h-4 w-4" aria-hidden="true" /> Last measured: {formatDisplayTime(reading?.measured_at, { timezone })}</p>
                  <p className="flex items-center gap-2"><RadioTower className="h-4 w-4" aria-hidden="true" /> RSSI: {typeof reading?.rssi === 'number' ? reading.rssi : '—'}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <Card>
        <CardContent className="p-4">
          <SectionHeader
            title="Recent Alerts"
            description="Latest warning, error, and critical events from diagnostics feeds."
            action={(
              <Link className="inline-flex items-center gap-1 text-sm text-slate-700 underline dark:text-slate-300" to="/diagnostics/logs">
                <Upload className="h-4 w-4" aria-hidden="true" /> View all logs
              </Link>
            )}
          />
          {events.isLoading ? <LoadingBlock label="Loading alerts" /> : null}
          {events.data?.events?.length ? (
            <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
              {events.data.events.slice(0, 5).map((event) => (
                <div key={event.event_id} className="grid gap-2 py-3 text-sm md:grid-cols-[170px_120px_1fr]">
                  <span className="text-slate-500 dark:text-slate-400">{formatDisplayTime(event.event_time, { timezone })}</span>
                  <span><Badge variant={severityVariant(event.severity)}>{event.severity}</Badge></span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">{event.event_type}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="No warning or error events in the current alert feed." />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
