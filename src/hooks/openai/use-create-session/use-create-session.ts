import { useMutation } from '@tanstack/react-query';
import { EphemeralKey } from '@/lib/types/openai/openai';

export function useCreateSession() {
  return useMutation<EphemeralKey, unknown, void>({
    mutationFn: async () => {
      const response = await fetch('/api/openai/session', { method: 'POST' });
      if (!response.ok) {
        throw new Error(
          `Failed to create ephemeral key: ${response.statusText}`,
        );
      }
      return response.json();
    },
  });
}
