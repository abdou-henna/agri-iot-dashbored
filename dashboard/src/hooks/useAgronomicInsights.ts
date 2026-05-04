import { useMemo } from 'react';
import { useAgronomicEvents } from './useAgronomicEvents';
import { useReadings } from './useReadings';
import type { AgronomicEvent } from '../types/agronomy';
import type { SensorReading } from '../types/readings';

type SoilNode = 'MAIN' | 'N2';

interface IrrigationMoistureMatch {
  agro_event_id: string;
  node_id: SoilNode;
  started_at: string;
  ended_at: string;
  before: { measured_at: string; value: number } | null;
  after: { measured_at: string; value: number } | null;
  delta: number | null;
  status: 'ok' | 'not_enough_data';
}

function nearestReading(readings: SensorReading[], targetIso: string, direction: 'before' | 'after', maxMinutes: number) {
  const target = new Date(targetIso).getTime();
  const maxMs = maxMinutes * 60_000;
  let best: SensorReading | null = null;
  let bestDiff = Number.POSITIVE_INFINITY;

  for (const reading of readings) {
    if (typeof reading.soil_moisture_percent !== 'number') continue;
    const measured = new Date(reading.measured_at).getTime();
    const diff = measured - target;
    const inDirection = direction === 'before' ? diff <= 0 : diff >= 0;
    if (!inDirection) continue;
    const absDiff = Math.abs(diff);
    if (absDiff > maxMs) continue;
    if (absDiff < bestDiff) {
      best = reading;
      bestDiff = absDiff;
    }
  }

  return best;
}

function getCuttingReference(details: Record<string, unknown> | null | undefined) {
  if (!details) return null;
  const ref = details.cutting_event_id;
  return typeof ref === 'string' && ref.trim() ? ref : null;
}

export function useAgronomicInsights() {
  const readingsQuery = useReadings({ limit: 1000 });
  const agronomyQuery = useAgronomicEvents({ limit: 1000 });

  const data = useMemo(() => {
    const readings = readingsQuery.data?.readings ?? [];
    const events = agronomyQuery.data?.events ?? [];

    const completedIrrigation = events.filter(
      (event) => event.event_category === 'irrigation' && event.event_type === 'irrigation_session' && Boolean(event.ended_at),
    ) as Array<AgronomicEvent & { ended_at: string }>;

    const mainReadings = readings.filter((r) => r.node_id === 'MAIN');
    const n2Readings = readings.filter((r) => r.node_id === 'N2');

    const irrigationMoisture: IrrigationMoistureMatch[] = completedIrrigation.flatMap((session) => {
      return (['MAIN', 'N2'] as SoilNode[]).map((nodeId) => {
        const nodeReadings = nodeId === 'MAIN' ? mainReadings : n2Readings;
        const before = nearestReading(nodeReadings, session.started_at, 'before', 60);
        const after = nearestReading(nodeReadings, session.ended_at, 'after', 120);
        const beforeValue = before?.soil_moisture_percent;
        const afterValue = after?.soil_moisture_percent;

        if (typeof beforeValue !== 'number' || typeof afterValue !== 'number') {
          return {
            agro_event_id: session.agro_event_id,
            node_id: nodeId,
            started_at: session.started_at,
            ended_at: session.ended_at,
            before: before ? { measured_at: before.measured_at, value: beforeValue ?? 0 } : null,
            after: after ? { measured_at: after.measured_at, value: afterValue ?? 0 } : null,
            delta: null,
            status: 'not_enough_data' as const,
          };
        }

        return {
          agro_event_id: session.agro_event_id,
          node_id: nodeId,
          started_at: session.started_at,
          ended_at: session.ended_at,
          before: { measured_at: before!.measured_at, value: beforeValue },
          after: { measured_at: after!.measured_at, value: afterValue },
          delta: afterValue - beforeValue,
          status: 'ok' as const,
        };
      });
    });

    const cuttingEvents = events.filter((event) => event.event_category === 'cutting');
    const yieldRecords = events.filter((event) => event.event_category === 'yield');

    const yieldsWithLinks = yieldRecords.map((record) => {
      const cuttingId = getCuttingReference(record.details);
      return {
        record,
        cutting_event_id: cuttingId,
        linked: Boolean(cuttingId),
      };
    });

    const reliability = {
      missingN2Readings: readings.filter((r) => r.node_id === 'N2' && r.status === 'missing').length,
      missingN3Readings: readings.filter((r) => r.node_id === 'N3' && r.status === 'missing').length,
      sensorErrorRecords: readings.filter((r) => r.status === 'error').length,
    };

    return { irrigationMoisture, cuttingEvents, yieldsWithLinks, reliability };
  }, [agronomyQuery.data?.events, readingsQuery.data?.readings]);

  return {
    ...data,
    isLoading: readingsQuery.isLoading || agronomyQuery.isLoading,
    isError: readingsQuery.isError || agronomyQuery.isError,
    error: readingsQuery.error ?? agronomyQuery.error,
    refetch: async () => {
      await Promise.all([readingsQuery.refetch(), agronomyQuery.refetch()]);
    },
  };
}
