import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createCuttingEvent,
  createFertilizationEvent,
  createFieldNote,
  createSeasonEnd,
  createSeasonStart,
  createYieldRecord,
  getAgronomicEvents,
} from '../api/agronomy.api';
import type { TargetScope } from '../types/common';

const AGRONOMIC_QUERY_KEY = ['agronomicEvents'] as const;

// TODO (Phase 5.1):
// Rename this hook to useAgronomyEvents after Phase 5 stabilization
// to remove phase-specific naming and align with domain-driven structure.
function useCreateMutation<TInput>(createFn: (input: TInput) => Promise<unknown>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createFn,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: AGRONOMIC_QUERY_KEY });
    },
  });
}

export function useSeason() {
  const seasonEvents = useQuery({
    queryKey: [...AGRONOMIC_QUERY_KEY, 'season'],
    queryFn: () => getAgronomicEvents({ event_category: 'season_setup', limit: 200 }),
  });

  const events = seasonEvents.data?.events ?? [];
  const activeSeason = events.find((event) => event.event_type === 'season_start' && event.ended_at === null) ?? null;

  return {
    ...seasonEvents,
    activeSeason,
    startSeason: useCreateMutation(createSeasonStart).mutateAsync,
    endSeason: useCreateMutation(createSeasonEnd).mutateAsync,
  };
}

export function useCuttingEvents() {
  const cuttingEvents = useQuery({
    queryKey: [...AGRONOMIC_QUERY_KEY, 'cutting'],
    queryFn: () => getAgronomicEvents({ event_category: 'cutting', event_type: 'cutting_event', limit: 200 }),
  });
  return {
    ...cuttingEvents,
    createCutting: useCreateMutation(createCuttingEvent).mutateAsync,
  };
}

export function useYield() {
  const yieldEvents = useQuery({
    queryKey: [...AGRONOMIC_QUERY_KEY, 'yield'],
    queryFn: () => getAgronomicEvents({ event_category: 'yield', event_type: 'yield_record', limit: 200 }),
  });
  return {
    ...yieldEvents,
    createYield: useCreateMutation(createYieldRecord).mutateAsync,
  };
}

export function useFertilization() {
  const fertilizationEvents = useQuery({
    queryKey: [...AGRONOMIC_QUERY_KEY, 'fertilization'],
    queryFn: () => getAgronomicEvents({ event_category: 'fertilization', event_type: 'fertilization_event', limit: 200 }),
  });
  return {
    ...fertilizationEvents,
    createFertilization: useCreateMutation(createFertilizationEvent).mutateAsync,
  };
}

export function useFieldNotes() {
  const fieldNotes = useQuery({
    queryKey: [...AGRONOMIC_QUERY_KEY, 'field_notes'],
    queryFn: () => getAgronomicEvents({ event_category: 'field_note', event_type: 'field_note', limit: 200 }),
  });
  return {
    ...fieldNotes,
    createNote: useCreateMutation(createFieldNote).mutateAsync,
  };
}

export type Phase5TargetScope = TargetScope;
