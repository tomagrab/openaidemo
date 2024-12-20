'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

type useRealtimeConnectionProps = {
  voiceMode: boolean;
  selectedVoice: string;
};

export function useRealtimeConnection(
  { voiceMode, selectedVoice }: useRealtimeConnectionProps = {
    voiceMode: false,
    selectedVoice: 'verse',
  },
) {
  const [connected, setConnected] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const gotAudioTrackRef = useRef(false);

  const fetchNewEphemeralKey = useCallback(async () => {
    const res = await fetch(
      voiceMode
        ? `/api/openai/session?voice=${encodeURIComponent(selectedVoice)}`
        : '/api/openai/session',
      { cache: 'no-store' },
    );

    if (!res.ok) {
      throw new Error('Failed to fetch ephemeral key');
    }
    const data = await res.json();
    return data.client_secret.value;
  }, [voiceMode, selectedVoice]);

  const cleanupConnection = useCallback(() => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    dcRef.current = null;
    gotAudioTrackRef.current = false;
    if (audioRef.current) {
      audioRef.current.srcObject = null;
    }
    setConnected(false);
  }, []);

  const initConnection = useCallback(async () => {
    setError(null);
    setConnected(false);

    try {
      // Always fetch a fresh ephemeral key to avoid expiration issues
      const keyToUse = await fetchNewEphemeralKey();

      const pc = new RTCPeerConnection();
      pcRef.current = pc;

      let audioEl = audioRef.current;
      if (!audioEl) {
        audioEl = document.createElement('audio');
        audioEl.autoplay = true;
        audioRef.current = audioEl;
      }
      audioEl.srcObject = null;
      gotAudioTrackRef.current = false;

      pc.ontrack = e => {
        if (!gotAudioTrackRef.current && e.streams && e.streams[0]) {
          audioEl.srcObject = e.streams[0];
          gotAudioTrackRef.current = true;
        }
      };

      if (voiceMode) {
        const ms = await navigator.mediaDevices.getUserMedia({ audio: true });
        ms.getTracks().forEach(track => {
          if (pc.signalingState !== 'closed') {
            pc.addTrack(track, ms);
          }
        });
      }

      const dc = pc.createDataChannel('oai-events');
      dcRef.current = dc;

      dc.addEventListener('open', () => {
        setConnected(true);

        // Send a session.update event to configure the session for text or voice+text
        const sessionUpdate = {
          type: 'session.update',
          session: {
            modalities: voiceMode ? ['text', 'audio'] : ['text'],
            ...(voiceMode && { voice: selectedVoice }),
          },
        };

        dc.send(JSON.stringify(sessionUpdate));
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
          // Don't add new lines for voice responses
          setResponseText(prev => prev.trim());
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

      const answer: RTCSessionDescriptionInit = {
        type: 'answer',
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
  }, [fetchNewEphemeralKey, voiceMode, selectedVoice]);

  useEffect(() => {
    initConnection();
    return () => {
      cleanupConnection();
    };
  }, [initConnection, cleanupConnection]);

  const sendMessage = useCallback(
    (prompt: string) => {
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
          content: [{ type: 'input_text', text: prompt }],
        },
      };

      try {
        dcRef.current.send(JSON.stringify(userMsgEvent));

        const responseEvent = {
          type: 'response.create',
          response: {
            modalities: voiceMode ? ['text', 'audio'] : ['text'],
            instructions:
              "You are a helpful assistant. Respond to the user's message.",
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
    },
    [voiceMode],
  );

  const attemptReconnect = useCallback(() => {
    cleanupConnection();
    initConnection();
  }, [cleanupConnection, initConnection]);

  return {
    connected,
    error,
    responseText,
    sendMessage,
    attemptReconnect,
  };
}
