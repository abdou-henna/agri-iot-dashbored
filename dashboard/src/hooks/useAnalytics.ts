import { useMemo } from 'react';
import type { Bucket } from '../types/common';
import type { AnalyticsMetricName } from '../types/analytics';
import { useReadingAggregates } from './useReadingAggregates';
import { useReadings } from './useReadings';
import {
  calculateMissingPercentage,
  cleanReadings,
  detectDuplicateReadings,
  detectFlatline,
  detectSpikeOrStep,
  physicalRangeFlags,
} from '../utils/analytics';

interface UseAnalyticsParams {
  node_id: 'MAIN' | 'N2' | 'N3';
  metric: AnalyticsMetricName;
  from: string;
  to: string;
  bucket: Bucket;
  effectiveFrom?: string;
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

export function useAnalytics({ node_id, metric, from, to, bucket, effectiveFrom }: UseAnalyticsParams) {
  const queryFrom = effectiveFrom ?? from;
  const readingsQuery = useReadings({ node_id, from: queryFrom, to });
  const aggregateQuery = useReadingAggregates(node_id, metric, { from, to }, bucket);

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

  const missingPct = useMemo(() => {
    const durationMs = Math.max(0, Date.parse(to) - Date.parse(queryFrom));
    const expectedCount = Math.floor(durationMs / (10 * 60 * 1000));
    const validCount = cleanedReadings.filter((reading) => reading[metric] != null).length;
    return calculateMissingPercentage(expectedCount, validCount);
  }, [cleanedReadings, metric, queryFrom, to]);

  return {
    aggregates: aggregateQuery.data?.points?.map((point) => ({ ...point })) ?? [],
    qcFlags,
    duplicateMeta,
    cleanedReadings,
    missingPct,
    effectiveFrom: queryFrom,
    isLoading: readingsQuery.isLoading || aggregateQuery.isLoading,
    isError: readingsQuery.isError || aggregateQuery.isError,
    error: readingsQuery.error ?? aggregateQuery.error,
  };
}
