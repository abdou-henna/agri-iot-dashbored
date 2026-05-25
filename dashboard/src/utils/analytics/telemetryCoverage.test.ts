import { describe, it, expect } from 'vitest';
import { buildTelemetryCoverageSummary } from './telemetryCoverage';
import type { SensorReading } from '../../types/readings';

// Minimal SensorReading factory — only the fields the coverage helper uses
function makeReading(measured_at: string, soil_moisture_percent: number | null = 42): SensorReading {
  return {
    record_id: measured_at,
    upload_id: null,
    gateway_id: 'gw',
    node_id: 'MAIN',
    node_type: 'soil',
    node_seq: null,
    frame_id: null,
    measured_at,
    received_at: null,
    rssi: null,
    snr: null,
    battery_mv: null,
    battery_percent: null,
    battery_status: 'not_measured',
    soil_temperature_c: null,
    soil_moisture_percent,
    soil_ec_us_cm: null,
    air_temperature_c: null,
    air_humidity_percent: null,
    air_pressure_hpa: null,
    status: 'ok',
    error_code: null,
  };
}

// Generate readings at a fixed interval between two dates
function generateReadings(from: Date, to: Date, stepMinutes: number): SensorReading[] {
  const step = stepMinutes * 60 * 1000;
  const readings: SensorReading[] = [];
  for (let t = from.getTime(); t <= to.getTime(); t += step) {
    readings.push(makeReading(new Date(t).toISOString()));
  }
  return readings;
}

describe('buildTelemetryCoverageSummary', () => {
  // Fixture: selected window Apr 25 → May 25 2025 (30 days)
  // Telemetry starts May 12 → May 25 2025 (13 days)
  const selectedFrom = '2025-04-25T00:00:00.000Z';
  const selectedTo = '2025-05-25T00:00:00.000Z';
  const telemetryStart = new Date('2025-05-12T00:00:00.000Z');
  const telemetryEnd = new Date('2025-05-25T00:00:00.000Z');

  // Pre-telemetry gap: Apr 25 → May 12 = 17 days = 24480 minutes
  const EXPECTED_PRE_TELEMETRY_MINUTES = 17 * 24 * 60; // 24480

  it('excludes pre-telemetry period from expected_count and missing_rate', () => {
    // Generate readings every 15 min in telemetry window (~832 readings)
    const readings = generateReadings(telemetryStart, telemetryEnd, 15);

    const result = buildTelemetryCoverageSummary({
      readings,
      metric: 'soil_moisture_percent',
      selectedFrom,
      selectedTo,
    });

    // Coverage should start at telemetry start, not selected window start
    expect(result.telemetry_coverage_start).toBe(telemetryStart.toISOString());
    expect(result.coverage_basis).toBe('telemetry_window');
    expect(result.excluded_pre_telemetry_minutes).toBe(EXPECTED_PRE_TELEMETRY_MINUTES);

    // expected_count must be computed from telemetry window (13 days at 10 min),
    // not from the full selected window (30 days at 10 min).
    const expectedFromFullWindow = Math.floor((30 * 24 * 60) / 10); // 4320
    const expectedFromCoverage = Math.floor((13 * 24 * 60) / 10);   // 1872
    expect(result.expected_count).toBe(expectedFromCoverage);
    expect(result.expected_count).not.toBe(expectedFromFullWindow);

    // missing_rate is relative to the telemetry window, not the full window
    const naiveMissingRate = (expectedFromFullWindow - readings.length) / expectedFromFullWindow;
    expect(result.missing_rate).not.toBeCloseTo(naiveMissingRate, 2);
    // missing_rate should be reasonable for 15-min sampled vs 10-min expected
    expect(result.missing_rate).toBeGreaterThanOrEqual(0);
    expect(result.missing_rate).toBeLessThanOrEqual(1);
  });

  it('coverage_basis is selected_window when telemetry fully covers the window', () => {
    // Readings from before selectedFrom to after selectedTo
    const readings = generateReadings(
      new Date('2025-04-24T00:00:00.000Z'),
      new Date('2025-05-26T00:00:00.000Z'),
      10,
    );

    const result = buildTelemetryCoverageSummary({
      readings,
      metric: 'soil_moisture_percent',
      selectedFrom,
      selectedTo,
    });

    expect(result.coverage_basis).toBe('selected_window');
    expect(result.excluded_pre_telemetry_minutes).toBe(0);
  });

  it('returns no_telemetry when no valid readings exist', () => {
    const readings = generateReadings(telemetryStart, telemetryEnd, 10).map((r) => ({
      ...r,
      soil_moisture_percent: null,
    }));

    const result = buildTelemetryCoverageSummary({
      readings,
      metric: 'soil_moisture_percent',
      selectedFrom,
      selectedTo,
    });

    expect(result.coverage_basis).toBe('no_telemetry');
    expect(result.expected_count).toBe(0);
    expect(result.missing_rate).toBe(0);
    expect(result.excluded_pre_telemetry_minutes).toBe(0);
  });

  it('returns no_telemetry for empty readings array', () => {
    const result = buildTelemetryCoverageSummary({
      readings: [],
      metric: 'soil_moisture_percent',
      selectedFrom,
      selectedTo,
    });

    expect(result.coverage_basis).toBe('no_telemetry');
    expect(result.valid_count).toBe(0);
  });

  it('missing_count is never negative', () => {
    // More readings than expected slots (e.g. double-frequency sensor)
    const readings = generateReadings(telemetryStart, telemetryEnd, 5); // every 5 min

    const result = buildTelemetryCoverageSummary({
      readings,
      metric: 'soil_moisture_percent',
      selectedFrom,
      selectedTo,
    });

    expect(result.missing_count).toBeGreaterThanOrEqual(0);
    expect(result.missing_rate).toBeGreaterThanOrEqual(0);
  });
});
