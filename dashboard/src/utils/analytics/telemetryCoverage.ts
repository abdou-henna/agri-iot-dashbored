import type { SensorReading } from '../../types/readings';
import type { AnalyticsMetricName } from '../../types/analytics';

const EXPECTED_TELEMETRY_CADENCE_MINUTES = 10;

export interface TelemetryCoverageSummary {
  selected_window_start: string;
  selected_window_end: string;
  telemetry_coverage_start?: string;
  telemetry_coverage_end?: string;
  coverage_basis: 'telemetry_window' | 'selected_window' | 'no_telemetry';
  expected_count: number;
  valid_count: number;
  missing_count: number;
  missing_rate: number;
  excluded_pre_telemetry_minutes: number;
  expected_cadence_minutes: number;
}

interface BuildCoverageParams {
  readings: ReadonlyArray<SensorReading>;
  metric: AnalyticsMetricName;
  selectedFrom: string;
  selectedTo: string;
  expectedCadenceMinutes?: number;
}

/**
 * Computes missing-data rate relative to the actual telemetry coverage window
 * (first → last measured_at), not the full selected report window.
 *
 * Pre-telemetry time (selectedFrom → first reading) is excluded from expected_count
 * and reported separately as excluded_pre_telemetry_minutes.
 */
export function buildTelemetryCoverageSummary({
  readings,
  metric,
  selectedFrom,
  selectedTo,
  expectedCadenceMinutes = EXPECTED_TELEMETRY_CADENCE_MINUTES,
}: BuildCoverageParams): TelemetryCoverageSummary {
  const cadenceMs = expectedCadenceMinutes * 60 * 1000;

  const validReadings = readings
    .filter((r) => r[metric] != null && !Number.isNaN(Date.parse(r.measured_at)))
    .slice()
    .sort((a, b) => Date.parse(a.measured_at) - Date.parse(b.measured_at));

  const validCount = validReadings.length;

  if (validCount === 0) {
    return {
      selected_window_start: selectedFrom,
      selected_window_end: selectedTo,
      coverage_basis: 'no_telemetry',
      expected_count: 0,
      valid_count: 0,
      missing_count: 0,
      missing_rate: 0,
      excluded_pre_telemetry_minutes: 0,
      expected_cadence_minutes: expectedCadenceMinutes,
    };
  }

  const coverageStart = validReadings[0].measured_at;
  const coverageEnd = validReadings[validReadings.length - 1].measured_at;

  const selectedFromMs = Date.parse(selectedFrom);
  const selectedToMs = Date.parse(selectedTo);
  const coverageStartMs = Date.parse(coverageStart);
  const coverageEndMs = Date.parse(coverageEnd);

  // Effective range = intersection of [selectedFrom, selectedTo] and [coverageStart, coverageEnd]
  const rangeStartMs = Math.max(selectedFromMs, coverageStartMs);
  const rangeEndMs = Math.min(selectedToMs, coverageEndMs);
  const rangeMs = Math.max(0, rangeEndMs - rangeStartMs);

  const expectedCount = Math.floor(rangeMs / cadenceMs);
  const missingCount = Math.max(0, expectedCount - validCount);
  const missingRate = expectedCount > 0 ? missingCount / expectedCount : 0;

  // Minutes before first telemetry that are excluded from the expected count
  const excludedPreTelemetryMinutes =
    coverageStartMs > selectedFromMs
      ? Math.round((coverageStartMs - selectedFromMs) / 60000)
      : 0;

  // selected_window: telemetry fully envelops selected window (no exclusions)
  // telemetry_window: coverage does not fully envelope the selected window
  const coverageBasis: TelemetryCoverageSummary['coverage_basis'] =
    coverageStartMs <= selectedFromMs && coverageEndMs >= selectedToMs
      ? 'selected_window'
      : 'telemetry_window';

  return {
    selected_window_start: selectedFrom,
    selected_window_end: selectedTo,
    telemetry_coverage_start: coverageStart,
    telemetry_coverage_end: coverageEnd,
    coverage_basis: coverageBasis,
    expected_count: expectedCount,
    valid_count: validCount,
    missing_count: missingCount,
    missing_rate: missingRate,
    excluded_pre_telemetry_minutes: excludedPreTelemetryMinutes,
    expected_cadence_minutes: expectedCadenceMinutes,
  };
}
