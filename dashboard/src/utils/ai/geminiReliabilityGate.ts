import type { AnalyticsSnapshot, ReliabilityScore } from '../../types/analytics';
import type { GeminiReportMode } from '../../types/gemini';

export type GeminiReliabilityMode = 'allowed' | 'caution' | 'blocked';

export type GeminiBlockedReason =
  | 'no_snapshot'
  | 'no_usable_readings'
  | 'insufficient_readings'
  | 'invalid_input';

export interface GeminiReliabilityGateResult {
  mode: GeminiReliabilityMode;
  report_mode: GeminiReportMode;
  reason: string;
  blocked_reason?: GeminiBlockedReason;
  limitations: string[];
  canGenerate: boolean;
  badgeLabel: string;
  severity: 'info' | 'warning' | 'error';
  valid_count: number;
  processed_count: number;
}

export const MIN_USABLE_READINGS_FOR_DEMO = 3;

function computeValidCount(snapshot: AnalyticsSnapshot): number {
  return snapshot.quality.valid_count ?? 0;
}

function computeProcessedCount(snapshot: AnalyticsSnapshot): number {
  return snapshot.quality.processed_count ?? 0;
}

export function evaluateGeminiReliabilityGate(snapshot: AnalyticsSnapshot | null): GeminiReliabilityGateResult {
  if (!snapshot) {
    return {
      mode: 'blocked',
      report_mode: 'standard',
      reason: 'No analytics snapshot is available for this context.',
      blocked_reason: 'no_snapshot',
      limitations: ['Gemini must not override deterministic alerts.'],
      canGenerate: false,
      badgeLabel: 'Blocked',
      severity: 'error',
      valid_count: 0,
      processed_count: 0,
    };
  }

  const validCount = computeValidCount(snapshot);
  const processedCount = computeProcessedCount(snapshot);

  if (validCount === 0) {
    return {
      mode: 'blocked',
      report_mode: 'standard',
      reason: 'No usable readings are available in this snapshot (valid_count = 0). AI interpretation is blocked.',
      blocked_reason: 'no_usable_readings',
      limitations: ['No valid readings — AI interpretation cannot proceed.', 'Gemini must not override deterministic alerts.'],
      canGenerate: false,
      badgeLabel: 'Blocked',
      severity: 'error',
      valid_count: validCount,
      processed_count: processedCount,
    };
  }

  if (validCount < MIN_USABLE_READINGS_FOR_DEMO) {
    return {
      mode: 'blocked',
      report_mode: 'standard',
      reason: `Only ${validCount} valid reading(s) available. At least ${MIN_USABLE_READINGS_FOR_DEMO} are required for any AI interpretation.`,
      blocked_reason: 'insufficient_readings',
      limitations: [
        `Insufficient valid readings (${validCount} < ${MIN_USABLE_READINGS_FOR_DEMO}).`,
        'Gemini must not override deterministic alerts.',
      ],
      canGenerate: false,
      badgeLabel: 'Blocked',
      severity: 'error',
      valid_count: validCount,
      processed_count: processedCount,
    };
  }

  const reliabilityLevel: ReliabilityScore['level'] = snapshot.quality.reliability_level ?? 'invalid';
  const limitations: string[] = [];

  const missingRate = snapshot.quality.missing_rate
    ?? (typeof snapshot.quality.expected_count === 'number' && snapshot.quality.expected_count > 0
      ? snapshot.quality.missing_count / snapshot.quality.expected_count
      : undefined);
  if (typeof missingRate === 'number' && missingRate >= 0.2) {
    limitations.push(`Within the telemetry coverage window, missing telemetry is approximately ${Math.round(missingRate * 100)}%. Interpretation quality is limited.`);
  }

  if (snapshot.quality.qc_flag_count > 0) {
    limitations.push('QC flags are present; interpretation must preserve uncertainty.');
  }

  const reliabilityScore = snapshot.quality.reliability_score;
  if (typeof reliabilityScore === 'number' && reliabilityScore < 0.6) {
    limitations.push('Low reliability score prevents strong agronomic conclusions.');
  }

  limitations.push('Gemini must not override deterministic alerts.');

  // valid_count >= 3: determine mode based on reliability
  if (reliabilityLevel === 'invalid' || reliabilityLevel === 'low') {
    limitations.push(`Small dataset demo mode: ${validCount} valid reading(s). Interpretation is exploratory only.`);
    return {
      mode: 'caution',
      report_mode: 'small_dataset_demo',
      reason: `AI interpretation allowed in small dataset demo mode (${validCount} valid readings, reliability: ${reliabilityLevel}). Report is exploratory and not suitable for final agronomic decisions.`,
      limitations,
      canGenerate: true,
      badgeLabel: 'Demo Mode',
      severity: 'warning',
      valid_count: validCount,
      processed_count: processedCount,
    };
  }

  if (reliabilityLevel === 'medium') {
    return {
      mode: 'caution',
      report_mode: 'standard',
      reason: 'AI interpretation is allowed with caution because reliability is medium.',
      limitations,
      canGenerate: true,
      badgeLabel: 'Caution',
      severity: 'warning',
      valid_count: validCount,
      processed_count: processedCount,
    };
  }

  return {
    mode: 'allowed',
    report_mode: 'standard',
    reason: 'AI interpretation is allowed for this snapshot.',
    limitations,
    canGenerate: true,
    badgeLabel: 'Allowed',
    severity: 'info',
    valid_count: validCount,
    processed_count: processedCount,
  };
}


