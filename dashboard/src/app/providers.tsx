import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TimeZoneProvider } from '../hooks/useTimeZone';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <TimeZoneProvider>{children}</TimeZoneProvider>
    </QueryClientProvider>
  );
}

