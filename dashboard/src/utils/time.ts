import { formatInTimeZone } from 'date-fns-tz';
import { FARM_TIMEZONE } from '../config/constants';

export interface TimeFormatOptions {
  timezone?: string;
  includeSeconds?: boolean;
}

export function getCurrentDisplayTimezone() {
  return window.localStorage.getItem('smartFarm.timezone') || FARM_TIMEZONE;
}

export function formatDisplayTime(utc: string | null | undefined, options: TimeFormatOptions = {}) {
  if (!utc) return '—';
  const timezone = options.timezone ?? getCurrentDisplayTimezone();
  const pattern = options.includeSeconds ? 'yyyy-MM-dd HH:mm:ss zzz' : 'yyyy-MM-dd HH:mm zzz';
  return formatInTimeZone(new Date(utc), timezone, pattern);
}

export function formatDisplayDate(utc: string | null | undefined, timezone = getCurrentDisplayTimezone()) {
  if (!utc) return '—';
  return formatInTimeZone(new Date(utc), timezone, 'yyyy-MM-dd');
}

export function toChartTime(utc: string) {
  return new Date(utc).getTime();
}

export function ageLabel(utc: string | null | undefined) {
  if (!utc) return 'unknown';
  const diffMs = Date.now() - new Date(utc).getTime();
  const diffMin = Math.max(0, Math.round(diffMs / 60_000));
  if (diffMin < 60) return `${diffMin}m ago`;
  const hours = Math.round(diffMin / 60);
  if (hours < 48) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export function isOlderThanHours(utc: string | null | undefined, hours: number) {
  if (!utc) return false;
  return Date.now() - new Date(utc).getTime() > hours * 60 * 60 * 1000;
}

export function rangeForPreset(preset: '24h' | '7d' | '30d') {
  const to = new Date();
  const from = new Date(to);
  const hours = preset === '24h' ? 24 : preset === '7d' ? 24 * 7 : 24 * 30;
  from.setHours(from.getHours() - hours);
  return { from: from.toISOString(), to: to.toISOString() };
}

