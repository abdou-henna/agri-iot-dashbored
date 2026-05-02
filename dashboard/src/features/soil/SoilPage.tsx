import { useMemo, useState } from 'react';
import {
  ChartFrame,
  DailyBandChart,
  DataConfidenceStrip,
  MetricLineChart,
  StatusDistributionChart,
  TimeRangeSelector,
} from '../../components/charts/BasicCharts';
import { ErrorBlock, LoadingBlock } from '../../components/feedback/States';
import { COLORS } from '../../config/constants';
import { useReadingAggregates } from '../../hooks/useReadingAggregates';
import { useReadings } from '../../hooks/useReadings';
import { useTimeZone } from '../../hooks/useTimeZone';
import type { MetricKey, NodeId } from '../../types/common';
import type { SensorReading } from '../../types/readings';
import { toDailyBandPoints, toStatusDistribution, toTimeSeriesPoints } from '../../utils/chartData';
import { formatDisplayDate, rangeForPreset } from '../../utils/time';

const soilMetrics: Array<[MetricKey, string, [number, number]]> = [
  ['soil_moisture_percent', 'Soil Moisture %', [0, 100]],
  ['soil_temperature_c', 'Soil Temperature C', [-20, 80]],
  ['soil_ec_us_cm', 'Soil EC uS/cm', [0, 20000]],
];

function latestReading(readings: SensorReading[] | undefined) {
  const sorted = readings
    ?.slice()
    .sort((a, b) => new Date(b.measured_at).getTime() - new Date(a.measured_at).getTime());
  return sorted?.[0];
}

function metricValue(reading: SensorReading | undefined, metric: MetricKey, unit: string) {
  const value = reading?.[metric];
  return typeof value === 'number' ? `${value.toFixed(1)} ${unit}` : '—';
}

function avgText(value: number | null | undefined, digits = 1) {
  return typeof value === 'number' ? value.toFixed(digits) : '—';
}

