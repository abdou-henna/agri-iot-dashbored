import { AlertTriangle, Clock3, Database, RadioTower, Upload } from 'lucide-react';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Sparkline } from '../../components/charts/BasicCharts';
import { EmptyState, ErrorBlock, LoadingBlock } from '../../components/feedback/States';
import { Badge, Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, SectionHeader } from '../../components/ui';
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

function latestFor(readings: LatestReadingStatus[] | undefined, nodeId: LatestReadingStatus['node_id']) {
  return readings?.find((reading) => reading.node_id === nodeId);
}

function readingValue(reading: LatestReadingStatus | undefined, key: keyof LatestReadingStatus, unit: string) {
  const value = reading?.[key];
  return typeof value === 'number' ? `${value.toFixed(1)} ${unit}` : '—';
}

function severityColor(severity: string): 'danger' | 'warning' | 'muted' {
  if (severity === 'critical' || severity === 'error') return 'danger';
  if (severity === 'warning') return 'warning';
  return 'muted';
}

function statusColor(status: string | undefined): 'success' | 'warning' | 'danger' | 'muted' {
  if (status === 'ok' || status === 'online') return 'success';
  if (status === 'warning') return 'warning';
  if (status === 'critical' || status === 'error' || status === 'offline') return 'danger';
  return 'muted';
}

function metricLabel(metric: MetricKey) {
  const map: Record<MetricKey, string> = {
    soil_moisture_percent: 'Soil moisture',
    soil_temperature_c: 'Soil temperature',
    air_temperature_c: 'Air temperature',
    air_humidity_percent: 'Air humidity',
    air_pressure_hpa: 'Air pressure',
    soil_ec_us_cm: 'Soil EC',
  };
  return map[metric] ?? metric;
}

