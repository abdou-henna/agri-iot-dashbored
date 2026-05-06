import type { Appearance } from '../types/preferences';

export const DEFAULT_APPEARANCE: Appearance = 'light';

export const SUPPORTED_APPEARANCES: readonly Appearance[] = ['light', 'dark', 'system'] as const;
