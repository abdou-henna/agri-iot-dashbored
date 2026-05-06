import type { Direction, Locale } from '../types/preferences';

export const DEFAULT_LOCALE: Locale = 'en';

export const SUPPORTED_LOCALES: readonly Locale[] = ['en', 'ar'] as const;

export function localeToDirection(locale: Locale): Direction {
  return locale === 'ar' ? 'rtl' : 'ltr';
}
