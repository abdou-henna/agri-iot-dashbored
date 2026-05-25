import { useMemo } from 'react';
import { useAgronomicEvents } from './useAgronomicEvents';
import { useReadings } from './useReadings';
import { useReliabilityScores } from './useReliabilityScores';
import { useAlertEvaluations } from './useAlertEvaluations';
import type { AgronomicIntelligenceOutput } from '../types/agronomicIntelligence';
import { buildFarmStateSummary } from '../utils/analytics/agronomicState';
import { buildIrrigationResponseReasoning } from '../utils/analytics/irrigationReasoning';
import { buildCuttingRegrowthReasoning } from '../utils/analytics/cuttingRegrowthReasoning';
import { buildFertilizationContext } from '../utils/analytics/fertilizationContext';
import { buildPivotIntelligence } from '../utils/analytics/pivotIntelligence';
import { buildManualAgronomicContext } from '../utils/analytics/manualAgronomicContext';

export const REPORT_READINGS_LIMIT = 10000;

const MAX_ALERT_RANGE_DAYS = 30;

interface UseAgronomicIntelligenceOptions {
  from?: string;
  to?: string;
  selectedWindow?: '7d' | '30d' | 'all';
  readingsLimit?: number;
}

export function useAgronomicIntelligence(options: UseAgronomicIntelligenceOptions = {}) {
  const { from, to, readingsLimit = 1000 } = options;

  // Reliability and alert queries hit the aggregate endpoint which has a 31-day hard cap.
  // Cap their range to at most MAX_ALERT_RANGE_DAYS regardless of the intelligence window.
  const cappedRange = useMemo(() => {
    const cappedTo = to ? new Date(to) : new Date();
    const cappedFrom = new Date(cappedTo);
    cappedFrom.setDate(cappedFrom.getDate() - MAX_ALERT_RANGE_DAYS);
    return { from: cappedFrom.toISOString(), to: cappedTo.toISOString() };
  }, [to]);

  const readingsQuery = useReadings({ limit: readingsLimit, from, to });
  const eventsQuery = useAgronomicEvents({ limit: 1000 });
  const reliabilityQuery = useReliabilityScores({ from: cappedRange.from, to: cappedRange.to });
  const mainAlerts = useAlertEvaluations({ node_id: 'MAIN', metric: 'soil_moisture_percent', from: cappedRange.from, to: cappedRange.to, bucket: '1hour' });

  const intelligence = useMemo<AgronomicIntelligenceOutput>(() => {
    const readings = readingsQuery.data?.readings ?? [];
    const events = eventsQuery.data?.events ?? [];
    const latestMeasuredAt = readings.slice().sort((a, b) => Date.parse(b.measured_at) - Date.parse(a.measured_at))[0]?.measured_at ?? null;
    const mainReliability = reliabilityQuery.byNode.map.get('MAIN') ?? null;
    const n2Reliability = reliabilityQuery.byNode.map.get('N2') ?? null;

    const windowEnd = latestMeasuredAt ?? cappedRange.to;
    const farm_state = buildFarmStateSummary({ readings, events, reliability: mainReliability, window_end: windowEnd });
    const irrigation_reasoning = buildIrrigationResponseReasoning({ readings, events, pivotIds: ['MAIN', 'N2'], calibrationPresent: false });
    const cutting_regrowth_context = buildCuttingRegrowthReasoning({ readings, events, reference_time: windowEnd });
    const fertilization_context = buildFertilizationContext({ readings, events });
    const pivot_intelligence = buildPivotIntelligence({ readings, pivots: ['MAIN', 'N2'], reliabilityByPivot: { MAIN: mainReliability?.score ?? null, N2: n2Reliability?.score ?? null } });
    const manual_context_summary = buildManualAgronomicContext(events);

    const deterministic_alerts = mainAlerts.evaluations.map((a) => ({ title: a.title, severity: a.severity, confidence: a.confidence, limitations: a.limitations }));
    const sharedLimitations = [...farm_state.limitations, ...irrigation_reasoning.limitations, ...cutting_regrowth_context.limitations, ...fertilization_context.limitations, ...pivot_intelligence.limitations];
    if (!n2Reliability) sharedLimitations.push('N2 reliability is unavailable; MAIN cannot be treated as full-farm proxy without limitation.');
    if ((mainReliability?.level === 'low' || mainReliability?.level === 'invalid') || (n2Reliability?.level === 'low' || n2Reliability?.level === 'invalid')) sharedLimitations.push('At least one pivot reliability score is low/invalid; overall agronomic confidence is capped below high.');

    const minScore = Math.min(mainReliability?.score ?? 0.5, n2Reliability?.score ?? 0.5);
    const combinedReliability = { score: minScore, level: minScore >= 0.75 ? 'high' : minScore >= 0.6 ? 'medium' : 'low' } as const;

    return { farm_state, irrigation_reasoning, cutting_regrowth_context, fertilization_context, pivot_intelligence, predictive_risk_context: { status: 'deferred', limitations: ['Predictive risk model is not implemented in this phase.'] }, reliability: combinedReliability, deterministic_alerts, forbidden_claims: ['No disease diagnosis.', 'No nutrient diagnosis.', 'No ET calculation.', 'No yield prediction.'], limitations: sharedLimitations, manual_context_summary };
  }, [cappedRange.to, eventsQuery.data?.events, mainAlerts.evaluations, readingsQuery.data?.readings, reliabilityQuery.byNode.map]);

  return {
    agronomicIntelligence: intelligence,
    isLoading: readingsQuery.isLoading || eventsQuery.isLoading || reliabilityQuery.isLoading || mainAlerts.isLoading,
    isError: readingsQuery.isError || eventsQuery.isError || reliabilityQuery.isError || mainAlerts.isError,
    error: readingsQuery.error ?? eventsQuery.error ?? reliabilityQuery.error ?? mainAlerts.error,
  };
}
