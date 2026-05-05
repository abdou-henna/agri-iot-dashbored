import type { AgronomicEvent } from '../../types/agronomy';
import type { AnalyticsMetricName, MetricReading, QcFlag } from '../../types/analytics';

const ranges: Record<AnalyticsMetricName, { min: number; max: number; code: string }> = {
  soil_moisture_percent: { min: 0, max: 100, code: 'IMPOSSIBLE_SOIL_MOISTURE' },
  soil_temperature_c: { min: -20, max: 80, code: 'IMPOSSIBLE_SOIL_TEMPERATURE' },
  soil_ec_us_cm: { min: 0, max: 20000, code: 'IMPOSSIBLE_SOIL_EC' },
  air_temperature_c: { min: -40, max: 85, code: 'IMPOSSIBLE_AIR_TEMPERATURE' },
  air_humidity_percent: { min: 0, max: 100, code: 'IMPOSSIBLE_AIR_HUMIDITY' },
  air_pressure_hpa: { min: 300, max: 1200, code: 'IMPOSSIBLE_AIR_PRESSURE' },
  rssi: { min: -140, max: -20, code: 'IMPOSSIBLE_RSSI' },
  snr: { min: -30, max: 30, code: 'IMPOSSIBLE_SNR' },
};

export function physicalRangeFlags(readings: ReadonlyArray<MetricReading>, metric: AnalyticsMetricName): QcFlag[] {
  const cfg = ranges[metric];
  return readings.flatMap((r) => {
    const value = r[metric];
    if (value == null || (value >= cfg.min && value <= cfg.max)) return [];
    return [{ code: cfg.code, severity: 'error', domain: 'sensor', node_id: r.node_id, start_time: r.measured_at, message: `${metric} outside valid range`, details: { value, min: cfg.min, max: cfg.max } }];
  });
}

export function detectFlatline(readings: ReadonlyArray<MetricReading>, metric: AnalyticsMetricName, minPoints = 18): QcFlag[] {
  if (readings.length < minPoints) return [];
  const values = readings.map((r) => r[metric]).filter((v): v is number => v != null);
  if (values.length < minPoints) return [];
  const first = values[0];
  if (values.every((v) => v === first)) {
    return [{ code: 'SENSOR_FLATLINE', severity: 'warning', domain: 'sensor', node_id: readings[0]?.node_id, start_time: readings[0].measured_at, end_time: readings[readings.length - 1].measured_at, message: `${metric} appears flatlined` }];
  }
  return [];
}

export function detectSpikeOrStep(readings: ReadonlyArray<MetricReading>, metric: AnalyticsMetricName, deltaThreshold: number): QcFlag[] {
  const flags: QcFlag[] = [];
  for (let i = 1; i < readings.length; i += 1) {
    const prev = readings[i - 1][metric];
    const curr = readings[i][metric];
    if (prev == null || curr == null) continue;
    const delta = curr - prev;
    if (Math.abs(delta) >= deltaThreshold) {
      flags.push({ code: 'SPIKE_OR_STEP_DETECTED', severity: 'warning', domain: 'sensor', node_id: readings[i].node_id, start_time: readings[i - 1].measured_at, end_time: readings[i].measured_at, message: `${metric} abrupt change`, details: { prev, curr, delta, deltaThreshold } });
    }
  }
  return flags;
}

export function calculateMissingPercentage(expectedCount: number, validCount: number): number {
  if (expectedCount <= 0) return 0;
  const missing = Math.max(0, expectedCount - validCount);
  return missing / expectedCount;
}

export function isEventWindowComplete(event: Pick<AgronomicEvent, 'started_at' | 'ended_at'>): boolean {
  if (!event.started_at || !event.ended_at) return false;
  return Date.parse(event.ended_at) > Date.parse(event.started_at);
}
