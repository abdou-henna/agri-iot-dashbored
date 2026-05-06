import { DEFAULT_LOCALE, localeToDirection } from '../config/i18n';
import { DEFAULT_APPEARANCE } from '../config/theme';
import type { Appearance, Direction, Locale } from '../types/preferences';

export function getDirectionForLocale(locale: Locale): Direction {
  return localeToDirection(locale);
}

export function applyDocumentLanguageDirection(locale: Locale = DEFAULT_LOCALE): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  root.lang = locale;
  root.dir = getDirectionForLocale(locale);
}

export function applyDocumentAppearance(appearance: Appearance = DEFAULT_APPEARANCE): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  const resolved = appearance === 'system'
    ? (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : appearance;

  root.dataset.theme = resolved;
}
