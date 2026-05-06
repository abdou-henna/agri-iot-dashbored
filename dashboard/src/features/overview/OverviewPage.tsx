import { AlertTriangle, Clock3, Database, RadioTower, Upload } from 'lucide-react';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, CardBody, CardFooter, CardHeader, Chip, Divider, Skeleton, Tab, Tabs, Tooltip } from '@heroui/react';
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

function severityColor(severity: string): 'danger' | 'warning' | 'secondary' {
  if (severity === 'critical' || severity === 'error') return 'danger';
  if (severity === 'warning') return 'warning';
  return 'secondary';
}

function statusColor(status: string | undefined): 'success' | 'warning' | 'danger' | 'secondary' {
  if (status === 'ok' || status === 'online') return 'success';
  if (status === 'warning') return 'warning';
  if (status === 'critical' || status === 'error' || status === 'offline') return 'danger';
  return 'secondary';
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
    <Card className="h-full rounded-2xl border border-default-200/80 bg-content1/90 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex w-full items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-default-500">{title}</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
          </div>
          <Chip size="sm" variant="flat" color="default">{NODE_LABELS[nodeId]}</Chip>
        </div>
      </CardHeader>
      <CardBody className="pt-0">
        <p className="text-xs text-default-500">{metricLabel(metric)}</p>
        <div className="mt-3 rounded-xl border border-default-200/70 bg-default-100/40 p-2">
          {sparkline.isLoading ? <Skeleton className="h-12 w-full rounded-lg" /> : <Sparkline points={toTimeSeriesPoints(sparkline.data, timezone)} color={color} />}
        </div>
      </CardBody>
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
      <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-default-200/80 bg-content1/80 p-4 shadow-sm">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Overview Dashboard</h1>
          <p className="text-sm text-default-500">Operational command surface for ingestion, sensor freshness, and active alerts.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Chip size="sm" variant="flat" color="secondary">Timezone: {timezone}</Chip>
          <Chip size="sm" variant="flat" color={isOlderThanHours(latestMeasurementAt, 2) ? 'warning' : 'success'}>Measurement: {ageLabel(latestMeasurementAt)}</Chip>
          <Chip size="sm" variant="flat" color={isOlderThanHours(lastUploadAt, 24) ? 'warning' : 'success'}>Upload: {ageLabel(lastUploadAt)}</Chip>
          <Chip size="sm" variant="flat" color={alertCount > 0 ? 'danger' : 'success'}>Alerts: {alertCount}</Chip>
          <Button as={Link} to="/diagnostics/logs" size="sm" color="primary" variant="flat" startContent={<Upload className="h-4 w-4" aria-hidden="true" />}>View logs</Button>
        </div>
      </header>

      <Card className="rounded-2xl border border-default-200/80 bg-gradient-to-br from-content1 via-default-50/50 to-content2/70 shadow-md">
        <CardHeader className="flex-col items-start gap-2">
          <h2 className="text-lg font-semibold text-foreground">Operational Snapshot</h2>
          <p className="text-sm text-default-500">Live ingestion and field measurement recency for the current network.</p>
        </CardHeader>
        <Divider />
        <CardBody className="gap-4 py-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-default-200/80 bg-content1/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-default-500">Latest field measurement</p>
              <p className="mt-2 text-lg font-semibold text-foreground">{formatDisplayTime(latestMeasurementAt, { timezone })}</p>
              <p className="text-sm text-default-500">Data age: {ageLabel(latestMeasurementAt)}</p>
            </div>
            <div className="rounded-xl border border-default-200/80 bg-content1/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-default-500">Last data upload</p>
              <p className="mt-2 text-lg font-semibold text-foreground">{formatDisplayTime(lastUploadAt, { timezone })}</p>
              <p className="text-sm text-default-500">Upload age: {ageLabel(lastUploadAt)}</p>
            </div>
          </div>
          <div className="space-y-2">
            {isOlderThanHours(lastUploadAt, 24) ? <div className="flex items-start gap-2 rounded-xl border border-warning/40 bg-warning/10 p-3 text-sm"><AlertTriangle className="mt-0.5 h-4 w-4" aria-hidden="true" /><span>Last upload was over 24 hours ago. Dashboard may not reflect latest SD card data.</span></div> : null}
            {isOlderThanHours(latestMeasurementAt, 2) ? <div className="flex items-start gap-2 rounded-xl border border-default-300/80 bg-default-100/70 p-3 text-sm"><Clock3 className="mt-0.5 h-4 w-4" aria-hidden="true" /><span>No recent field measurement received.</span></div> : null}
          </div>
        </CardBody>
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
            <Card key={nodeId} className="rounded-2xl border border-default-200/80 bg-content1/90 shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex w-full items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-semibold text-foreground">{NODE_LABELS[nodeId]}</h3>
                    <p className="text-xs uppercase tracking-wide text-default-500">Node {nodeId}</p>
                  </div>
                  <Chip size="sm" variant="flat" color={statusColor(reading?.status)}>{reading?.status ?? 'unknown'}</Chip>
                </div>
              </CardHeader>
              <CardBody className="pt-0 text-sm text-default-600">
                <p className="flex items-center gap-2"><Database className="h-4 w-4" aria-hidden="true" /> Last measured: {formatDisplayTime(reading?.measured_at, { timezone })}</p>
                <p className="mt-2 flex items-center gap-2"><RadioTower className="h-4 w-4" aria-hidden="true" /> RSSI: {typeof reading?.rssi === 'number' ? reading.rssi : '—'}</p>
              </CardBody>
            </Card>
          );
        })}
      </section>

      <Card className="rounded-2xl border border-default-200/80 bg-content1/90 shadow-sm">
        <CardHeader>
          <div className="flex w-full flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Recent Alerts</h2>
              <p className="text-sm text-default-500">Latest warning, error, and critical events from diagnostics feeds.</p>
            </div>
            <Tooltip content="Open full diagnostics logs">
              <Button as={Link} to="/diagnostics/logs" size="sm" variant="light" color="primary" startContent={<Upload className="h-4 w-4" aria-hidden="true" />}>View all logs</Button>
            </Tooltip>
          </div>
        </CardHeader>
        <Divider />
        <CardBody>
          <Tabs aria-label="Alert feed tabs" size="sm" variant="underlined" selectedKey="latest">
            <Tab key="latest" title="Latest alerts">
              {events.isLoading ? <LoadingBlock label="Loading alerts" /> : null}
              {events.data?.events?.length ? (
                <div className="mt-2 space-y-2">
                  {events.data.events.slice(0, 5).map((event) => (
                    <div key={event.event_id} className="grid gap-2 rounded-xl border border-default-200/70 bg-content2/40 p-3 text-sm md:grid-cols-[170px_120px_1fr]">
                      <span className="text-default-500">{formatDisplayTime(event.event_time, { timezone })}</span>
                      <Chip size="sm" variant="flat" color={severityColor(event.severity)}>{event.severity}</Chip>
                      <span className="font-mono text-foreground">{event.event_type}</span>
                    </div>
                  ))}
                </div>
              ) : <EmptyState message="No warning or error events in the current alert feed." />}
            </Tab>
          </Tabs>
        </CardBody>
        <CardFooter className="pt-0 text-xs text-default-500">Alert timestamps use event_time and follow the selected timezone.</CardFooter>
      </Card>
    </div>
  );
}
