import { createContext, useContext, useMemo, useState } from 'react';
import { FARM_TIMEZONE } from '../config/constants';

export type TimeZoneMode = 'farm' | 'browser' | 'utc';

interface TimeZoneContextValue {
  mode: TimeZoneMode;
  timezone: string;
  setMode: (mode: TimeZoneMode) => void;
}

const TimeZoneContext = createContext<TimeZoneContextValue | null>(null);
const STORAGE_KEY = 'smartFarm.timezoneMode';

function browserTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || FARM_TIMEZONE;
}

export function resolveTimezone(mode: TimeZoneMode) {
  if (mode === 'utc') return 'UTC';
  if (mode === 'browser') return browserTimezone();
  return FARM_TIMEZONE;
}

export function TimeZoneProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<TimeZoneMode>(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === 'utc' || stored === 'browser' || stored === 'farm' ? stored : 'farm';
  });

  const value = useMemo<TimeZoneContextValue>(
    () => ({
      mode,
      timezone: resolveTimezone(mode),
      setMode: (nextMode) => {
        window.localStorage.setItem(STORAGE_KEY, nextMode);
        window.localStorage.setItem('smartFarm.timezone', resolveTimezone(nextMode));
        setModeState(nextMode);
      },
    }),
    [mode],
  );

  return <TimeZoneContext.Provider value={value}>{children}</TimeZoneContext.Provider>;
}

export function useTimeZone() {
  const context = useContext(TimeZoneContext);
  if (!context) throw new Error('useTimeZone must be used inside TimeZoneProvider');
  return context;
}
