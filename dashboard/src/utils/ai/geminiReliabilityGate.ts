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
