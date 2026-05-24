import type { AnalyticsSnapshot } from '../../types/analytics';
import type { GeminiReliabilityGateResult } from '../../utils/ai/geminiReliabilityGate';
import { MIN_USABLE_READINGS_FOR_DEMO } from '../../utils/ai/geminiReliabilityGate';

interface GeminiReliabilityGateProps {
  gate: GeminiReliabilityGateResult;
  snapshot: AnalyticsSnapshot | null;
}

const toneClasses: Record<GeminiReliabilityGateResult['mode'], string> = {
  allowed: 'border-sky-200 bg-sky-50 text-sky-900',
  caution: 'border-amber-200 bg-amber-50 text-amber-900',
  blocked: 'border-zinc-300 bg-zinc-100 text-zinc-800 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200',
};

const blockedReasonLabel: Record<string, string> = {
  no_snapshot: 'No snapshot available',
  no_usable_readings: 'No usable readings (valid_count = 0)',
  insufficient_readings: `Fewer than ${MIN_USABLE_READINGS_FOR_DEMO} valid readings`,
  invalid_input: 'Invalid input',
};

export function GeminiReliabilityGate({ gate, snapshot }: GeminiReliabilityGateProps) {
  const expectedCount = snapshot?.quality.expected_count;
  const missingCount = snapshot?.quality.missing_count;
  const validCount = gate.valid_count;
  const processedCount = gate.processed_count;

  return (
    <div className={`mb-4 rounded-md border p-3 text-sm ${toneClasses[gate.mode]}`}>
      <div className="mb-2 flex items-center gap-2">
        <span className="rounded-full border border-current/25 px-2 py-0.5 text-xs font-semibold">{gate.badgeLabel}</span>
        <span className="text-xs">Reliability gate</span>
        {gate.mode === 'caution' && (
          <span className="text-xs opacity-75">— informational, generation is allowed</span>
        )}
      </div>
      <p className="mb-2">{gate.reason}</p>
      {gate.blocked_reason ? (
        <p className="mb-2 text-xs font-medium">Blocked reason: {blockedReasonLabel[gate.blocked_reason] ?? gate.blocked_reason}</p>
      ) : null}
      <ul className="mb-2 list-disc space-y-1 pl-5">
        {gate.limitations.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="rounded-full bg-white/70 px-2 py-1">Valid readings: {validCount}</span>
        <span className="rounded-full bg-white/70 px-2 py-1">Processed readings: {processedCount}</span>
        <span className="rounded-full bg-white/70 px-2 py-1">Reliability level: {snapshot?.quality.reliability_level ?? 'invalid'}</span>
        <span className="rounded-full bg-white/70 px-2 py-1">Reliability score: {snapshot?.quality.reliability_score ?? 'n/a'}</span>
        {typeof expectedCount === 'number' ? <span className="rounded-full bg-white/70 px-2 py-1">Missing: {missingCount}/{expectedCount}</span> : null}
        {typeof snapshot?.quality.qc_flag_count === 'number' ? <span className="rounded-full bg-white/70 px-2 py-1">QC flags: {snapshot.quality.qc_flag_count}</span> : null}
      </div>
    </div>
  );
}
