'use client';

import { useEffect, useRef } from 'react';

/**
 * Manages audio playback based on voiceMode and provided media streams.
 */
export function useAudioPlayback(
  voiceMode: boolean,
  stream: MediaStream | null,
) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) {
      const audioEl = document.createElement('audio');
      audioEl.autoplay = true;
      audioRef.current = audioEl;
    }

    if (voiceMode && stream) {
      audioRef.current.srcObject = stream;
    } else {
      if (audioRef.current) audioRef.current.srcObject = null;
    }
  }, [voiceMode, stream]);
}
