import type { EventSeverity } from '../../types/common';
import type { ProcessedDataReliability, ProcessedDataStatus } from '../../types/processedDataViewer';

export function StatusBadge({ status }: { status: ProcessedDataStatus }) {
  return <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700">{status}</span>;
}

export function ReliabilityBadge({ reliability }: { reliability: ProcessedDataReliability }) {
  return <span className="rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-700">{reliability.level} {reliability.score == null ? '' : `(${reliability.score.toFixed(2)})`}</span>;
}

export function QcFlagBadge({ code, severity }: { code: string; severity: EventSeverity }) {
  return <span className="rounded-full bg-amber-50 px-2 py-1 text-xs text-amber-800">{code} ({severity})</span>;
}

export function AlertSeverityBadge({ severity }: { severity: EventSeverity }) {
  return <span className="rounded-full bg-rose-50 px-2 py-1 text-xs text-rose-700">{severity}</span>;
}
