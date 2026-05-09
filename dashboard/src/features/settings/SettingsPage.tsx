import { useEffect, useState } from 'react';
import { useTimeZone, type TimeZoneMode } from '../../hooks/useTimeZone';
import { rangeForPreset } from '../../utils/time';
import { useDataExport, type ExportDataset } from '../../hooks/useDataExport';

export function SettingsPage() {
  const { mode, timezone, setMode } = useTimeZone();
  const [defaultRange, setDefaultRange] = useState(() => window.localStorage.getItem('smartFarm.defaultRange') ?? '24h');
  const [theme, setTheme] = useState(() => window.localStorage.getItem('smartFarm.chartTheme') ?? 'light');
  const [exportPreset, setExportPreset] = useState<'24h' | '7d' | '30d' | 'custom'>('24h');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [selectedDataset, setSelectedDataset] = useState<ExportDataset | 'all'>('sensor_readings');
  const { isExporting, error: exportError, message: exportMessage, exportNote, runExport } = useDataExport();

  useEffect(() => {
    window.localStorage.setItem('smartFarm.defaultRange', defaultRange);
  }, [defaultRange]);

  useEffect(() => {
    window.localStorage.setItem('smartFarm.chartTheme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <div className="max-w-3xl space-y-5">
      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">Display Time Zone</h2>
        <select className="mt-3 w-full rounded-md border border-zinc-200 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" value={mode} onChange={(event) => setMode(event.target.value as TimeZoneMode)}>
          <option value="farm">Farm local time</option>
          <option value="browser">Browser local time</option>
          <option value="utc">UTC</option>
        </select>
        <p className="mt-2 text-sm text-zinc-500">All times shown in {timezone}</p>
      </section>
      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">Default Date Range</h2>
        <select className="mt-3 w-full rounded-md border border-zinc-200 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" value={defaultRange} onChange={(event) => setDefaultRange(event.target.value)}>
          <option value="24h">Last 24h</option>
          <option value="7d">7d</option>
          <option value="30d">30d</option>
        </select>
      </section>
      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">Dashboard Appearance</h2>
        <select className="mt-3 w-full rounded-md border border-zinc-200 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" value={theme} onChange={(event) => setTheme(event.target.value)}>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </section>
      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">Data Export</h2>
        <p className="mt-1 text-sm text-zinc-500">Download CSV snapshots of stored dashboard data. Each domain is exported separately to preserve data semantics.</p>
        <div className="mt-3 grid gap-2">
          <label className="text-sm font-medium text-zinc-700">Date range</label>
          <select className="w-full rounded-md border border-zinc-200 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" value={exportPreset} onChange={(event) => setExportPreset(event.target.value as typeof exportPreset)}>
            <option value="24h">Last 24h</option>
            <option value="7d">Last 7d</option>
            <option value="30d">Last 30d</option>
            <option value="custom">Custom</option>
          </select>
          {exportPreset === 'custom' ? (
            <div className="grid gap-2 sm:grid-cols-2">
              <input type="datetime-local" className="w-full rounded-md border border-zinc-200 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" value={customFrom} onChange={(event) => setCustomFrom(event.target.value)} />
              <input type="datetime-local" className="w-full rounded-md border border-zinc-200 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" value={customTo} onChange={(event) => setCustomTo(event.target.value)} />
            </div>
          ) : null}
          <label className="mt-2 text-sm font-medium text-zinc-700">Dataset</label>
          <select className="w-full rounded-md border border-zinc-200 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" value={selectedDataset} onChange={(event) => setSelectedDataset(event.target.value as ExportDataset)}>
            <option value="sensor_readings">Sensor readings</option>
            <option value="system_events">System events</option>
            <option value="uploads">Uploads</option>
            <option value="agronomic_events">Agronomic events</option>
            <option value="all">All datasets</option>
          </select>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <button
              className="rounded-lg bg-emerald-600 px-3 py-2 text-white hover:bg-emerald-700 disabled:opacity-50"
              disabled={isExporting}
              onClick={async () => {
                const range = exportPreset === 'custom'
                  ? { from: customFrom ? new Date(customFrom).toISOString() : '', to: customTo ? new Date(customTo).toISOString() : '' }
                  : rangeForPreset(exportPreset);
                if (!range.from || !range.to) return;
                await runExport(selectedDataset === 'all' ? ['sensor_readings', 'system_events', 'uploads', 'agronomic_events'] : [selectedDataset], range.from, range.to);
              }}
            >
              {isExporting ? 'Exporting...' : 'Export selected'}
            </button>
            <button
              className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              disabled={isExporting}
              onClick={async () => {
                const range = exportPreset === 'custom'
                  ? { from: customFrom ? new Date(customFrom).toISOString() : '', to: customTo ? new Date(customTo).toISOString() : '' }
                  : rangeForPreset(exportPreset);
                if (!range.from || !range.to) return;
                await runExport(['sensor_readings', 'system_events', 'uploads', 'agronomic_events'], range.from, range.to);
              }}
            >
              Export all
            </button>
          </div>
          <p className="text-xs text-zinc-500">{exportNote}</p>
          {exportError ? <p className="text-sm text-red-600">{exportError}</p> : null}
          {exportMessage ? <p className="text-sm text-green-700">{exportMessage}</p> : null}
        </div>
      </section>
    </div>
  );
}
