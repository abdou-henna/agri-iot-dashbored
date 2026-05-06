import type { ApiError } from '../../api/client';
import { Button, StateBlock } from '../ui';

export function LoadingBlock({ label = 'Loading data' }: { label?: string }) {
  return <StateBlock state="loading" title={`${label}...`} description="" className="text-sm" />;
}

export function ErrorBlock({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const apiError = error as Partial<ApiError>;
  return (
    <StateBlock
      state="error"
      title="Could not load data."
      description={apiError.message ?? 'Check WebService connectivity.'}
      className="text-sm"
      action={onRetry ? (
        <Button variant="danger" size="sm" className="mt-3" onClick={onRetry}>
          Retry
        </Button>
      ) : undefined}
    />
  );
}

export function EmptyState({ message }: { message: string }) {
  return <StateBlock state="empty" title={message} description="" className="text-sm" />;
}
