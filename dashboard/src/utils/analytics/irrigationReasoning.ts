import type { IrrigationResponseReasoning } from '../../types/agronomicIntelligence';
import type { AgronomicEvent } from '../../types/agronomy';
import type { SensorReading } from '../../types/readings';
import type { NodeId } from '../../types/common';

export function buildIrrigationResponseReasoning(inputs: { readings: SensorReading[]; events: AgronomicEvent[]; pivotIds: NodeId[]; calibrationPresent: boolean }): IrrigationResponseReasoning {
  const limitations: string[] = [];
  const irrigation = inputs.events.filter((e) => e.event_category === 'irrigation' && e.ended_at).sort((a, b) => +new Date(b.started_at) - +new Date(a.started_at))[0];
  if (!irrigation?.ended_at) {
    return { event_window: { started_at: null, ended_at: null }, moisture_delta_by_pivot: [], response_lag_minutes: null, response_flag: 'insufficient_data', confidence: { score: null, level: 'low' }, limitations: ['No completed irrigation session available.'] };
  }
  if (!inputs.calibrationPresent) limitations.push('Calibration metadata unavailable; no calibrated water-stress claims are made.');
  if (irrigation.confidence !== 'exact') limitations.push('Irrigation timing confidence is estimated/unknown; causal interpretation is limited.');

  const byPivot = inputs.pivotIds.map((node_id) => {
    const before = inputs.readings.filter((r) => r.node_id === node_id && +new Date(r.measured_at) <= +new Date(irrigation.started_at) && r.soil_moisture_percent != null).sort((a, b) => +new Date(b.measured_at) - +new Date(a.measured_at))[0];
    const after = inputs.readings.filter((r) => r.node_id === node_id && +new Date(r.measured_at) >= +new Date(irrigation.ended_at!) && r.soil_moisture_percent != null).sort((a, b) => +new Date(a.measured_at) - +new Date(b.measured_at))[0];
    const delta = typeof before?.soil_moisture_percent === 'number' && typeof after?.soil_moisture_percent === 'number' ? after.soil_moisture_percent - before.soil_moisture_percent : null;
    return { node_id, pre_moisture_percent: before?.soil_moisture_percent ?? null, post_moisture_percent: after?.soil_moisture_percent ?? null, delta_percent: delta };
  });

  const avgDelta = byPivot.filter((p) => p.delta_percent != null).reduce((s, p, _, arr) => s + (p.delta_percent ?? 0) / arr.length, 0);
  const responseFlag = byPivot.every((p) => p.delta_percent == null) ? 'insufficient_data' : avgDelta <= 0.5 ? 'weak_or_no_response' : 'positive_response';
  return { event_window: { started_at: irrigation.started_at, ended_at: irrigation.ended_at }, moisture_delta_by_pivot: byPivot, response_lag_minutes: null, response_flag: responseFlag, confidence: { score: responseFlag === 'insufficient_data' ? 0.3 : 0.7, level: responseFlag === 'insufficient_data' ? 'low' : 'medium' }, limitations };
}