function KpiCard({ title, value, color, nodeId, metric, timezone }: { title: string; value: string; color: string; nodeId: NodeId; metric: MetricKey; timezone: string }) {
  const range = useMemo(() => rangeForPreset('24h'), []);
  const sparkline = useReadingAggregates(nodeId, metric, range, '1hour');

  return (
    <Card className="flex h-full min-h-[250px] flex-col rounded-2xl border-slate-200/80 bg-white/90 shadow-sm dark:bg-slate-900/90">
      <CardHeader className="pb-2">
        <div className="flex w-full items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">{value}</p>
          </div>
          <Badge size="sm" variant="muted">{NODE_LABELS[nodeId]}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col pt-0">
        <p className="text-xs text-slate-500">{metricLabel(metric)}</p>
        <div className="mt-4 h-20 min-h-20 w-full overflow-hidden rounded-xl border border-slate-200/80 bg-slate-100/50 p-2 dark:border-slate-700 dark:bg-slate-800/50">
          {sparkline.isLoading ? <div className="h-full w-full animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" /> : <div className="h-full w-full"><Sparkline points={toTimeSeriesPoints(sparkline.data, timezone)} color={color} /></div>}
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
    ['Pivot 1', readingValue(p1, 'soil_moisture_percent', '%'), COLORS.pivot1, 'MAIN', 'soil_moisture_percent'],
    ['Pivot 1', readingValue(p1, 'soil_temperature_c', 'C'), COLORS.pivot1, 'MAIN', 'soil_temperature_c'],
    ['Pivot 2', readingValue(p2, 'soil_moisture_percent', '%'), COLORS.pivot2, 'N2', 'soil_moisture_percent'],
    ['Pivot 2', readingValue(p2, 'soil_temperature_c', 'C'), COLORS.pivot2, 'N2', 'soil_temperature_c'],
    ['Weather', readingValue(weather, 'air_temperature_c', 'C'), COLORS.weather, 'N3', 'air_temperature_c'],
    ['Weather', readingValue(weather, 'air_humidity_percent', '%'), COLORS.weather, 'N3', 'air_humidity_percent'],
    ['Weather', readingValue(weather, 'air_pressure_hpa', 'hPa'), COLORS.weather, 'N3', 'air_pressure_hpa'],
  ] as const;

  if (!status.data?.latest_readings?.length) return <EmptyState message="No data received. Trigger an upload from the field device." />;

  const alertCount = events.data?.events?.length ?? 0;

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl border-slate-200/80 bg-white/90 p-4 shadow-sm dark:bg-slate-900/90">
        <SectionHeader
          title="Overview Dashboard"
          description="Operational command surface for ingestion, sensor freshness, and active alerts."
          action={
            <div className="flex flex-wrap items-center gap-2">
              <Badge size="sm" variant="info">Timezone: {timezone}</Badge>
              <Badge size="sm" variant={isOlderThanHours(latestMeasurementAt, 2) ? 'warning' : 'success'}>Measurement: {ageLabel(latestMeasurementAt)}</Badge>
              <Badge size="sm" variant={isOlderThanHours(lastUploadAt, 24) ? 'warning' : 'success'}>Upload: {ageLabel(lastUploadAt)}</Badge>
              <Badge size="sm" variant={alertCount > 0 ? 'danger' : 'success'}>Alerts: {alertCount}</Badge>
              <Link to="/diagnostics/logs"><Button size="sm" variant="secondary"><Upload className="h-4 w-4" aria-hidden="true" /> View logs</Button></Link>
            </div>
          }
        />
      </Card>

      <Card className="overflow-hidden rounded-2xl border-slate-200/80 bg-gradient-to-br from-white via-slate-50 to-slate-100/70 shadow-md dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/70">
        <CardHeader className="gap-2 p-6 pb-4">
          <CardTitle>Operational Snapshot</CardTitle>
          <CardDescription>Live ingestion and field measurement recency for the current network.</CardDescription>
        </CardHeader>
        <div className="border-t border-slate-200 dark:border-slate-700" />
        <CardContent className="space-y-4 p-6 pt-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200/80 bg-white/80 p-4 dark:border-slate-700 dark:bg-slate-900/70">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Latest field measurement</p>
              <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">{formatDisplayTime(latestMeasurementAt, { timezone })}</p>
              <p className="text-sm text-slate-500">Data age: {ageLabel(latestMeasurementAt)}</p>
            </div>
            <div className="rounded-xl border border-slate-200/80 bg-white/80 p-4 dark:border-slate-700 dark:bg-slate-900/70">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Last data upload</p>
              <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">{formatDisplayTime(lastUploadAt, { timezone })}</p>
              <p className="text-sm text-slate-500">Upload age: {ageLabel(lastUploadAt)}</p>
            </div>
          </div>
          <div className="space-y-3">
            {isOlderThanHours(lastUploadAt, 24) ? <div className="flex items-start gap-2 rounded-xl border border-amber-300/70 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100"><AlertTriangle className="mt-0.5 h-4 w-4" aria-hidden="true" /><span>Last upload was over 24 hours ago. Dashboard may not reflect latest SD card data.</span></div> : null}
            {isOlderThanHours(latestMeasurementAt, 2) ? <div className="flex items-start gap-2 rounded-xl border border-slate-300/80 bg-slate-100/70 p-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-200"><Clock3 className="mt-0.5 h-4 w-4" aria-hidden="true" /><span>No recent field measurement received.</span></div> : null}
          </div>
        </CardContent>
      </Card>

      <section>
        <h2 className="sr-only">KPI metrics</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map(([title, value, color, nodeId, metric]) => <KpiCard key={`${title}-${metric}`} title={title} value={value} color={color} nodeId={nodeId} metric={metric} timezone={timezone} />)}
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        {(['MAIN', 'N2', 'N3'] as const).map((nodeId) => {
          const reading = latestFor(status.data?.latest_readings, nodeId);
          return (
            <Card key={nodeId} className="rounded-2xl border-slate-200/80 bg-white/90 shadow-sm dark:bg-slate-900/90">
              <CardHeader className="pb-2">
                <div className="flex w-full items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{NODE_LABELS[nodeId]}</h3>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Node {nodeId}</p>
                  </div>
                  <Badge size="sm" variant={statusColor(reading?.status)}>{reading?.status ?? 'unknown'}</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0 text-sm text-slate-600 dark:text-slate-300">
                <p className="flex items-center gap-2"><Database className="h-4 w-4" aria-hidden="true" /> Last measured: {formatDisplayTime(reading?.measured_at, { timezone })}</p>
                <p className="mt-2 flex items-center gap-2"><RadioTower className="h-4 w-4" aria-hidden="true" /> RSSI: {typeof reading?.rssi === 'number' ? reading.rssi : '—'}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <Card className="rounded-2xl border-slate-200/80 bg-white/90 shadow-sm dark:bg-slate-900/90">
        <CardHeader>
          <SectionHeader
            title="Recent Alerts"
            description="Latest warning, error, and critical events from diagnostics feeds."
            action={<Link to="/diagnostics/logs"><Button size="sm" variant="ghost"><Upload className="h-4 w-4" aria-hidden="true" /> View all logs</Button></Link>}
          />
        </CardHeader>
        <div className="border-t border-slate-200 dark:border-slate-700" />
        <CardContent>
          {events.isLoading ? <LoadingBlock label="Loading alerts" /> : null}
          {events.data?.events?.length ? (
            <div className="mt-2 space-y-2" aria-label="Latest alerts">
              {events.data.events.slice(0, 5).map((event) => (
                <div key={event.event_id} className="grid gap-2 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 text-sm dark:border-slate-700 dark:bg-slate-800/50 md:grid-cols-[170px_120px_1fr]">
                  <span className="text-slate-500">{formatDisplayTime(event.event_time, { timezone })}</span>
                  <Badge size="sm" variant={severityColor(event.severity)}>{event.severity}</Badge>
                  <span className="font-mono text-slate-900 dark:text-slate-100">{event.event_type}</span>
                </div>
              ))}
            </div>
          ) : <EmptyState message="No warning or error events in the current alert feed." />}
        </CardContent>
        <CardFooter className="pt-0 text-xs text-slate-500">Alert timestamps use event_time and follow the selected timezone.</CardFooter>
      </Card>
    </div>
  );
}
