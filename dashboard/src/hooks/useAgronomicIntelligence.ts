import { useMemo } from 'react';
import { rangeForPreset } from '../utils/time';
import { useAgronomicEvents } from './useAgronomicEvents';
import { useReadings } from './useReadings';
import { useReliabilityScores } from './useReliabilityScores';
import type { AgronomicIntelligenceOutput } from '../types/agronomicIntelligence';
import { buildFarmStateSummary } from '../utils/analytics/agronomicState';
import { buildIrrigationResponseReasoning } from '../utils/analytics/irrigationReasoning';
import { buildCuttingRegrowthReasoning } from '../utils/analytics/cuttingRegrowthReasoning';
import { buildFertilizationContext } from '../utils/analytics/fertilizationContext';
import { buildPivotIntelligence } from '../utils/analytics/pivotIntelligence';

export function useAgronomicIntelligence() {
  const readingsQuery = useReadings({ limit: 1000 });
  const eventsQuery = useAgronomicEvents({ limit: 1000 });
  const range = rangeForPreset('30d');
  const reliabilityQuery = useReliabilityScores({ from: range.from, to: range.to });

  const intelligence = useMemo<AgronomicIntelligenceOutput>(() => {
    const readings = readingsQuery.data?.readings ?? [];
    const events = eventsQuery.data?.events ?? [];
    const reliability = reliabilityQuery.byNode.map.get('MAIN') ?? null;
    const farm_state = buildFarmStateSummary({ readings, events, reliability });
    const irrigation_reasoning = buildIrrigationResponseReasoning({ readings, events, pivotIds: ['MAIN', 'N2'], calibrationPresent: false });
    const cutting_regrowth_context = buildCuttingRegrowthReasoning({ readings, events });
    const fertilization_context = buildFertilizationContext({ readings, events });
    const pivot_intelligence = buildPivotIntelligence({ readings, pivots: ['MAIN', 'N2'], reliabilityScore: reliability?.score ?? null });

    return {
      farm_state,
      irrigation_reasoning,
      cutting_regrowth_context,
      fertilization_context,
      pivot_intelligence,
      predictive_risk_context: { status: 'deferred', limitations: ['Predictive risk model is not implemented in this phase.'] },
      reliability: farm_state.overall_reliability,
      deterministic_alerts: [],
      forbidden_claims: ['No disease diagnosis.', 'No nutrient diagnosis.', 'No ET calculation.', 'No yield prediction.'],
      limitations: [...farm_state.limitations, ...irrigation_reasoning.limitations, ...cutting_regrowth_context.limitations, ...fertilization_context.limitations, ...pivot_intelligence.limitations],
    };
  }, [eventsQuery.data?.events, readingsQuery.data?.readings, reliabilityQuery.byNode.map]);

  return { agronomicIntelligence: intelligence, isLoading: readingsQuery.isLoading || eventsQuery.isLoading || reliabilityQuery.isLoading, isError: readingsQuery.isError || eventsQuery.isError || reliabilityQuery.isError, error: readingsQuery.error ?? eventsQuery.error ?? reliabilityQuery.error };
}
