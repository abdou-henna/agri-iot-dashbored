import type { CleanedReading } from '../../types/analytics';
import type { SensorReading } from '../../types/readings';

const DEFAULT_FUTURE_TOLERANCE_MINUTES = 10;

export function isValidTimestamp(timestamp: string | null | undefined): boolean {
  if (!timestamp) return false;
  return !Number.isNaN(Date.parse(timestamp));
}

export function filterFutureTimestamps<T extends { measured_at: string }>(
  readings: ReadonlyArray<T>,
  nowIso: string,
  toleranceMinutes = DEFAULT_FUTURE_TOLERANCE_MINUTES,
): T[] {
  const nowMs = Date.parse(nowIso);
  const toleranceMs = toleranceMinutes * 60 * 1000;
  return readings.filter((reading) => {
    const measuredAtMs = Date.parse(reading.measured_at);
    return Number.isFinite(measuredAtMs) && measuredAtMs <= nowMs + toleranceMs;
  });
}

export function deduplicateReadings(readings: ReadonlyArray<SensorReading>): CleanedReading[] {
  const seen = new Set<string>();
  const deduped: CleanedReading[] = [];

  for (const reading of readings) {
    const key = reading.record_id || `${reading.node_id}|${reading.measured_at}`;
    const fallbackKey = `${reading.node_id}|${reading.measured_at}|${reading.record_id}`;
    const dedupeKey = key === '' ? fallbackKey : key;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);
    deduped.push({ ...reading });
  }

  return deduped;
}

export function sortByMeasuredAt<T extends { measured_at: string }>(readings: ReadonlyArray<T>): T[] {
  return [...readings].sort((a, b) => Date.parse(a.measured_at) - Date.parse(b.measured_at));
}

export function cleanReadings(readings: ReadonlyArray<SensorReading>, nowIso: string): CleanedReading[] {
  const valid = readings.filter((reading) => isValidTimestamp(reading.measured_at));
  const notFuture = filterFutureTimestamps(valid, nowIso);
  return sortByMeasuredAt(deduplicateReadings(notFuture));
}
