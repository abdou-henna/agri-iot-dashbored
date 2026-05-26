import { useMemo } from 'react';
import type { Bucket } from '../types/common';
import type { AnalyticsMetricName } from '../types/analytics';
import { useReadingAggregates } from './useReadingAggregates';
import { useReadings } from './useReadings';
import {
  aggregateReadings,
  cleanReadings,
  detectDuplicateReadings,
  detectFlatline,
  detectSpikeOrStep,
  physicalRangeFlags,
} from '../utils/analytics';
import { buildTelemetryCoverageSummary } from '../utils/analytics/telemetryCoverage';

interface UseAnalyticsParams {
  node_id: 'MAIN' | 'N2' | 'N3';
  metric: AnalyticsMetricName;
  from: string;
  to: string;
  bucket: Bucket;
  effectiveFrom?: string;
  aggregateMode?: 'api' | 'derived';
  readingsLimit?: number;
}

const SPIKE_THRESHOLDS: Record<AnalyticsMetricName, number> = {
  soil_moisture_percent: 12,
  soil_temperature_c: 6,
  soil_ec_us_cm: 1200,
  air_temperature_c: 6,
  air_humidity_percent: 15,
  air_pressure_hpa: 8,
  rssi: 12,
  snr: 8,
};

export function useAnalytics({ node_id, metric, from, to, bucket, effectiveFrom, aggregateMode = 'api', readingsLimit = 1000 }: UseAnalyticsParams) {
  const queryFrom = effectiveFrom ?? from;
  const readingsQuery = useReadings({ node_id, from: queryFrom, to, limit: readingsLimit });
  const aggregateQuery = useReadingAggregates(node_id, metric, { from, to }, bucket, aggregateMode === 'api');

  const cleanedReadings = useMemo(() => cleanReadings(readingsQuery.data?.readings ?? [], new Date().toISOString()), [readingsQuery.data?.readings]);
  const duplicateMeta = useMemo(() => detectDuplicateReadings(readingsQuery.data?.readings ?? []), [readingsQuery.data?.readings]);

  const qcFlags = useMemo(() => {
    const flags = [
      ...physicalRangeFlags(cleanedReadings, metric),
      ...detectFlatline(cleanedReadings, metric),
      ...detectSpikeOrStep(cleanedReadings, metric, SPIKE_THRESHOLDS[metric]),
    ];
    return flags;
  }, [cleanedReadings, metric]);

  const telemetryCoverage = useMemo(
    () => buildTelemetryCoverageSummary({ readings: cleanedReadings, metric, selectedFrom: queryFrom, selectedTo: to }),
    [cleanedReadings, metric, queryFrom, to],
  );
  const missingPct = telemetryCoverage.missing_rate;

  const derivedAggregates = useMemo(() => {
    if (aggregateMode !== 'derived') return [];
    return aggregateReadings(cleanedReadings, metric, bucket, from, to);
  }, [aggregateMode, bucket, cleanedReadings, from, metric, to]);

  const aggregates = aggregateMode === 'derived'
    ? derivedAggregates
    : (aggregateQuery.data?.points?.map((point) => ({ ...point })) ?? []);

  return {
    aggregates,
    aggregateMode,
    qcFlags,
    duplicateMeta,
    cleanedReadings,
    missingPct,
    telemetryCoverage,
    effectiveFrom: queryFrom,
    isLoading: readingsQuery.isLoading || (aggregateMode === 'api' && aggregateQuery.isLoading),
    isError: readingsQuery.isError || (aggregateMode === 'api' && aggregateQuery.isError),
    error: readingsQuery.error ?? (aggregateMode === 'api' ? aggregateQuery.error : null),
  };
}
