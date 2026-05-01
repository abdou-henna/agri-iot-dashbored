import type { ApiError } from '../../api/client';

export function LoadingBlock({ label = 'Loading data' }: { label?: string }) {
  return <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">{label}...</div>;
}

export function ErrorBlock({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const apiError = error as Partial<ApiError>;
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
      <div className="font-semibold">Could not load data.</div>
      <div>{apiError.message ?? 'Check WebService connectivity.'}</div>
      {onRetry ? (
        <button className="mt-3 rounded-md bg-red-700 px-3 py-2 text-white" onClick={onRetry}>
          Retry
        </button>
      ) : null}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">{message}</div>;
}

