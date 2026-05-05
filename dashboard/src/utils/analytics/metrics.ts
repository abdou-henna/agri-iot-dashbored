import type { AgronomicEvent } from '../../types/agronomy';
import type { AggregatePoint, AnalyticsMetricName, IrrigationResponseMetric, MetricReading, VpdPoint } from '../../types/analytics';

function bucketStart(iso: string, bucket: 'hour' | 'day'): string {
  const d = new Date(iso);
  if (bucket === 'hour') d.setUTCMinutes(0, 0, 0);
  if (bucket === 'day') d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}

export function aggregateReadings(readings: ReadonlyArray<MetricReading>, metric: AnalyticsMetricName, bucket: 'hour' | 'day'): AggregatePoint[] {
  const map = new Map<string, number[]>();
  for (const r of readings) {
    const key = bucketStart(r.measured_at, bucket);
    const current = map.get(key) ?? [];
    const value = r[metric];
    if (value != null) current.push(value);
    map.set(key, current);
  }
  return [...map.entries()].sort(([a], [b]) => Date.parse(a) - Date.parse(b)).map(([key, values]) => ({
    bucket_start: key,
    avg: values.length ? values.reduce((s, v) => s + v, 0) / values.length : null,
    min: values.length ? Math.min(...values) : null,
    max: values.length ? Math.max(...values) : null,
    count: values.length,
    missing_count: 0,
  }));
}

export function moistureDropRate(startMoisture: number, endMoisture: number, deltaHours: number): number | null {
  if (deltaHours <= 0) return null;
  return (endMoisture - startMoisture) / deltaHours;
}

export function irrigationResponseDelta(preValue: number | null, postValue: number | null): number | null {
  if (preValue == null || postValue == null) return null;
  return postValue - preValue;
}

export function irrigationResponseLag(irrigationStart: string, firstResponseAt: string | null): number | null {
  if (!firstResponseAt) return null;
  return (Date.parse(firstResponseAt) - Date.parse(irrigationStart)) / (60 * 1000);
}

export function computeVpdPoint(measured_at: string, air_temperature_c: number | null, air_humidity_percent: number | null): VpdPoint | null {
  if (air_temperature_c == null || air_humidity_percent == null) return null;
  const svp = 0.6108 * Math.exp((17.27 * air_temperature_c) / (air_temperature_c + 237.3));
  const vpd_kpa = svp * (1 - air_humidity_percent / 100);
  return { measured_at, air_temperature_c, air_humidity_percent, vpd_kpa };
}

export function ecBaselineDriftTrend(currentEc: number | null, baselineEc: number | null): number | null {
  if (currentEc == null || baselineEc == null || baselineEc === 0) return null;
  return (currentEc - baselineEc) / baselineEc;
}

export function cuttingIntervalLength(previousCutStartedAt: string, currentCutStartedAt: string): number {
  return (Date.parse(currentCutStartedAt) - Date.parse(previousCutStartedAt)) / (24 * 60 * 60 * 1000);
}

export function buildIrrigationResponseMetric(event: AgronomicEvent, pre_value: number | null, post_value: number | null, first_response_at: string | null): IrrigationResponseMetric {
  return {
    irrigation_event: {
      agro_event_id: event.agro_event_id,
      started_at: event.started_at,
      ended_at: event.ended_at,
      target_scope: event.target_scope,
      confidence: event.confidence,
    },
    pre_value,
    post_value,
    delta: irrigationResponseDelta(pre_value, post_value),
    lag_minutes: irrigationResponseLag(event.started_at, first_response_at),
  };
}
