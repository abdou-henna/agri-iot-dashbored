import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { endIrrigation, startIrrigation } from '../api/agronomy.api';
import { useAgronomicEvents } from './useAgronomicEvents';
import type { IrrigationEndInput, IrrigationStartInput } from '../types/agronomy';

export function useIrrigationSession() {
  const queryClient = useQueryClient();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const activeEventsQuery = useAgronomicEvents({
    event_category: 'irrigation',
    event_type: 'irrigation_session',
    limit: 200,
  });
  const todayEventsQuery = useAgronomicEvents({
    event_category: 'irrigation',
    event_type: 'irrigation_session',
    from: todayStart.toISOString(),
    to: new Date().toISOString(),
    limit: 200,
  });

  const activeEvents = activeEventsQuery.data?.events ?? [];
  const todayEvents = todayEventsQuery.data?.events ?? [];
  const activeSession = activeEvents.find((event) => event.ended_at === null) ?? null;
  const todaySessions = todayEvents.filter((event) => event.ended_at !== null);
  const isIrrigating = Boolean(activeSession);
  const refetchSession = useCallback(async () => {
    await Promise.all([activeEventsQuery.refetch(), todayEventsQuery.refetch()]);
  }, [activeEventsQuery, todayEventsQuery]);

  const startMutation = useMutation({
    mutationFn: async (input: IrrigationStartInput = {}) => {
      if (activeSession) {
        throw new Error('Irrigation is already active. End current session before starting a new one.');
      }
      try {
        return await startIrrigation(input);
      } catch (error) {
        if (typeof error === 'object' && error !== null && 'status' in error && (error as { status?: number }).status === 409) {
          await refetchSession();
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agronomicEvents'] });
    },
  });

  const endMutation = useMutation({
    mutationFn: async (input: IrrigationEndInput = {}) => {
      if (!activeSession) {
        throw new Error('No active irrigation session to end.');
      }
      return endIrrigation(activeSession.agro_event_id, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agronomicEvents'] });
    },
  });

  return {
    activeSession,
    todaySessions,
    isIrrigating,
    startIrrigation: startMutation.mutateAsync,
    endIrrigation: endMutation.mutateAsync,
    isStarting: startMutation.isPending,
    isEnding: endMutation.isPending,
    refetchSession,
    isLoading: activeEventsQuery.isLoading || todayEventsQuery.isLoading,
    error: startMutation.error ?? endMutation.error ?? activeEventsQuery.error ?? todayEventsQuery.error ?? null,
  };
}
