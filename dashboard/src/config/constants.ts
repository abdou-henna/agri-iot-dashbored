export const FARM_TIMEZONE = 'Africa/Algiers';
export const DEFAULT_GATEWAY_ID = 'GW01';

export const NODE_LABELS = {
  MAIN: 'Pivot 1',
  N2: 'Pivot 2',
  N3: 'Weather',
} as const;

export const NODE_DESCRIPTIONS = {
  MAIN: 'Local soil',
  N2: 'Remote soil',
  N3: 'Shared weather',
} as const;

export const COLORS = {
  pivot1: '#2563EB',
  pivot2: '#16A34A',
  weather: '#D97706',
  error: '#DC2626',
  missing: '#9CA3AF',
  warning: '#EA580C',
  info: '#6B7280',
} as const;

