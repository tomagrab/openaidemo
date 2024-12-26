'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

// Constants for clarity
const BASE_APP_URL = process.env.NEXT_PUBLIC_BASE_APP_URL;
const BASE_EPH_KEY_URL = '/api/openai/session';
const BASE_REALTIME_URL = 'https://api.openai.com/v1/realtime';
const MODEL_ID = 'gpt-4o-realtime-preview-2024-12-17';
const DATA_CHANNEL_LABEL = 'oai-events';

interface RealtimeConnectionHook {
  loading: boolean;
  connected: boolean;
  error: string | null;
  responseText: string;
  sendMessage: (prompt: string) => void;
  attemptReconnect: () => void;
}

type ServerEvent = {
  type: string;
  [key: string]: string | number | boolean | object | null | undefined;
};

const buildSessionUrl = (voiceMode: boolean, selectedVoice: string) => {
  const url = new URL(BASE_EPH_KEY_URL, BASE_APP_URL);

  // Clear existing search params each time to avoid stacking them
  url.searchParams.delete('modalities');
  url.searchParams.delete('voice');
  url.searchParams.delete('voice');

  // If voiceMode is enabled, add audio and text modalities
  if (voiceMode) {
    url.searchParams.append('modalities', 'audio');
    url.searchParams.append('modalities', 'text');
    url.searchParams.set('voice', selectedVoice);
  } else {
    url.searchParams.append('modalities', 'text');
  }

  return url;
};

const fetchEphemeralKey = async (
  voiceMode: boolean,
  selectedVoice: string,
): Promise<string> => {
  const reqUrl = buildSessionUrl(voiceMode, selectedVoice);

  const res = await fetch(reqUrl, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Failed to fetch ephemeral key');
  }
  const data = await res.json();
  return data.client_secret.value;
};

export function useRealtimeConnection({
  voiceMode,
  selectedVoice,
}: {
  voiceMode: boolean;
  selectedVoice: string;
}): RealtimeConnectionHook {
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  // const audioRef = useRef<HTMLAudioElement | null>(null);
  // const gotAudioTrackRef = useRef(false);

  /**
   * Initializes the peer connection, data channel, local media, etc.
   */
  const initConnection = useCallback(async () => {
    setLoading(true);
    setError(null);
    setConnected(false);

    try {
      const ephemeralKey = await fetchEphemeralKey(voiceMode, selectedVoice);

      // Create PeerConnection
      const pc = new RTCPeerConnection();
      pcRef.current = pc;

      /*       // Setup or reuse an <audio> for remote track
      let audioEl = audioRef.current;
      if (!audioEl) {
        audioEl = document.createElement('audio');
        audioEl.autoplay = true;
        audioRef.current = audioEl;
      }
      audioEl.srcObject = null;
      gotAudioTrackRef.current = false;

      // Handle remote track (the model's audio)
      pc.ontrack = event => {
        if (!gotAudioTrackRef.current && event.streams && event.streams[0]) {
          audioEl!.srcObject = event.streams[0];
          gotAudioTrackRef.current = true;
        }
      };

      // Add local audio track from microphone
      const localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      localStream.getTracks().forEach(track => {
        if (pc.signalingState !== 'closed') {
          pc.addTrack(track, localStream);
        }
      }); */

      // Create data channel for sending/receiving events
      const dc = pc.createDataChannel(DATA_CHANNEL_LABEL);
      dcRef.current = dc;

      dc.addEventListener('open', () => {
        setConnected(true);
      });

      dc.addEventListener('close', () => {
        setConnected(false);
        setError('Data channel closed unexpectedly. Please reconnect.');
      });

      // Message handler for server -> client events
      dc.addEventListener('message', e => {
        try {
          const event = JSON.parse(e.data);
          handleServerEvent(event);
        } catch (err) {
          console.error('Failed to parse server event', err);
        }
      });

      // Actually start the SDP handshake
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const sdpResponse = await fetch(
        `${BASE_REALTIME_URL}?model=${MODEL_ID}`,
        {
          method: 'POST',
          body: offer.sdp,
          headers: {
            Authorization: `Bearer ${ephemeralKey}`,
            'Content-Type': 'application/sdp',
          },
        },
      );

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
    } finally {
      setLoading(false);
    }
  }, [voiceMode, selectedVoice]);

  /**
   * Handle server events (JSON messages) from the Realtime API.
   */
  function handleServerEvent(event: ServerEvent) {
    setLoading(true);
    switch (event.type) {
      case 'response.text.delta':
        // Stream partial text
        setResponseText(prev => prev + (event.delta || ''));
        break;

      case 'response.done':
        // End of response
        setResponseText(prev => prev + (event.text || ''));
        break;

      // Handle other event types as needed
      // e.g. 'error', 'conversation.item.created', etc.

      default:
        // No-op or debug
        // console.log('Unhandled server event:', event);
        break;
    }
    setLoading(false);
  }

  /**
   * Sends a user message (prompt) to the Realtime API via the data channel.
   */
  const sendMessage = useCallback((prompt: string) => {
    setLoading(true);
    if (!dcRef.current) {
      setError('Data channel not established. Please reconnect.');
      return;
    }

    if (dcRef.current.readyState !== 'open') {
      setError('Data channel is not open. Please wait or reconnect.');
      return;
    }

    // Clear old response text for a fresh start
    setResponseText('');

    const userMsgEvent = {
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [{ type: 'input_text', text: prompt }],
      },
    };

    const responseEvent = {
      type: 'response.create',
      response: {
        modalities: ['text'],
      },
    };

    try {
      dcRef.current.send(JSON.stringify(userMsgEvent));
      dcRef.current.send(JSON.stringify(responseEvent));
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? `Failed to send message: ${err.message}`
          : 'Failed to send message due to an unknown error.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Attempt to reconnect by tearing down the current connection
   * and re-initializing.
   */
  const attemptReconnect = useCallback(() => {
    initConnection();
  }, [initConnection]);

  // Initialize connection on mount
  useEffect(() => {
    initConnection();
  }, [initConnection]);

  return {
    loading,
    connected,
    error,
    responseText,
    sendMessage,
    attemptReconnect,
  };
}
