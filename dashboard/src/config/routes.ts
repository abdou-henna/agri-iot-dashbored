import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  BarChart3,
  ClipboardList,
  CloudSun,
  FileClock,
  Gauge,
  Home,
  Leaf,
  ListChecks,
  NotebookText,
  Settings,
  Sprout,
  Stethoscope,
  UploadCloud,
} from 'lucide-react';

export interface AppRoute {
  path: string;
  label: string;
  icon: LucideIcon;
  group?: string;
}

export const routes: AppRoute[] = [
  { path: '/', label: 'Overview', icon: Home },
  { path: '/daily-operations', label: 'Daily Operations', icon: ListChecks },
  { path: '/soil/pivot-1', label: 'Pivot 1', group: 'Soil', icon: Sprout },
  { path: '/soil/pivot-2', label: 'Pivot 2', group: 'Soil', icon: Sprout },
  { path: '/soil/comparison', label: 'Comparison', group: 'Soil', icon: BarChart3 },
  { path: '/weather', label: 'Weather', icon: CloudSun },
  { path: '/agronomy/field-setup', label: 'Field Setup / Season', group: 'Agronomy', icon: Leaf },
  { path: '/agronomy/cutting-yield', label: 'Cutting & Yield', group: 'Agronomy', icon: ClipboardList },
  { path: '/agronomy/fertilization', label: 'Fertilization', group: 'Agronomy', icon: Gauge },
  { path: '/agronomy/field-notes', label: 'Field Notes', group: 'Agronomy', icon: NotebookText },
  { path: '/diagnostics/uploads', label: 'Upload History', group: 'Diagnostics', icon: UploadCloud },
  { path: '/diagnostics/logs', label: 'Logs / Events', group: 'Diagnostics', icon: FileClock },
  { path: '/diagnostics/system-health', label: 'System Health', group: 'Diagnostics', icon: Stethoscope },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export const mobileRoutes: AppRoute[] = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/daily-operations', label: 'Irrigation', icon: Activity },
  { path: '/soil/pivot-1', label: 'Soil', icon: Sprout },
  { path: '/agronomy/field-setup', label: 'Agronomy', icon: Leaf },
  { path: '/diagnostics/logs', label: 'Logs', icon: FileClock },
];

