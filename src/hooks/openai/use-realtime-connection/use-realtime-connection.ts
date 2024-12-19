'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface UseRealtimeConnectionParams {
  ephemeralKey: string | null;
  voiceMode: boolean;
  onTrack: (stream: MediaStream | null) => void;
  onMessage: (event: Record<string, unknown>) => void; // Called when text events occur
  onError: (err: string) => void;
  onOpen: () => void;
  onClose: () => void;
}

/**
 * Manages the actual WebRTC PeerConnection and DataChannel.
 * Requires ephemeralKey to connect.
 * Not responsible for fetching keys or handling text/audio logic directly,
 * just sets up the connection and emits events.
 */
export function useRealtimeConnection({
  ephemeralKey,
  voiceMode,
  onTrack,
  onMessage,
  onError,
  onOpen,
  onClose,
}: UseRealtimeConnectionParams) {
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);

  const [connected, setConnected] = useState(false);

  const cleanup = useCallback(() => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    dcRef.current = null;
    setConnected(false);
    onTrack(null);
  }, [onTrack]);

  const initConnection = useCallback(async () => {
    if (!ephemeralKey) return; // Wait until we have a key

    try {
      cleanup();
      const pc = new RTCPeerConnection();
      pcRef.current = pc;

      pc.ontrack = e => {
        if (voiceMode && e.streams[0]) {
          onTrack(e.streams[0]);
        } else {
          onTrack(null);
        }
      };

      // Only add local track if voiceMode is on
      if (voiceMode) {
        const ms = await navigator.mediaDevices.getUserMedia({ audio: true });
        ms.getTracks().forEach(track => {
          pc.addTrack(track, ms);
        });
      }

      const dc = pc.createDataChannel('oai-events');
      dcRef.current = dc;

      dc.onopen = () => {
        setConnected(true);
        onOpen();
      };
      dc.onclose = () => {
        setConnected(false);
        onClose();
        onError('Data channel closed unexpectedly. Please reconnect.');
      };
      dc.onmessage = e => onMessage(JSON.parse(e.data));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const baseUrl = 'https://api.openai.com/v1/realtime';
      const model = 'gpt-4o-realtime-preview-2024-12-17';

      const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
        method: 'POST',
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${ephemeralKey}`,
          'Content-Type': 'application/sdp',
        },
      });

      if (!sdpResponse.ok) {
        throw new Error(
          'Failed to establish SDP connection with the Realtime API.',
        );
      }

      const answer: RTCSessionDescriptionInit = {
        type: 'answer',
        sdp: await sdpResponse.text(),
      };
      await pc.setRemoteDescription(answer);
    } catch (err: Error | unknown) {
      onError(
        err instanceof Error ? err.message : 'Unknown error in initConnection',
      );
    }
  }, [
    ephemeralKey,
    voiceMode,
    onTrack,
    onMessage,
    onError,
    onOpen,
    onClose,
    cleanup,
  ]);

  useEffect(() => {
    initConnection();
    return () => {
      cleanup();
    };
  }, [initConnection, cleanup]);

  const send = useCallback(
    (msg: object) => {
      if (!dcRef.current || dcRef.current.readyState !== 'open') {
        onError('Data channel is not open. Please wait or reconnect.');
        return;
      }
      dcRef.current.send(JSON.stringify(msg));
    },
    [onError],
  );

  return { connected, send };
}
