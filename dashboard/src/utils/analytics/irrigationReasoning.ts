import type { IrrigationResponseReasoning } from '../../types/agronomicIntelligence';
import type { AgronomicEvent } from '../../types/agronomy';
import type { SensorReading } from '../../types/readings';
import type { NodeId } from '../../types/common';

const PRE_WINDOW_MINUTES = 60;
const POST_WINDOW_MINUTES = 120;
const MIN_SAMPLES = 2;
const RESPONSE_THRESHOLD_PP = 0.5;

const median = (values: number[]): number | null => {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
};

export function buildIrrigationResponseReasoning(inputs: { readings: SensorReading[]; events: AgronomicEvent[]; pivotIds: NodeId[]; calibrationPresent: boolean }): IrrigationResponseReasoning {
  const limitations: string[] = [];
  const irrigation = inputs.events.filter((e) => e.event_category === 'irrigation' && e.ended_at).sort((a, b) => +new Date(b.started_at) - +new Date(a.started_at))[0];
  if (!irrigation?.ended_at) return { event_window: { started_at: null, ended_at: null }, moisture_delta_by_pivot: [], response_lag_minutes: null, response_flag: 'insufficient_data', confidence: { score: null, level: 'low' }, limitations: ['No completed irrigation session available.'] };
  if (!inputs.calibrationPresent) limitations.push('Calibration metadata unavailable; no calibrated water-stress claims are made.');
  if (irrigation.confidence !== 'exact') limitations.push('Irrigation timing confidence is estimated/unknown; causal interpretation is limited.');

  const startMs = Date.parse(irrigation.started_at);
  const endMs = Date.parse(irrigation.ended_at);
  const lags: number[] = [];

  const byPivot = inputs.pivotIds.map((node_id) => {
    const nodeReadings = inputs.readings
      .filter((r) => r.node_id === node_id && typeof r.soil_moisture_percent === 'number')
      .sort((a, b) => Date.parse(a.measured_at) - Date.parse(b.measured_at));
    const pre = nodeReadings.filter((r) => {
      const t = Date.parse(r.measured_at);
      return t >= startMs - PRE_WINDOW_MINUTES * 60000 && t <= startMs;
    });
    const post = nodeReadings.filter((r) => {
      const t = Date.parse(r.measured_at);
      return t >= endMs && t <= endMs + POST_WINDOW_MINUTES * 60000;
    });
    const preVals = pre.map((r) => r.soil_moisture_percent as number);
    const postVals = post.map((r) => r.soil_moisture_percent as number);
    const preMedian = preVals.length >= MIN_SAMPLES ? median(preVals) : null;
    const postMedian = postVals.length >= MIN_SAMPLES ? median(postVals) : null;
    const delta = preMedian != null && postMedian != null ? postMedian - preMedian : null;

    let lagMinutes: number | null = null;
    if (preMedian != null) {
      const firstResponse = nodeReadings.find((r) => Date.parse(r.measured_at) >= endMs && (r.soil_moisture_percent as number) >= preMedian + RESPONSE_THRESHOLD_PP);
      if (firstResponse) {
        lagMinutes = Math.max(0, Math.round((Date.parse(firstResponse.measured_at) - endMs) / 60000));
        lags.push(lagMinutes);
      } else {
        limitations.push(`${node_id}: no post-irrigation moisture rise >= ${RESPONSE_THRESHOLD_PP}pp was observed for lag estimation.`);
      }
    }

    if (preVals.length < MIN_SAMPLES || postVals.length < MIN_SAMPLES) limitations.push(`${node_id}: insufficient samples in pre/post windows for deterministic irrigation response.`);
    return { node_id, pre_moisture_percent: preMedian, post_moisture_percent: postMedian, delta_percent: delta, pre_sample_count: preVals.length, post_sample_count: postVals.length, response_lag_minutes: lagMinutes };
  });

  const validDeltas = byPivot.map((p) => p.delta_percent).filter((v): v is number => typeof v === 'number');
  const avgDelta = validDeltas.length ? validDeltas.reduce((a, b) => a + b, 0) / validDeltas.length : null;
  const responseFlag = avgDelta == null ? 'insufficient_data' : avgDelta <= RESPONSE_THRESHOLD_PP ? 'weak_or_no_response' : 'positive_response';
  const responseLag = median(lags);
  if (responseLag == null) limitations.push('Overall irrigation response lag is unavailable due to missing valid per-pivot lag signals.');

  const lowSample = byPivot.some((p) => p.pre_sample_count < MIN_SAMPLES || p.post_sample_count < MIN_SAMPLES);
  const score = responseFlag === 'insufficient_data' ? 0.3 : lowSample || irrigation.confidence !== 'exact' ? 0.5 : 0.75;
  return { event_window: { started_at: irrigation.started_at, ended_at: irrigation.ended_at }, moisture_delta_by_pivot: byPivot, response_lag_minutes: responseLag, response_flag: responseFlag, confidence: { score, level: score >= 0.75 ? 'medium' : 'low' }, limitations };
}
