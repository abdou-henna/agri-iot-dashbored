import { useMutation, useQueryClient } from '@tanstack/react-query';
import { endIrrigation, startIrrigation } from '../api/agronomy.api';
import { useAgronomicEvents } from './useAgronomicEvents';
import type { IrrigationEndInput, IrrigationStartInput } from '../types/agronomy';

export function useIrrigationSession() {
  const queryClient = useQueryClient();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const eventsQuery = useAgronomicEvents({
    event_category: 'irrigation',
    event_type: 'irrigation_session',
    from: todayStart.toISOString(),
    to: new Date().toISOString(),
    limit: 200,
  });

  const events = eventsQuery.data?.events ?? [];
  const activeSession = events.find((event) => event.ended_at === null) ?? null;
  const todaySessions = events.filter((event) => event.ended_at !== null);
  const isIrrigating = Boolean(activeSession);

  const startMutation = useMutation({
    mutationFn: async (input: IrrigationStartInput = {}) => {
      if (activeSession) {
        throw new Error('Irrigation is already active. End current session before starting a new one.');
      }
      return startIrrigation(input);
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
    error: startMutation.error ?? endMutation.error ?? eventsQuery.error ?? null,
  };
}

