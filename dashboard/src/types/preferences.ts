export type Locale = 'en' | 'ar';

export type Direction = 'ltr' | 'rtl';

export type Appearance = 'light' | 'dark' | 'system';

export interface DashboardPreferences {
  locale: Locale;
  direction: Direction;
  appearance: Appearance;
}