export function SoilPage({ nodeId }: { nodeId: Extract<NodeId, 'MAIN' | 'N2'> }) {
  const [preset, setPreset] = useState<'24h' | '7d' | '30d'>('24h');
  const { timezone } = useTimeZone();
  const range = useMemo(() => rangeForPreset(preset), [preset]);
  const color = nodeId === 'MAIN' ? COLORS.pivot1 : COLORS.pivot2;
  const title = nodeId === 'MAIN' ? 'Pivot 1 - Local Soil' : 'Pivot 2 - Remote Soil';

  const moisture = useReadingAggregates(nodeId, 'soil_moisture_percent', range);
  const temperature = useReadingAggregates(nodeId, 'soil_temperature_c', range);
  const ec = useReadingAggregates(nodeId, 'soil_ec_us_cm', range);
  const dailyMoisture = useReadingAggregates(nodeId, 'soil_moisture_percent', range, '1day');
  const dailyTemperature = useReadingAggregates(nodeId, 'soil_temperature_c', range, '1day');
  const dailyEc = useReadingAggregates(nodeId, 'soil_ec_us_cm', range, '1day');
  const readings = useReadings({ node_id: nodeId, node_type: 'soil', from: range.from, to: range.to, limit: 1000 });
  const rssi = useReadingAggregates(nodeId, 'rssi', range);
  const snr = useReadingAggregates(nodeId, 'snr', range);

  const metricQueries = [moisture, temperature, ec];
  const metricData = [moisture.data, temperature.data, ec.data];
  const latest = latestReading(readings.data?.readings);
  const statusRows = toStatusDistribution(readings.data?.readings, timezone);
  const dailyRows = useMemo(() => {
    const moistureByDay = new Map((dailyMoisture.data?.points ?? []).map((point) => [point.bucket_start, point]));
    const temperatureByDay = new Map((dailyTemperature.data?.points ?? []).map((point) => [point.bucket_start, point]));
    const ecByDay = new Map((dailyEc.data?.points ?? []).map((point) => [point.bucket_start, point]));
    const days = Array.from(new Set([...moistureByDay.keys(), ...temperatureByDay.keys(), ...ecByDay.keys()])).sort();
    return days.map((day) => ({
      day,
      moisture: moistureByDay.get(day),
      temperature: temperatureByDay.get(day),
      ec: ecByDay.get(day),
    }));
  }, [dailyMoisture.data?.points, dailyTemperature.data?.points, dailyEc.data?.points]);
  const rs485Unavailable =
    nodeId === 'MAIN' && readings.data?.readings?.length ? readings.data.readings.every((reading) => reading.status === 'error') : false;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
        </div>
        <TimeRangeSelector value={preset} onChange={setPreset} />
      </div>

      {rs485Unavailable ? (
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 text-sm text-orange-800">
          Pivot 1 data may be unavailable while RS485 sensor is being configured.
        </div>
      ) : null}

      {readings.isError ? <ErrorBlock error={readings.error} onRetry={() => readings.refetch()} /> : null}

      <section className="grid gap-3 md:grid-cols-4">
        {[
          ['Moisture', metricValue(latest, 'soil_moisture_percent', '%')],
          ['Temperature', metricValue(latest, 'soil_temperature_c', 'C')],
          ['EC', metricValue(latest, 'soil_ec_us_cm', 'uS/cm')],
          ['Status', latest?.status ?? '—'],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="text-xs font-semibold uppercase text-slate-500">{label}</div>
            <div className="mt-2 text-xl font-semibold text-slate-950">{value}</div>
          </div>
        ))}
      </section>

      {soilMetrics.map(([metric, label, domain], index) => (
        <ChartFrame key={metric} title={label}>
          {metricQueries[index].isLoading ? <LoadingBlock /> : null}
          <MetricLineChart points={toTimeSeriesPoints(metricData[index], timezone)} color={color} yDomain={domain} />
          <DataConfidenceStrip />
        </ChartFrame>
      ))}

      <div className="grid gap-5 xl:grid-cols-3">
        <ChartFrame title="Daily Moisture Summary">
          <DailyBandChart points={toDailyBandPoints(dailyMoisture.data, timezone)} color={color} yDomain={[0, 100]} />
        </ChartFrame>
        <ChartFrame title="Daily Temperature Summary">
          <DailyBandChart points={toDailyBandPoints(dailyTemperature.data, timezone)} color={color} yDomain={[-20, 80]} />
        </ChartFrame>
        <ChartFrame title="Daily EC Summary">
          <DailyBandChart points={toDailyBandPoints(dailyEc.data, timezone)} color={color} yDomain={[0, 20000]} />
        </ChartFrame>
      </div>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">Daily Summary</div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Moisture avg/min/max</th>
                <th className="px-4 py-3">Temp avg/min/max</th>
                <th className="px-4 py-3">EC avg/min/max</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dailyRows.map((row) => (
                <tr key={row.day}>
                  <td className="px-4 py-3">{formatDisplayDate(row.day, timezone)}</td>
                  <td className="px-4 py-3">{avgText(row.moisture?.avg)} / {avgText(row.moisture?.min)} / {avgText(row.moisture?.max)}</td>
                  <td className="px-4 py-3">{avgText(row.temperature?.avg)} / {avgText(row.temperature?.min)} / {avgText(row.temperature?.max)}</td>
                  <td className="px-4 py-3">{avgText(row.ec?.avg, 0)} / {avgText(row.ec?.min, 0)} / {avgText(row.ec?.max, 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <ChartFrame title="Reading Status Distribution">
        <StatusDistributionChart points={statusRows} />
      </ChartFrame>

      {nodeId === 'N2' ? (
        <>
          <ChartFrame title="RSSI dBm">
            <MetricLineChart
              points={toTimeSeriesPoints(rssi.data, timezone)}
              color={COLORS.pivot2}
              yDomain={[-120, -60]}
              referenceLines={[{ value: -110, label: 'Weak signal' }]}
            />
          </ChartFrame>
          <ChartFrame title="SNR dB">
            <MetricLineChart points={toTimeSeriesPoints(snr.data, timezone)} color={COLORS.pivot2} yDomain={[-20, 15]} referenceLines={[{ value: 0, label: '0 dB' }]} />
          </ChartFrame>
        </>
      ) : null}
    </div>
  );
}
