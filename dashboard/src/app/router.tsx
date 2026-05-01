import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { StubPage } from '../features/agronomy/StubPage';
import { ComparisonPage } from '../features/comparison/ComparisonPage';
import { LogsPage } from '../features/diagnostics/LogsPage';
import { SystemHealthPage } from '../features/diagnostics/SystemHealthPage';
import { UploadsPage } from '../features/diagnostics/UploadsPage';
import { OverviewPage } from '../features/overview/OverviewPage';
import { SettingsPage } from '../features/settings/SettingsPage';
import { SoilPage } from '../features/soil/SoilPage';
import { WeatherPage } from '../features/weather/WeatherPage';

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { path: '/', element: <OverviewPage /> },
      { path: '/daily-operations', element: <StubPage title="Daily Operations" /> },
      { path: '/soil/pivot-1', element: <SoilPage nodeId="MAIN" /> },
      { path: '/soil/pivot-2', element: <SoilPage nodeId="N2" /> },
      { path: '/soil/comparison', element: <ComparisonPage /> },
      { path: '/weather', element: <WeatherPage /> },
      { path: '/agronomy/field-setup', element: <StubPage title="Field Setup / Season" /> },
      { path: '/agronomy/cutting-yield', element: <StubPage title="Cutting & Yield" /> },
      { path: '/agronomy/fertilization', element: <StubPage title="Fertilization" /> },
      { path: '/agronomy/field-notes', element: <StubPage title="Field Notes" /> },
      { path: '/diagnostics/uploads', element: <UploadsPage /> },
      { path: '/diagnostics/logs', element: <LogsPage /> },
      { path: '/diagnostics/system-health', element: <SystemHealthPage /> },
      { path: '/settings', element: <SettingsPage /> },
    ],
  },
]);

