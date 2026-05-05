import type { AnalyticsSnapshot, ReliabilityScore } from '../../types/analytics';

export type GeminiReliabilityMode = 'allowed' | 'caution' | 'blocked';

export interface GeminiReliabilityGateResult {
  mode: GeminiReliabilityMode;
  reason: string;
  limitations: string[];
  canGenerate: boolean;
  badgeLabel: string;
  severity: 'info' | 'warning' | 'error';
}

function mapMode(level: ReliabilityScore['level'] | undefined): Omit<GeminiReliabilityGateResult, 'limitations'> {
  if (level === 'high') {
    return {
      mode: 'allowed',
      reason: 'AI interpretation is allowed for this snapshot.',
      canGenerate: true,
      badgeLabel: 'Allowed',
      severity: 'info',
    };
  }
  if (level === 'medium') {
    return {
      mode: 'caution',
      reason: 'AI interpretation is allowed with caution because reliability is medium.',
      canGenerate: true,
      badgeLabel: 'Caution',
      severity: 'warning',
    };
  }
  if (level === 'low') {
    return {
      mode: 'caution',
      reason: 'AI interpretation is allowed with caution because snapshot reliability is low.',
      canGenerate: true,
      badgeLabel: 'Caution',
      severity: 'warning',
    };
  }

  return {
    mode: 'blocked',
    reason: 'AI interpretation is blocked because snapshot reliability is invalid.',
    canGenerate: false,
    badgeLabel: 'Blocked',
    severity: 'error',
  };
}

export function evaluateGeminiReliabilityGate(snapshot: AnalyticsSnapshot | null): GeminiReliabilityGateResult {
  if (!snapshot) {
    return {
      mode: 'blocked',
      reason: 'No analytics snapshot is available for this context.',
      limitations: ['Gemini must not override deterministic alerts.'],
      canGenerate: false,
      badgeLabel: 'Blocked',
      severity: 'error',
    };
  }

  const base = mapMode(snapshot.quality.reliability_level);
  const limitations: string[] = [];

  const expectedCount = snapshot.quality.expected_count;
  if (typeof expectedCount === 'number' && expectedCount > 0) {
    const missingRatio = snapshot.quality.missing_count / expectedCount;
    if (missingRatio >= 0.2) {
      limitations.push('High missing data limits interpretation quality.');
    }
  }

  if (snapshot.quality.qc_flag_count > 0) {
    limitations.push('QC flags are present; interpretation must preserve uncertainty.');
  }

  const reliabilityScore = snapshot.quality.reliability_score;
  if (typeof reliabilityScore === 'number' && reliabilityScore < 0.6) {
    limitations.push('Low reliability score prevents strong agronomic conclusions.');
  }

  limitations.push('Gemini must not override deterministic alerts.');

  return {
    ...base,
    limitations,
  };
}


export function evaluateGeminiMultiSnapshotReliabilityGate(snapshots: Array<AnalyticsSnapshot | null>): GeminiReliabilityGateResult {
  const limitations: string[] = [];
  const validSnapshots = snapshots.filter((snapshot): snapshot is AnalyticsSnapshot => Boolean(snapshot));

  if (!validSnapshots.length) {
    return {
      mode: 'blocked',
      reason: 'No valid analytics snapshots are available for this context.',
      limitations: ['Missing required snapshots for comparison.', 'Gemini must not override deterministic alerts.'],
      canGenerate: false,
      badgeLabel: 'Blocked',
      severity: 'error',
    };
  }

  const levels = validSnapshots.map((snapshot) => snapshot.quality.reliability_level ?? 'invalid');
  let hasInvalid = false;
  let hasMediumOrLow = false;

  snapshots.forEach((snapshot, index) => {
    if (!snapshot) {
      limitations.push(`Snapshot ${index + 1} is missing.`);
      return;
    }

    const level = snapshot.quality.reliability_level ?? 'invalid';
    const expectedCount = snapshot.quality.expected_count;

    if (level === 'invalid') {
      limitations.push(`${snapshot.identity.node_id ?? `Snapshot ${index + 1}`} has invalid reliability.`);
      hasInvalid = true;
    }

    if (level === 'medium' || level === 'low') hasMediumOrLow = true;

    if (typeof expectedCount === 'number' && expectedCount > 0) {
      const missingRatio = snapshot.quality.missing_count / expectedCount;
      if (missingRatio >= 0.2) limitations.push(`${snapshot.identity.node_id ?? `Snapshot ${index + 1}`} has high missing data.`);
    }

    if (snapshot.quality.qc_flag_count > 0) limitations.push(`${snapshot.identity.node_id ?? `Snapshot ${index + 1}`} has QC flags.`);
    if (typeof snapshot.quality.reliability_score === 'number' && snapshot.quality.reliability_score < 0.6) limitations.push(`${snapshot.identity.node_id ?? `Snapshot ${index + 1}`} has a low reliability score.`);
  });

  const missingCount = snapshots.length - validSnapshots.length;
  if (missingCount > 0) {
    limitations.push('Comparison limited because only one valid snapshot is available.');
    return {
      mode: hasInvalid ? 'blocked' : 'caution',
      reason: hasInvalid ? 'AI interpretation is blocked because one or more required snapshots are invalid.' : 'AI interpretation is allowed with caution because one required snapshot is missing.',
      limitations: [...new Set([...limitations, 'Gemini must not override deterministic alerts.'])],
      canGenerate: !hasInvalid,
      badgeLabel: hasInvalid ? 'Blocked' : 'Caution',
      severity: hasInvalid ? 'error' : 'warning',
    };
  }

  if (hasInvalid || levels.includes('invalid')) {
    return {
      mode: 'blocked',
      reason: 'AI interpretation is blocked because one or more required snapshots have invalid reliability.',
      limitations: [...new Set([...limitations, 'Gemini must not override deterministic alerts.'])],
      canGenerate: false,
      badgeLabel: 'Blocked',
      severity: 'error',
    };
  }

  return {
    mode: hasMediumOrLow ? 'caution' : 'allowed',
    reason: hasMediumOrLow
      ? 'AI interpretation is allowed with caution because at least one required snapshot has medium/low reliability.'
      : 'AI interpretation is allowed because all required snapshots have high reliability.',
    limitations: [...new Set([...limitations, 'Gemini must not override deterministic alerts.'])],
    canGenerate: true,
    badgeLabel: hasMediumOrLow ? 'Caution' : 'Allowed',
    severity: hasMediumOrLow ? 'warning' : 'info',
  };
}
