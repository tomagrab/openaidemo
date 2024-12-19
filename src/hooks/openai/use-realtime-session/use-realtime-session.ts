'use client';

import { useCallback, useState, useEffect } from 'react';

/**
 * Manages ephemeral keys and voice changes. When the selectedVoice changes
 * or certain conditions arise (like needing a new session), this hook fetches
 * a new ephemeral key from the server.
 */
export function useRealtimeSession(selectedVoice: string) {
  const [ephemeralKey, setEphemeralKey] = useState<string | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);

  const fetchNewEphemeralKey = useCallback(async (voice: string) => {
    const res = await fetch(
      `/api/openai/session?voice=${encodeURIComponent(voice)}`,
      { cache: 'no-store' },
    );
    if (!res.ok) {
      throw new Error('Failed to fetch ephemeral key');
    }
    const data = await res.json();
    return data.client_secret.value;
  }, []);

  const initSession = useCallback(async () => {
    setSessionError(null);
    try {
      const key = await fetchNewEphemeralKey(selectedVoice);
      setEphemeralKey(key);
    } catch (err: Error | unknown) {
      const error =
        err instanceof Error
          ? err.message
          : 'Unknown error fetching ephemeral key';
      setSessionError(error);
    }
  }, [fetchNewEphemeralKey, selectedVoice]);

  useEffect(() => {
    initSession();
  }, [initSession]);

  // If user changes voice after audio was used, you can call initSession() again from outside.

  return { ephemeralKey, sessionError, initSession };
}
