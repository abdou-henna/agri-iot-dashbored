import { useMemo, useState } from 'react';
import {
  ChartFrame,
  DailyBandChart,
  DataConfidenceStrip,
  MetricLineChart,
  StatusDistributionChart,
  TimeRangeSelector,
} from '../../components/charts/BasicCharts';
import { COLORS } from '../../config/constants';
import { useReadingAggregates } from '../../hooks/useReadingAggregates';
import { useReadings } from '../../hooks/useReadings';
import { useTimeZone } from '../../hooks/useTimeZone';
import type { MetricKey } from '../../types/common';
import type { SensorReading } from '../../types/readings';
import { toDailyBandPoints, toStatusDistribution, toTimeSeriesPoints } from '../../utils/chartData';
import { formatDisplayDate, rangeForPreset } from '../../utils/time';

const weatherMetrics: Array<[MetricKey, string, [number, number]]> = [
  ['air_temperature_c', 'Air Temperature C', [-40, 85]],
  ['air_humidity_percent', 'Air Humidity %', [0, 100]],
  ['air_pressure_hpa', 'Air Pressure hPa', [950, 1050]],
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

export function WeatherPage() {
  const [preset, setPreset] = useState<'24h' | '7d' | '30d'>('24h');
  const { timezone } = useTimeZone();
  const range = useMemo(() => rangeForPreset(preset), [preset]);
  const temp = useReadingAggregates('N3', 'air_temperature_c', range);
  const humidity = useReadingAggregates('N3', 'air_humidity_percent', range);
  const pressure = useReadingAggregates('N3', 'air_pressure_hpa', range);
  const dailyTemp = useReadingAggregates('N3', 'air_temperature_c', range, '1day');
  const dailyHumidity = useReadingAggregates('N3', 'air_humidity_percent', range, '1day');
  const dailyPressure = useReadingAggregates('N3', 'air_pressure_hpa', range, '1day');
  const readings = useReadings({ node_id: 'N3', node_type: 'weather', from: range.from, to: range.to, limit: 1000 });
  const rssi = useReadingAggregates('N3', 'rssi', range);
  const snr = useReadingAggregates('N3', 'snr', range);
  const queries = [temp, humidity, pressure];
  const latest = latestReading(readings.data?.readings);
  const statusRows = toStatusDistribution(readings.data?.readings, timezone);
  const dailyRows = useMemo(() => {
    const temperatureByDay = new Map((dailyTemp.data?.points ?? []).map((point) => [point.bucket_start, point]));
    const humidityByDay = new Map((dailyHumidity.data?.points ?? []).map((point) => [point.bucket_start, point]));
    const pressureByDay = new Map((dailyPressure.data?.points ?? []).map((point) => [point.bucket_start, point]));
    const days = Array.from(new Set([...temperatureByDay.keys(), ...humidityByDay.keys(), ...pressureByDay.keys()])).sort();
    return days.map((day) => ({
      day,
      temperature: temperatureByDay.get(day),
      humidity: humidityByDay.get(day),
      pressure: pressureByDay.get(day),
    }));
  }, [dailyTemp.data?.points, dailyHumidity.data?.points, dailyPressure.data?.points]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h2 className="text-xl font-semibold text-slate-950">Weather - Shared Context</h2>
        <TimeRangeSelector value={preset} onChange={setPreset} />
      </div>
      <section className="grid gap-3 md:grid-cols-4">
        {[
          ['Air Temp', metricValue(latest, 'air_temperature_c', 'C')],
          ['Humidity', metricValue(latest, 'air_humidity_percent', '%')],
          ['Pressure', metricValue(latest, 'air_pressure_hpa', 'hPa')],
          ['Status', latest?.status ?? '—'],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="text-xs font-semibold uppercase text-slate-500">{label}</div>
            <div className="mt-2 text-xl font-semibold text-slate-950">{value}</div>
          </div>
        ))}
      </section>
      {weatherMetrics.map(([metric, label, domain], index) => (
        <ChartFrame key={metric} title={label}>
          <MetricLineChart points={toTimeSeriesPoints(queries[index].data, timezone)} color={COLORS.weather} yDomain={domain} />
          <DataConfidenceStrip />
        </ChartFrame>
      ))}

      <div className="grid gap-5 xl:grid-cols-3">
        <ChartFrame title="Daily Air Temperature Summary">
          <DailyBandChart points={toDailyBandPoints(dailyTemp.data, timezone)} color={COLORS.weather} yDomain={[-40, 85]} />
        </ChartFrame>
        <ChartFrame title="Daily Humidity Summary">
          <DailyBandChart points={toDailyBandPoints(dailyHumidity.data, timezone)} color={COLORS.weather} yDomain={[0, 100]} />
        </ChartFrame>
        <ChartFrame title="Daily Pressure Summary">
          <DailyBandChart points={toDailyBandPoints(dailyPressure.data, timezone)} color={COLORS.weather} yDomain={[950, 1050]} />
        </ChartFrame>
      </div>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">Daily Summary</div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Air temp avg/min/max</th>
                <th className="px-4 py-3">Humidity avg/min/max</th>
                <th className="px-4 py-3">Pressure avg/min/max</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dailyRows.map((row) => (
                <tr key={row.day}>
                  <td className="px-4 py-3">{formatDisplayDate(row.day, timezone)}</td>
                  <td className="px-4 py-3">{avgText(row.temperature?.avg)} / {avgText(row.temperature?.min)} / {avgText(row.temperature?.max)}</td>
                  <td className="px-4 py-3">{avgText(row.humidity?.avg)} / {avgText(row.humidity?.min)} / {avgText(row.humidity?.max)}</td>
                  <td className="px-4 py-3">{avgText(row.pressure?.avg)} / {avgText(row.pressure?.min)} / {avgText(row.pressure?.max)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <ChartFrame title="Weather Reading Status Distribution">
        <StatusDistributionChart points={statusRows} />
      </ChartFrame>

      <ChartFrame title="RSSI dBm">
        <MetricLineChart
          points={toTimeSeriesPoints(rssi.data, timezone)}
          color={COLORS.weather}
          yDomain={[-120, -60]}
          referenceLines={[{ value: -110, label: 'Weak signal' }]}
        />
      </ChartFrame>
      <ChartFrame title="SNR dB">
        <MetricLineChart points={toTimeSeriesPoints(snr.data, timezone)} color={COLORS.weather} yDomain={[-20, 15]} referenceLines={[{ value: 0, label: '0 dB' }]} />
      </ChartFrame>
    </div>
  );
}
