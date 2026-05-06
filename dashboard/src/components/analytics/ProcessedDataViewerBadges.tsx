import { Badge } from '../ui';
import type { EventSeverity } from '../../types/common';
import type { ProcessedDataReliability, ProcessedDataStatus } from '../../types/processedDataViewer';

export function StatusBadge({ status }: { status: ProcessedDataStatus }) {
  return <Badge variant="default">{status}</Badge>;
}

export function ReliabilityBadge({ reliability }: { reliability: ProcessedDataReliability }) {
  return <Badge variant="info">{reliability.level} {reliability.score == null ? '' : `(${reliability.score.toFixed(2)})`}</Badge>;
}

export function QcFlagBadge({ code, severity }: { code: string; severity: EventSeverity }) {
  return <Badge variant="warning">{code} ({severity})</Badge>;
}

export function AlertSeverityBadge({ severity }: { severity: EventSeverity }) {
  return <Badge variant="danger">{severity}</Badge>;
}
