import { useMemo, useState } from 'react';
import { Maximize2 } from 'lucide-react';
import { ChartFrame, ChartExpandModal, DualMetricChart, TimeRangeSelector } from '../../components/charts/BasicCharts';
import { COLORS } from '../../config/constants';
import { useReadingAggregates } from '../../hooks/useReadingAggregates';
import { useTimeZone } from '../../hooks/useTimeZone';
import type { MetricKey } from '../../types/common';
import type { ReadingAggregateResponse } from '../../types/readings';
import { alignDualSeries, toTimeSeriesPoints } from '../../utils/chartData';
import { rangeForPreset } from '../../utils/time';

function latestAvg(response: ReadingAggregateResponse | undefined) {
  return response?.points
    .slice()
    .reverse()
    .find((point) => point.avg !== null && point.missing_count === 0)?.avg ?? null;
}

function formatDelta(label: string, unit: string, p1: number | null, p2: number | null) {
  if (p1 === null || p2 === null) return `${label}: waiting for shared latest values`;
  const diff = p1 - p2;
  if (Math.abs(diff) < 0.05) return `${label}: similar`;
  const direction = diff > 0 ? 'Pivot 1 is higher' : 'Pivot 2 is higher';
  return `${label}: ${direction} by ${Math.abs(diff).toFixed(1)} ${unit}`;
}

function useComparisonMetric(metric: MetricKey, preset: '24h' | '7d' | '30d') {
  const { timezone } = useTimeZone();
  const range = useMemo(() => rangeForPreset(preset), [preset]);
  const p1 = useReadingAggregates('MAIN', metric, range);
  const p2 = useReadingAggregates('N2', metric, range);
  const points = alignDualSeries(toTimeSeriesPoints(p1.data, timezone), toTimeSeriesPoints(p2.data, timezone));

  return {
    points,
    p1Latest: latestAvg(p1.data),
    p2Latest: latestAvg(p2.data),
  };
}

function ComparisonChart({
  metric,
  title,
  domain,
  preset,
  onExpand,
}: {
  metric: MetricKey;
  title: string;
  domain: [number, number];
  preset: '24h' | '7d' | '30d';
  onExpand: (metric: MetricKey) => void;
}) {
  const comparison = useComparisonMetric(metric, preset);

  return (
    <ChartFrame title={title} actions={<button className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-700" onClick={() => onExpand(metric)}><Maximize2 className="h-3.5 w-3.5" /></button>}>
      <DualMetricChart
        points={comparison.points}
        leftName="Pivot 1"
        rightName="Pivot 2"
        leftColor={COLORS.pivot1}
        rightColor={COLORS.pivot2}
        yDomain={domain}
      />
    </ChartFrame>
  );
}

export function ComparisonPage() {
  const [preset, setPreset] = useState<'24h' | '7d' | '30d'>('24h');
  const [expandedMetric, setExpandedMetric] = useState<MetricKey | null>(null);
  const moisture = useComparisonMetric('soil_moisture_percent', preset);
  const temperature = useComparisonMetric('soil_temperature_c', preset);
  const ec = useComparisonMetric('soil_ec_us_cm', preset);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h2 className="text-xl font-semibold text-slate-950">Pivot Comparison</h2>
        <TimeRangeSelector value={preset} onChange={setPreset} />
      </div>

      <ChartExpandModal open={Boolean(expandedMetric)} title="Expanded comparison chart" onClose={() => setExpandedMetric(null)} controls={<TimeRangeSelector value={preset} onChange={setPreset} />}>
        {expandedMetric ? (
          <DualMetricChart
            points={expandedMetric === 'soil_moisture_percent' ? moisture.points : expandedMetric === 'soil_temperature_c' ? temperature.points : ec.points}
            leftName="Pivot 1"
            rightName="Pivot 2"
            leftColor={COLORS.pivot1}
            rightColor={COLORS.pivot2}
            yDomain={expandedMetric === 'soil_moisture_percent' ? [0, 100] : expandedMetric === 'soil_temperature_c' ? [-20, 80] : [0, 20000]}
          />
        ) : null}
      </ChartExpandModal>

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="font-semibold text-slate-900">Delta Panel</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {[formatDelta('Moisture', '%', moisture.p1Latest, moisture.p2Latest), formatDelta('Temperature', 'C', temperature.p1Latest, temperature.p2Latest), formatDelta('EC', 'uS/cm', ec.p1Latest, ec.p2Latest)].map((text) => (
            <div key={text} className="rounded-md border border-slate-200 p-3 text-sm text-slate-700">
              {text}
            </div>
          ))}
        </div>
      </section>
      <ComparisonChart metric="soil_moisture_percent" title="Soil Moisture Comparison" domain={[0, 100]} preset={preset} onExpand={setExpandedMetric} />
      <ComparisonChart metric="soil_temperature_c" title="Soil Temperature Comparison" domain={[-20, 80]} preset={preset} onExpand={setExpandedMetric} />
      <ComparisonChart metric="soil_ec_us_cm" title="Soil EC Comparison" domain={[0, 20000]} preset={preset} onExpand={setExpandedMetric} />
      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="font-semibold text-slate-900">Soil Moisture vs Air Temperature</h2>
        <p className="mt-2 text-sm text-slate-500">Correlation scatter is reserved until aligned soil and weather aggregate samples can be fetched safely without merging pivot identities.</p>
      </section>
    </div>
  );
}
