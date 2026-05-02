import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { COLORS } from '../../config/constants';
import type { TimeSeriesPoint } from '../../types/readings';

export interface DailyBandPoint {
  ts: string;
  displayDate: string;
  avg: number | null;
  min: number | null;
  max: number | null;
}

export interface StatusDistributionPoint {
  day: string;
  ok: number;
  partial: number;
  error: number;
  missing: number;
}

export interface DualSeriesPoint {
  ts: string;
  displayTime: string;
  left: number | null;
  right: number | null;
}

export function EmptyChartState({ message = 'No data in selected range', onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="flex min-h-48 items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-50 p-4 text-center">
      <div>
        <div className="text-sm font-medium text-slate-700">{message}</div>
        {onRetry ? (
          <button className="mt-3 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700" onClick={onRetry}>
            Retry
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function DataConfidenceStrip() {
  return null;
}

export function ChartFrame({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}

export function MetricLineChart({
  points,
  color = COLORS.pivot1,
  yDomain,
  referenceLines,
  heightClassName,
}: {
  points: TimeSeriesPoint[];
  color?: string;
  yDomain?: [number, number];
  referenceLines?: Array<{ value: number; label: string; color?: string }>;
  heightClassName?: string;
}) {
  if (points.length === 0) return <EmptyChartState message="No data in selected range" />;

  return (
    <div className={`${heightClassName ?? 'h-64'} w-full`}>
      <ResponsiveContainer>
        <LineChart data={points} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="displayTime" minTickGap={32} tick={{ fontSize: 11 }} />
          <YAxis domain={yDomain ?? ['auto', 'auto']} tick={{ fontSize: 11 }} />
          <Tooltip
            formatter={(value) => [value ?? 'missing', 'Value']}
            labelFormatter={(label) => `Measured at ${label}`}
          />
          {referenceLines?.map((line) => (
            <ReferenceLine
              key={`${line.value}-${line.label}`}
              y={line.value}
              stroke={line.color ?? COLORS.warning}
              strokeDasharray="4 4"
              label={{ value: line.label, position: 'insideTopRight', fontSize: 11, fill: line.color ?? COLORS.warning }}
            />
          ))}
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={(props) => {
              const payload = props.payload as TimeSeriesPoint | undefined;
              if (!payload || payload.value !== null) return <circle cx={props.cx} cy={props.cy} r={0} fill="transparent" />;
              return <circle cx={props.cx} cy={props.cy} r={4} fill={COLORS.missing} />;
            }}
            connectNulls={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function Sparkline({ points, color }: { points: TimeSeriesPoint[]; color: string }) {
  if (points.length === 0) return <div className="h-10 rounded-sm bg-slate-100" />;
  const rows = points.map((point) => ({ ...point, sparkValue: point.value ?? 0 }));
  return (
    <div className="h-10 w-full">
      <ResponsiveContainer>
        <AreaChart data={rows} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
          <Area type="monotone" dataKey="sparkValue" stroke={color} fill={`${color}22`} strokeWidth={1.5} dot={false} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DualMetricChart({
  points,
  leftName,
  rightName,
  leftColor,
  rightColor,
  yDomain,
}: {
  points: DualSeriesPoint[];
  leftName: string;
  rightName: string;
  leftColor: string;
  rightColor: string;
  yDomain: [number, number];
}) {
  if (points.length === 0) return <EmptyChartState message="No data in selected range" />;

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <LineChart data={points} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="displayTime" minTickGap={32} tick={{ fontSize: 11 }} />
          <YAxis domain={yDomain} tick={{ fontSize: 11 }} />
          <Tooltip labelFormatter={(label) => `Measured at ${label}`} />
          <Legend />
          <Line name={leftName} type="monotone" dataKey="left" stroke={leftColor} strokeWidth={2} dot={false} connectNulls={false} isAnimationActive={false} />
          <Line
            name={rightName}
            type="monotone"
            dataKey="right"
            stroke={rightColor}
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            connectNulls={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DailyBandChart({ points, yDomain, color = COLORS.pivot1 }: { points: DailyBandPoint[]; yDomain: [number, number]; color?: string }) {
  if (points.length === 0) return <EmptyChartState message="No daily summary in selected range" />;

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer>
        <AreaChart data={points} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="displayDate" tick={{ fontSize: 11 }} />
          <YAxis domain={yDomain} tick={{ fontSize: 11 }} />
          <Tooltip labelFormatter={(label) => `Measured day ${label}`} />
          <Area dataKey="max" name="Max" stroke="transparent" fill={`${color}18`} dot={false} isAnimationActive={false} />
          <Area dataKey="min" name="Min" stroke="transparent" fill="#fff" dot={false} isAnimationActive={false} />
          <Line dataKey="avg" name="Avg" stroke={color} strokeWidth={2} dot={false} connectNulls={false} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function StatusDistributionChart({ points }: { points: StatusDistributionPoint[] }) {
  if (points.length === 0) return <EmptyChartState message="No status distribution in selected range" />;

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer>
        <BarChart data={points} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="day" tick={{ fontSize: 11 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="ok" stackId="status" fill={COLORS.pivot1} />
          <Bar dataKey="partial" stackId="status" fill="#FACC15" />
          <Bar dataKey="error" stackId="status" fill={COLORS.error} />
          <Bar dataKey="missing" stackId="status" fill={COLORS.missing} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TimeRangeSelector({
  value,
  onChange,
}: {
  value: '24h' | '7d' | '30d';
  onChange: (value: '24h' | '7d' | '30d') => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {(['24h', '7d', '30d'] as const).map((range) => (
        <button
          key={range}
          className={`rounded-md border px-3 py-2 text-sm ${
            value === range ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-700'
          }`}
          onClick={() => onChange(range)}
        >
          {range}
        </button>
      ))}
      <button className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-400" disabled title="Custom range is reserved for a later phase">
        Custom
      </button>
    </div>
  );
}
