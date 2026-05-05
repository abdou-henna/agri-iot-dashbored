import { useMemo } from 'react';
import type { NodeId } from '../types/common';
import type { NodeEvent, QcFlag, ReliabilityScore } from '../types/analytics';
import { useEvents } from './useEvents';
import { useNodes } from './useNodes';
import { useReadings } from './useReadings';
import { useStatus } from './useStatus';
import { calculateMissingPercentage, cleanReadings, detectFlatline, detectSpikeOrStep, physicalRangeFlags } from '../utils/analytics';
import { computeNodeReliabilityScore } from '../utils/analytics/reliability';

const NODE_IDS: NodeId[] = ['MAIN', 'N2', 'N3'];

const SPIKE_THRESHOLDS = {
  MAIN: 12,
  N2: 12,
  N3: 12,
} as const;

export interface ReliabilityScoreEntry extends ReliabilityScore {
  node_id: NodeId;
  inputsSummary: {
    missingPct: number;
    qcFlagCount: number;
    systemEventCount: number;
    avgRssi: number | null;
    avgSnr: number | null;
  };
}

interface UseReliabilityScoresParams {
  from: string;
  to: string;
}

export function useReliabilityScores({ from, to }: UseReliabilityScoresParams) {
  const readingsQuery = useReadings({ from, to, limit: 5000 });
  const eventsQuery = useEvents({ from, to, limit: 5000 });
  const nodesQuery = useNodes();
  const statusQuery = useStatus();

  const scores = useMemo<ReliabilityScoreEntry[]>(() => {
    const readings = readingsQuery.data?.readings ?? [];
    const events = eventsQuery.data?.events ?? [];

    const eventsInWindow = events.filter((event) => {
      const t = Date.parse(event.event_time);
      return !Number.isNaN(t) && t >= Date.parse(from) && t <= Date.parse(to);
    });

    return NODE_IDS.map((nodeId) => {
      const nodeReadings = cleanReadings(readings.filter((reading) => reading.node_id === nodeId), new Date().toISOString());
      const nodeEvents: NodeEvent[] = eventsInWindow
        .filter((event) => event.node_id === nodeId)
        .map((event) => ({ node_id: nodeId, severity: event.severity, event_time: event.event_time }));

      const qcFlags: QcFlag[] = [
        ...physicalRangeFlags(nodeReadings, nodeId === 'N3' ? 'air_temperature_c' : 'soil_moisture_percent'),
        ...detectFlatline(nodeReadings, nodeId === 'N3' ? 'air_temperature_c' : 'soil_moisture_percent'),
        ...detectSpikeOrStep(nodeReadings, nodeId === 'N3' ? 'air_temperature_c' : 'soil_moisture_percent', SPIKE_THRESHOLDS[nodeId]),
      ];

      const durationMs = Math.max(0, Date.parse(to) - Date.parse(from));
      const expectedCount = Math.floor(durationMs / (10 * 60 * 1000));
      const validCount = nodeReadings.filter((reading) => (nodeId === 'N3' ? reading.air_temperature_c : reading.soil_moisture_percent) != null).length;
      const missingPct = calculateMissingPercentage(expectedCount, validCount);

      const latestStatus = statusQuery.data?.latest_readings.find((item) => item.node_id === nodeId);
      const avgRssi = latestStatus?.rssi ?? null;
      const avgSnr = latestStatus?.snr ?? null;

      const score = computeNodeReliabilityScore({ missingPct, qcFlags, systemEvents: nodeEvents, avgRssi, avgSnr });
      return {
        node_id: nodeId,
        ...score,
        inputsSummary: {
          missingPct,
          qcFlagCount: qcFlags.length,
          systemEventCount: nodeEvents.length,
          avgRssi,
          avgSnr,
        },
      };
    });
  }, [eventsQuery.data?.events, from, readingsQuery.data?.readings, statusQuery.data?.latest_readings, to]);

  const byNode = useMemo(() => ({ map: new Map<NodeId, ReliabilityScoreEntry>(scores.map((entry) => [entry.node_id, entry])) }), [scores]);

  return {
    scores,
    byNode,
    isLoading: readingsQuery.isLoading || eventsQuery.isLoading || nodesQuery.isLoading || statusQuery.isLoading,
    isError: readingsQuery.isError || eventsQuery.isError || nodesQuery.isError || statusQuery.isError,
    error: readingsQuery.error ?? eventsQuery.error ?? nodesQuery.error ?? statusQuery.error,
  };
}
