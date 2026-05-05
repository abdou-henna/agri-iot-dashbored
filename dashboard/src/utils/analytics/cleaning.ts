import type { CleanedReading, DuplicateReadingMeta } from '../../types/analytics';
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

function duplicateKey(reading: Pick<SensorReading, 'record_id' | 'node_id' | 'measured_at'>): string {
  return reading.record_id || `${reading.node_id}|${reading.measured_at}`;
}

export function detectDuplicateReadings(readings: ReadonlyArray<SensorReading>): DuplicateReadingMeta[] {
  const grouped = new Map<string, SensorReading[]>();

  for (const reading of readings) {
    const key = duplicateKey(reading);
    const existing = grouped.get(key) ?? [];
    grouped.set(key, [...existing, reading]);
  }

  const duplicates: DuplicateReadingMeta[] = [];
  for (const [key, group] of grouped.entries()) {
    if (group.length < 2) continue;
    const serialized = group.map((item) => JSON.stringify(item));
    const conflict = new Set(serialized).size > 1;
    duplicates.push({
      key,
      count: group.length,
      conflict,
      record_ids: group.map((item) => item.record_id),
    });
  }

  return duplicates;
}

export function deduplicateReadings(readings: ReadonlyArray<SensorReading>): CleanedReading[] {
  const seen = new Set<string>();
  const deduped: CleanedReading[] = [];

  for (const reading of readings) {
    const key = duplicateKey(reading);
    if (seen.has(key)) continue;
    seen.add(key);
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
