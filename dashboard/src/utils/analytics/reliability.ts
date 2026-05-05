import type { NodeEvent, QcFlag, ReliabilityScore } from '../../types/analytics';

export function computeNodeReliabilityScore(params: {
  missingPct: number;
  qcFlags: ReadonlyArray<QcFlag>;
  systemEvents: ReadonlyArray<NodeEvent>;
  avgRssi?: number | null;
  avgSnr?: number | null;
}): ReliabilityScore {
  let score = 1;
  const reasons: string[] = [];

  score -= Math.max(0, params.missingPct) * 0.45;
  if (params.missingPct > 0.15) reasons.push(`missing readings ${Math.round(params.missingPct * 100)}%`);

  const errorFlags = params.qcFlags.filter((f) => f.severity === 'error' || f.severity === 'critical').length;
  const warningFlags = params.qcFlags.filter((f) => f.severity === 'warning').length;
  score -= Math.min(0.3, errorFlags * 0.04 + warningFlags * 0.01);
  if (errorFlags > 0 || warningFlags > 0) reasons.push(`qc flags ${errorFlags} error, ${warningFlags} warning`);

  const eventPenalty = params.systemEvents.reduce((acc, ev) => {
    if (ev.severity === 'critical') return acc + 0.03;
    if (ev.severity === 'error') return acc + 0.02;
    if (ev.severity === 'warning') return acc + 0.01;
    return acc;
  }, 0);
  score -= Math.min(0.3, eventPenalty);

  if (params.avgRssi != null && params.avgRssi < -110) {
    score -= 0.08;
    reasons.push('weak RSSI');
  }
  if (params.avgSnr != null && params.avgSnr < 0) {
    score -= 0.05;
    reasons.push('low SNR');
  }

  score = Math.max(0, Math.min(1, score));
  const level = score >= 0.85 ? 'high' : score >= 0.6 ? 'medium' : score >= 0.3 ? 'low' : 'invalid';
  return { score, level, reasons };
}
