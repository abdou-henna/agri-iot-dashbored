import { useMutation } from '@tanstack/react-query';
import { generateGeminiInsight } from '../api/gemini.api';
import type { ApiError } from '../api/client';
import type { GeminiInsightInput, GeminiMultiSnapshotInsightInput } from '../types/gemini';

interface UseGeminiInsightOptions {
  onSuccess?: () => void;
}

export function useGeminiInsight(input: GeminiInsightInput | GeminiMultiSnapshotInsightInput | null, options: UseGeminiInsightOptions = {}) {
  const canGenerate = Boolean(input);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!input || !canGenerate) {
        throw new Error('Gemini insight generation is disabled until input is available.');
      }
      return generateGeminiInsight(input);
    },
    onSuccess: options.onSuccess,
  });

  return {
    insight: mutation.data ?? null,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error instanceof Error ? mutation.error.message : mutation.error ? String(mutation.error) : null,
    apiError: mutation.error && typeof mutation.error === 'object' && 'status' in mutation.error
      ? mutation.error as ApiError
      : null,
    generate: mutation.mutateAsync,
    refetch: mutation.mutateAsync,
    clear: mutation.reset,
  };
}
