import { useMutation } from '@tanstack/react-query';
import { generateGeminiInsight } from '../api/gemini.api';
import type { GeminiInsightInput } from '../types/gemini';

interface UseGeminiInsightOptions {
  onSuccess?: () => void;
}

export function useGeminiInsight(input: GeminiInsightInput | null, options: UseGeminiInsightOptions = {}) {
  const hasApiKey = Boolean(import.meta.env.VITE_GEMINI_API_KEY);
  const canGenerate = Boolean(input) && hasApiKey;

  const mutation = useMutation({
    mutationFn: async () => {
      if (!input || !canGenerate) {
        throw new Error('Gemini insight generation is disabled until input and API key are available.');
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
    generate: mutation.mutateAsync,
    refetch: mutation.mutateAsync,
  };
}
