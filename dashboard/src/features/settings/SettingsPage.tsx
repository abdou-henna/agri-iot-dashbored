import { useEffect, useState } from 'react';
import { useTimeZone, type TimeZoneMode } from '../../hooks/useTimeZone';

export function SettingsPage() {
  const { mode, timezone, setMode } = useTimeZone();
  const [defaultRange, setDefaultRange] = useState(() => window.localStorage.getItem('smartFarm.defaultRange') ?? '24h');
  const [theme, setTheme] = useState(() => window.localStorage.getItem('smartFarm.chartTheme') ?? 'light');

  useEffect(() => {
    window.localStorage.setItem('smartFarm.defaultRange', defaultRange);
  }, [defaultRange]);

  useEffect(() => {
    window.localStorage.setItem('smartFarm.chartTheme', theme);
  }, [theme]);

  return (
    <div className="max-w-3xl space-y-5">
      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="font-semibold text-slate-900">Display Time Zone</h2>
        <select className="mt-3 w-full rounded-md border border-slate-200 px-3 py-2" value={mode} onChange={(event) => setMode(event.target.value as TimeZoneMode)}>
          <option value="farm">Farm local time</option>
          <option value="browser">Browser local time</option>
          <option value="utc">UTC</option>
        </select>
        <p className="mt-2 text-sm text-slate-500">All times shown in {timezone}</p>
      </section>
      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="font-semibold text-slate-900">Default Date Range</h2>
        <select className="mt-3 w-full rounded-md border border-slate-200 px-3 py-2" value={defaultRange} onChange={(event) => setDefaultRange(event.target.value)}>
          <option value="24h">Last 24h</option>
          <option value="7d">7d</option>
          <option value="30d">30d</option>
        </select>
      </section>
      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="font-semibold text-slate-900">Chart Theme</h2>
        <select className="mt-3 w-full rounded-md border border-slate-200 px-3 py-2" value={theme} onChange={(event) => setTheme(event.target.value)}>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </section>
    </div>
  );
}

