import { useMemo } from 'react';
import type { Bucket, MetricKey, NodeId } from '../types/common';
import type { AlertEvaluation, AnalyticsMetricName } from '../types/analytics';
import { useAnalytics } from './useAnalytics';
import { useReliabilityScores } from './useReliabilityScores';
import { useStatus } from './useStatus';
import { evaluateDryingTrend, evaluateEcTrendCaution, evaluateMissingNode, evaluateStaleMeasurement, evaluateUnreliableData } from '../utils/analytics/alerts';

interface UseAlertEvaluationsParams {
  node_id: NodeId;
  metric: MetricKey;
  from: string;
  to: string;
  bucket: Bucket;
  effectiveFrom?: string;
  aggregateMode?: 'api' | 'derived';
}

export function useAlertEvaluations({ node_id, metric, from, to, bucket, effectiveFrom, aggregateMode = 'api' }: UseAlertEvaluationsParams) {
  const analytics = useAnalytics({ node_id, metric: metric as AnalyticsMetricName, from, to, bucket, effectiveFrom, aggregateMode });
  const reliabilityQuery = useReliabilityScores({ from, to });
  const statusQuery = useStatus();

  const evaluations = useMemo<ReadonlyArray<AlertEvaluation>>(() => {
    const nowIso = to;
    const result: AlertEvaluation[] = [];

    const reliability = reliabilityQuery.byNode.map.get(node_id);
    if (reliability) {
      const unreliable = evaluateUnreliableData(reliability, nowIso);
      if (unreliable) result.push(unreliable);
    }

    const latestStatus = statusQuery.data?.latest_readings.find((entry) => entry.node_id === node_id);
    const stale = evaluateStaleMeasurement(latestStatus?.measured_at ?? null, nowIso);
    if (stale) result.push(stale);

    const missingNode = evaluateMissingNode(latestStatus?.measured_at ?? null, nowIso);
    if (missingNode) result.push(missingNode);

    if (metric === 'soil_moisture_percent' && analytics.aggregates.length >= 4) {
      const avgs = analytics.aggregates.map((p) => p.avg).filter((v): v is number => typeof v === 'number');
      if (avgs.length >= 4) {
        const half = Math.floor(avgs.length / 2);
        const firstAvg = avgs.slice(0, half).reduce((a, b) => a + b, 0) / Math.max(1, half);
        const secondAvg = avgs.slice(half).reduce((a, b) => a + b, 0) / Math.max(1, avgs.length - half);
        const dropRate = secondAvg - firstAvg;
        const baselineDropRate = avgs[1] - avgs[0];
        const drying = evaluateDryingTrend(dropRate, baselineDropRate, nowIso);
        if (drying) result.push(drying);
      }
    }

    if (metric === 'soil_ec_us_cm' && analytics.aggregates.length >= 3) {
      const avgs = analytics.aggregates.map((p) => p.avg).filter((v): v is number => typeof v === 'number');
      if (avgs.length >= 3) {
        const baseline = avgs[0];
        const latest = avgs[avgs.length - 1];
        const relativeTrend = baseline !== 0 ? (latest - baseline) / Math.abs(baseline) : null;
        const ecAlert = evaluateEcTrendCaution(relativeTrend, nowIso);
        if (ecAlert) result.push(ecAlert);
      }
    }

    const seen = new Set<string>();
    return result.filter((alert) => {
      if (seen.has(alert.alert_id)) return false;
      seen.add(alert.alert_id);
      return true;
    });
  }, [analytics.aggregates, metric, node_id, reliabilityQuery.byNode.map, statusQuery.data?.latest_readings, to]);

  return {
    evaluations,
    alerts: evaluations,
    isLoading: analytics.isLoading || reliabilityQuery.isLoading || statusQuery.isLoading,
    isError: analytics.isError || reliabilityQuery.isError || statusQuery.isError,
    error: analytics.error ?? reliabilityQuery.error ?? statusQuery.error,
  };
}
