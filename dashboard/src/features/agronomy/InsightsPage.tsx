import { useMemo, useState } from 'react';
import { GeminiContextControls, getGeminiScopeOption, type GeminiScopeKey, type GeminiWindowKey } from '../../components/ai/GeminiContextControls';
import { GeminiInsightPanel } from '../../components/ai/GeminiInsightPanel';
import { EmptyState, ErrorBlock, LoadingBlock } from '../../components/feedback/States';
import { useAgronomicInsights } from '../../hooks/useAgronomicInsights';
import { useAnalyticsSnapshot } from '../../hooks/useAnalyticsSnapshot';
import { useTimeZone } from '../../hooks/useTimeZone';
import type { GeminiAnalysisType } from '../../types/gemini';
import { formatDisplayTime, rangeForPreset } from '../../utils/time';

function DeltaLabel({ value }: { value: number }) {
  const sign = value > 0 ? '+' : '';
  return <span className={value >= 0 ? 'text-emerald-700' : 'text-blue-700'}>{`${sign}${value.toFixed(1)}%`}</span>;
}

export function InsightsPage() {
  const insights = useAgronomicInsights();
  const { timezone } = useTimeZone();
  const [selectedScope, setSelectedScope] = useState<GeminiScopeKey>('pivot_1_main');
  const [selectedWindow, setSelectedWindow] = useState<GeminiWindowKey>('7d');
  const [selectedAnalysisType, setSelectedAnalysisType] = useState<GeminiAnalysisType>('weekly_summary');

  const selectedScopeOption = getGeminiScopeOption(selectedScope);
  const range = useMemo(() => {
    if (selectedWindow === '7d') return rangeForPreset('7d');
    const to = new Date();
    const from = new Date(to);
    from.setDate(from.getDate() - 30);
    return { from: from.toISOString(), to: to.toISOString() };
  }, [selectedWindow]);

  const snapshotState = useAnalyticsSnapshot({
    node_id: selectedScopeOption.node_id,
    metric: selectedScopeOption.metric,
    from: range.from,
    to: range.to,
    bucket: '1hour',
  });

  const mainSoilSnapshotState = useAnalyticsSnapshot({ node_id: 'MAIN', metric: 'soil_moisture_percent', from: range.from, to: range.to, bucket: '1hour' });
  const n2SoilSnapshotState = useAnalyticsSnapshot({ node_id: 'N2', metric: 'soil_moisture_percent', from: range.from, to: range.to, bucket: '1hour' });
  const n3WeatherSnapshotState = useAnalyticsSnapshot({ node_id: 'N3', metric: 'air_temperature_c', from: range.from, to: range.to, bucket: '1hour' });

  if (insights.isLoading) return <LoadingBlock label="Loading agronomic insights" />;
  if (insights.isError) return <ErrorBlock error={insights.error} onRetry={() => insights.refetch()} />;

  return (
    <div className="space-y-4">
      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-base font-semibold text-slate-900">Irrigation vs Soil Moisture</h2>
        <p className="mt-1 text-xs text-slate-500">Nearest readings by measured_at only. Before window: 60 min. After window: 120 min.</p>
        <div className="mt-3 space-y-2">
          {insights.irrigationMoisture.length ? insights.irrigationMoisture.map((item) => (
            <div key={`${item.agro_event_id}-${item.node_id}`} className="rounded-md bg-slate-50 p-3 text-xs">
              <div className="font-semibold text-slate-900">{item.node_id} · {item.agro_event_id}</div>
              <div className="mt-1 text-slate-600">Start: {formatDisplayTime(item.started_at)} · End: {formatDisplayTime(item.ended_at)}</div>
              {item.status === 'ok' && item.before && item.after && typeof item.delta === 'number' ? (
                <div className="mt-1 text-slate-700">
                  Before {item.before.value.toFixed(1)}% ({formatDisplayTime(item.before.measured_at)}) → After {item.after.value.toFixed(1)}% ({formatDisplayTime(item.after.measured_at)}) · Δ <DeltaLabel value={item.delta} />
                </div>
              ) : (
                <div className="mt-1 text-amber-700">not enough data</div>
              )}
            </div>
          )) : <EmptyState message="No completed irrigation sessions found." />}
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-base font-semibold text-slate-900">Cutting / Yield Summary</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Cutting events</h3>
            <div className="mt-2 space-y-2">
              {insights.cuttingEvents.length ? insights.cuttingEvents.map((event) => (
                <div key={event.agro_event_id} className="rounded-md bg-slate-50 p-2 text-xs text-slate-700">
                  <div className="font-semibold">{event.agro_event_id}</div>
                  <div>{formatDisplayTime(event.started_at)}</div>
                </div>
              )) : <div className="text-xs text-slate-500">No cutting events found.</div>}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Yield records</h3>
            <div className="mt-2 space-y-2">
              {insights.yieldsWithLinks.length ? insights.yieldsWithLinks.map((item) => (
                <div key={item.record.agro_event_id} className="rounded-md bg-slate-50 p-2 text-xs text-slate-700">
                  <div className="font-semibold">{item.record.agro_event_id}</div>
                  <div>{formatDisplayTime(item.record.started_at)}</div>
                  <div className="mt-1">{item.linked ? `linked to cutting: ${item.cutting_event_id}` : 'unlinked yield record'}</div>
                </div>
              )) : <div className="text-xs text-slate-500">No yield records found.</div>}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-base font-semibold text-slate-900">Reliability Summary</h2>
        <div className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
          <div className="rounded-md bg-slate-50 p-3">
            <div className="text-xs uppercase text-slate-500">Missing N2 readings</div>
            <div className="mt-1 text-xl font-semibold">{insights.reliability.missingN2Readings}</div>
          </div>
          <div className="rounded-md bg-slate-50 p-3">
            <div className="text-xs uppercase text-slate-500">Missing N3 readings</div>
            <div className="mt-1 text-xl font-semibold">{insights.reliability.missingN3Readings}</div>
          </div>
          <div className="rounded-md bg-slate-50 p-3">
            <div className="text-xs uppercase text-slate-500">Sensor error records</div>
            <div className="mt-1 text-xl font-semibold">{insights.reliability.sensorErrorRecords}</div>
          </div>
        </div>
      </section>

      <GeminiContextControls
        selectedScope={selectedScope}
        selectedWindow={selectedWindow}
        selectedAnalysisType={selectedAnalysisType}
        onScopeChange={setSelectedScope}
        onWindowChange={setSelectedWindow}
        onAnalysisTypeChange={setSelectedAnalysisType}
      />

      <GeminiInsightPanel
        snapshot={snapshotState.snapshot ?? null}
        comparisonSnapshots={[
          { scopeLabel: 'MAIN soil moisture', snapshot: mainSoilSnapshotState.snapshot ?? null },
          { scopeLabel: 'N2 soil moisture', snapshot: n2SoilSnapshotState.snapshot ?? null },
          { scopeLabel: 'N3 air temperature', snapshot: n3WeatherSnapshotState.snapshot ?? null },
        ]}
        analysisType={selectedAnalysisType}
        timezone={timezone ?? 'UTC'}
        contextLabel={selectedScopeOption.label}
        windowLabel={selectedWindow}
        scopeLabel={selectedScopeOption.label}
      />
    </div>
  );
}
