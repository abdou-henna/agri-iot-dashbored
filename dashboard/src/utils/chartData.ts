import type { ReadingAggregateResponse, TimeSeriesPoint } from '../types/readings';
import type { SensorReading } from '../types/readings';
import type { DailyBandPoint, StatusDistributionPoint, DualSeriesPoint } from '../components/charts/BasicCharts';
import { formatDisplayDate, formatDisplayTime } from './time';

export function toTimeSeriesPoints(response: ReadingAggregateResponse | undefined, timezone: string): TimeSeriesPoint[] {
  return (
    response?.points.map((point) => ({
      ts: point.bucket_start,
      displayTime: formatDisplayTime(point.bucket_start, { timezone }),
      value: point.missing_count > 0 || point.avg === null ? null : point.avg,
      node_id: response.node_id,
      missingCount: point.missing_count,
    })) ?? []
  );
}

export function toDailyBandPoints(response: ReadingAggregateResponse | undefined, timezone: string): DailyBandPoint[] {
  return (
    response?.points.map((point) => ({
      ts: point.bucket_start,
      displayDate: formatDisplayDate(point.bucket_start, timezone),
      avg: point.missing_count > 0 || point.avg === null ? null : point.avg,
      min: point.missing_count > 0 || point.min === null ? null : point.min,
      max: point.missing_count > 0 || point.max === null ? null : point.max,
    })) ?? []
  );
}

export function toStatusDistribution(readings: SensorReading[] | undefined, timezone: string): StatusDistributionPoint[] {
  const byDay = new Map<string, StatusDistributionPoint>();

  readings?.forEach((reading) => {
    const day = formatDisplayDate(reading.measured_at, timezone);
    const row = byDay.get(day) ?? { day, ok: 0, partial: 0, error: 0, missing: 0 };
    if (reading.status === 'ok') row.ok += 1;
    if (reading.status === 'partial') row.partial += 1;
    if (reading.status === 'error') row.error += 1;
    if (reading.status === 'missing') row.missing += 1;
    byDay.set(day, row);
  });

  return [...byDay.values()].sort((a, b) => a.day.localeCompare(b.day));
}

export function alignDualSeries(left: TimeSeriesPoint[], right: TimeSeriesPoint[]): DualSeriesPoint[] {
  const rows = new Map<string, DualSeriesPoint>();

  left.forEach((point) => {
    rows.set(point.ts, {
      ts: point.ts,
      displayTime: point.displayTime,
      left: point.value,
      right: null,
    });
  });

  right.forEach((point) => {
    const existing = rows.get(point.ts);
    if (existing) {
      existing.right = point.value;
      return;
    }
    rows.set(point.ts, {
      ts: point.ts,
      displayTime: point.displayTime,
      left: null,
      right: point.value,
    });
  });

  return [...rows.values()].sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime());
}
