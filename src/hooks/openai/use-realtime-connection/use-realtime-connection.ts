'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

export function useRealtimeConnection(initialEphemeralKey?: string) {
  const [ephemeralKey, setEphemeralKey] = useState(initialEphemeralKey);
  const [connected, setConnected] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fetchNewEphemeralKey = useCallback(async () => {
    const res = await fetch('/api/openai/session', {
      cache: 'no-store',
    });
    if (!res.ok) {
      throw new Error('Failed to fetch ephemeral key');
    }
    const data = await res.json();
    return data.client_secret.value;
  }, []);

  const initConnection = useCallback(async () => {
    setError(null);
    setConnected(false);

    try {
      // Use existing ephemeralKey or fetch a new one if it's missing or expired
      const keyToUse = ephemeralKey || (await fetchNewEphemeralKey());
      if (!ephemeralKey) setEphemeralKey(keyToUse);

      const pc = new RTCPeerConnection();
      pcRef.current = pc;

      const audioEl = document.createElement('audio');
      audioEl.autoplay = true;
      pc.ontrack = e => {
        audioEl.srcObject = e.streams[0];
      };
      audioRef.current = audioEl;

      const ms = await navigator.mediaDevices.getUserMedia({ audio: true });
      pc.addTrack(ms.getTracks()[0]);

      const dc = pc.createDataChannel('oai-events');
      dcRef.current = dc;

      // Data channel events
      dc.addEventListener('open', () => {
        setConnected(true);
      });

      dc.addEventListener('close', () => {
        setConnected(false);
        setError('Data channel closed unexpectedly. Please reconnect.');
      });

      dc.addEventListener('message', e => {
        const event = JSON.parse(e.data);
        if (event.type === 'response.text.delta') {
          setResponseText(prev => prev + event.delta);
        } else if (event.type === 'response.done') {
          // The final response is complete
        }
      });

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const baseUrl = 'https://api.openai.com/v1/realtime';
      const model = 'gpt-4o-realtime-preview-2024-12-17';

      const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
        method: 'POST',
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${keyToUse}`,
          'Content-Type': 'application/sdp',
        },
      });

      if (!sdpResponse.ok) {
        throw new Error(
          'Failed to establish SDP connection with the Realtime API.',
        );
      }

      const answer = {
        type: 'answer' as RTCSdpType,
        sdp: await sdpResponse.text(),
      };
      await pc.setRemoteDescription(answer);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'An unknown error occurred while connecting.',
      );
    }
  }, [ephemeralKey, fetchNewEphemeralKey]);

  useEffect(() => {
    initConnection();
  }, [initConnection]);

  const sendMessage = useCallback((prompt: string) => {
    if (!dcRef.current) {
      setError('Data channel not established. Please reconnect.');
      return;
    }

    if (dcRef.current.readyState !== 'open') {
      setError('Data channel is not open. Please wait or reconnect.');
      return;
    }

    setResponseText('');

    const userMsgEvent = {
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: prompt,
          },
        ],
      },
    };

    try {
      dcRef.current.send(JSON.stringify(userMsgEvent));

      const responseEvent = {
        type: 'response.create',
        response: {
          modalities: ['text'],
        },
      };
      dcRef.current.send(JSON.stringify(responseEvent));
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? `Failed to send message: ${err.message}`
          : 'Failed to send message due to an unknown error.',
      );
    }
  }, []);

  const attemptReconnect = useCallback(() => {
    initConnection();
  }, [initConnection]);

  return {
    connected,
    error,
    responseText,
    sendMessage,
    attemptReconnect,
    inputKey: ephemeralKey,
  };
}