export function evaluateGeminiMultiSnapshotReliabilityGate(snapshots: Array<AnalyticsSnapshot | null>): GeminiReliabilityGateResult {
  const limitations: string[] = [];
  const validSnapshots = snapshots.filter((snapshot): snapshot is AnalyticsSnapshot => Boolean(snapshot));

  if (!validSnapshots.length) {
    return {
      mode: 'blocked',
      report_mode: 'standard',
      reason: 'No analytics snapshots are available for this context.',
      blocked_reason: 'no_snapshot',
      limitations: ['Missing required snapshots for comparison.', 'Gemini must not override deterministic alerts.'],
      canGenerate: false,
      badgeLabel: 'Blocked',
      severity: 'error',
      valid_count: 0,
      processed_count: 0,
    };
  }

  // Compute per-snapshot valid counts
  const snapshotCounts = validSnapshots.map((s) => ({
    node_id: s.identity.node_id ?? 'unknown',
    valid_count: computeValidCount(s),
    processed_count: computeProcessedCount(s),
  }));

  const totalValidCount = snapshotCounts.reduce((sum, s) => sum + s.valid_count, 0);
  const totalProcessedCount = snapshotCounts.reduce((sum, s) => sum + s.processed_count, 0);

  // All valid_count = 0 → blocked
  const allEmpty = snapshotCounts.every((s) => s.valid_count === 0);
  if (allEmpty) {
    return {
      mode: 'blocked',
      report_mode: 'standard',
      reason: 'All available snapshots have zero valid readings. AI interpretation is blocked.',
      blocked_reason: 'no_usable_readings',
      limitations: ['No valid readings in any snapshot.', 'Gemini must not override deterministic alerts.'],
      canGenerate: false,
      badgeLabel: 'Blocked',
      severity: 'error',
      valid_count: 0,
      processed_count: totalProcessedCount,
    };
  }

  // At least one snapshot with valid_count >= MIN_USABLE_READINGS_FOR_DEMO → allow
  const usableSnapshots = snapshotCounts.filter((s) => s.valid_count >= MIN_USABLE_READINGS_FOR_DEMO);
  if (!usableSnapshots.length) {
    return {
      mode: 'blocked',
      report_mode: 'standard',
      reason: `No snapshot has enough valid readings (minimum ${MIN_USABLE_READINGS_FOR_DEMO}). AI interpretation is blocked.`,
      blocked_reason: 'insufficient_readings',
      limitations: [
        `Insufficient valid readings across all snapshots (threshold: ${MIN_USABLE_READINGS_FOR_DEMO}).`,
        'Gemini must not override deterministic alerts.',
      ],
      canGenerate: false,
      badgeLabel: 'Blocked',
      severity: 'error',
      valid_count: totalValidCount,
      processed_count: totalProcessedCount,
    };
  }

  // Build per-snapshot limitations
  let hasMediumOrLow = false;
  let hasInvalidReliability = false;

  snapshots.forEach((snapshot, index) => {
    if (!snapshot) {
      limitations.push(`Snapshot ${index + 1} is missing.`);
      return;
    }

    const level = snapshot.quality.reliability_level ?? 'invalid';
    const vc = computeValidCount(snapshot);

    if (level === 'invalid') {
      hasInvalidReliability = true;
      limitations.push(`${snapshot.identity.node_id ?? `Snapshot ${index + 1}`} has invalid reliability (${vc} valid readings).`);
    } else if (level === 'low' || level === 'medium') {
      hasMediumOrLow = true;
    }

    const snapshotMissingRate = snapshot.quality.missing_rate
      ?? (typeof snapshot.quality.expected_count === 'number' && snapshot.quality.expected_count > 0
        ? snapshot.quality.missing_count / snapshot.quality.expected_count
        : undefined);
    if (typeof snapshotMissingRate === 'number' && snapshotMissingRate >= 0.2) {
      limitations.push(`${snapshot.identity.node_id ?? `Snapshot ${index + 1}`}: within telemetry coverage window, approximately ${Math.round(snapshotMissingRate * 100)}% missing telemetry.`);
    }

    if (snapshot.quality.qc_flag_count > 0) limitations.push(`${snapshot.identity.node_id ?? `Snapshot ${index + 1}`} has QC flags.`);
    if (typeof snapshot.quality.reliability_score === 'number' && snapshot.quality.reliability_score < 0.6) {
      limitations.push(`${snapshot.identity.node_id ?? `Snapshot ${index + 1}`} has a low reliability score.`);
    }
  });

  const missingSnapshotCount = snapshots.length - validSnapshots.length;
  if (missingSnapshotCount > 0) {
    limitations.push(`${missingSnapshotCount} snapshot(s) missing — comparison is partial.`);
  }

  limitations.push('Gemini must not override deterministic alerts.');
  const uniqueLimitations = [...new Set(limitations)];

  // Determine report mode: small_dataset_demo if any snapshot has invalid/low reliability
  const reportMode: GeminiReportMode = (hasInvalidReliability || hasMediumOrLow) ? 'small_dataset_demo' : 'standard';

  if (missingSnapshotCount > 0 || hasInvalidReliability) {
    const label = reportMode === 'small_dataset_demo' ? 'Demo Mode' : 'Caution';
    return {
      mode: 'caution',
      report_mode: reportMode,
      reason: hasInvalidReliability
        ? 'AI interpretation allowed with caution. Some snapshots have invalid reliability but usable readings exist — partial comparison only.'
        : 'AI interpretation allowed with caution because one or more required snapshots are missing.',
      limitations: uniqueLimitations,
      canGenerate: true,
      badgeLabel: label,
      severity: 'warning',
      valid_count: totalValidCount,
      processed_count: totalProcessedCount,
    };
  }

  return {
    mode: hasMediumOrLow ? 'caution' : 'allowed',
    report_mode: reportMode,
    reason: hasMediumOrLow
      ? 'AI interpretation is allowed with caution because at least one required snapshot has medium/low reliability.'
      : 'AI interpretation is allowed because all required snapshots have high reliability.',
    limitations: uniqueLimitations,
    canGenerate: true,
    badgeLabel: hasMediumOrLow ? 'Caution' : 'Allowed',
    severity: hasMediumOrLow ? 'warning' : 'info',
    valid_count: totalValidCount,
    processed_count: totalProcessedCount,
  };
}
