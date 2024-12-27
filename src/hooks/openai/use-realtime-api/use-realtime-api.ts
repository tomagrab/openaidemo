'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  ChatMessage,
  EphemeralKey,
  RealtimeTextDeltaEvent,
  RealtimeResponseDoneEvent,
  RealtimeFunctionCallDeltaEvent,
  RealtimeFileSearchResultsEvent,
  RealtimeServerEvent,
  turn_detection,
} from '@/lib/types/openai/openai';

export function useRealtimeAPI() {
  // 1) React Query ephemeral key creation
  const {
    mutate: createSession,
    data: sessionData,
    error: sessionError,
    isPending: sessionLoading,
    reset: resetMutation,
  } = useMutation<EphemeralKey, unknown, void>({
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

  // 2) Local state
  const [ephemeralKey, setEphemeralKey] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [turnDetection, setTurnDetection] = useState<turn_detection>(null); // OFF by default
  const [userInput, setUserInput] = useState('');
  const [rtcLoading, setRtcLoading] = useState(false);
  const [isResponseInProgress, setIsResponseInProgress] = useState(false);

  const [micAccessError, setMicAccessError] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [functionCallBuffer, setFunctionCallBuffer] = useState('');

  // Refs for PeerConnection, DataChannel, local mic stream
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const gotAudioTrackRef = useRef(false);

  /************************************************
   * Utility: parse JSON-like text if present
   ************************************************/
  function tryParseJson(str: string): string {
    // If the model returns a JSON string like {"text":"something"},
    // we can attempt to parse it and extract the "text".
    // If parse fails, just return the raw string.
    try {
      // If it is something like: {"text":"Hello world"}
      const parsed = JSON.parse(str);
      // If we see parsed.text, we can return it
      if (parsed && typeof parsed === 'object' && 'text' in parsed) {
        return parsed.text;
      }
      // else return original
      return str;
    } catch {
      return str;
    }
  }

  /************************************************
   * 3) Handlers for Realtime events
   ************************************************/
  // a) handleDelta
  const handleDelta = useCallback((evt: RealtimeTextDeltaEvent) => {
    const partial = tryParseJson(evt.delta);
    setMessages(old => {
      const lastMsg = old[old.length - 1];
      if (!lastMsg || lastMsg.role !== 'assistant') {
        return [
          ...old,
          { id: crypto.randomUUID(), role: 'assistant', content: partial },
        ];
      } else {
        const updatedLast = { ...lastMsg, content: lastMsg.content + partial };
        return [...old.slice(0, old.length - 1), updatedLast];
      }
    });
  }, []);

  // b) handleResponseDone
  const handleResponseDone = useCallback((evt: RealtimeResponseDoneEvent) => {
    console.log('handleResponseDone', evt);
    setFunctionCallBuffer('');
    setIsResponseInProgress(false);
  }, []);

  // c) handleFunctionCallDelta
  const handleFunctionCallDelta = useCallback(
    (evt: RealtimeFunctionCallDeltaEvent) => {
      if (evt.delta) {
        setFunctionCallBuffer(old => old + evt.delta);
      }
    },
    [],
  );

  // d) handleFileSearchResults
  const handleFileSearchResults = useCallback(
    (evt: RealtimeFileSearchResultsEvent) => {
      console.log('[File search results]', evt.results);
    },
    [],
  );

  // single entry for data channel messages
  const handleDataChannelMessage = useCallback(
    (event: MessageEvent) => {
      let parsed: RealtimeServerEvent;
      try {
        parsed = JSON.parse(event.data);
      } catch (err) {
        console.error(
          'Could not parse message from data channel:',
          event.data,
          err,
        );
        return;
      }

      switch (parsed.type) {
        case 'response.created':
          setIsResponseInProgress(true);
          break;
        case 'response.text.delta':
          handleDelta(parsed as RealtimeTextDeltaEvent);
          break;
        case 'response.done':
          handleResponseDone(parsed as RealtimeResponseDoneEvent);
          break;
        case 'response.function_call_arguments.delta':
          handleFunctionCallDelta(parsed as RealtimeFunctionCallDeltaEvent);
          break;
        case 'file.search.results':
          handleFileSearchResults(parsed as RealtimeFileSearchResultsEvent);
          break;
        case 'session.created':
          console.log('[Session created event]', parsed);
          // Force turn_detection: null if we want no VAD at start
          dcRef.current?.send(
            JSON.stringify({
              type: 'session.update',
              session: {
                turn_detection: null,
                // keep text only
                modalities: ['text'],
              },
            }),
          );
          break;
        case 'session.updated':
          console.log('[Session updated event]', parsed);
          break;
        default:
          console.log('[Unhandled event]', parsed);
      }
    },
    [
      handleDelta,
      handleResponseDone,
      handleFunctionCallDelta,
      handleFileSearchResults,
    ],
  );

  /************************************************
   * 4) Send messages
   ************************************************/
  const handleSend = useCallback(() => {
    if (!dcRef.current || !userInput.trim()) return;
    const newUserMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: userInput.trim(),
    };
    setMessages(old => [...old, newUserMsg]);

    dcRef.current.send(
      JSON.stringify({
        type: 'conversation.item.create',
        item: {
          type: 'message',
          role: 'user',
          content: [{ type: 'input_text', text: userInput.trim() }],
        },
      }),
    );

    dcRef.current.send(
      JSON.stringify({
        type: 'response.create',
        response: { modalities: ['text'] },
      }),
    );

    setUserInput('');
  }, [userInput]);

  // update session
  const updateSession = useCallback((newParams: Record<string, unknown>) => {
    if (!dcRef.current) return;
    dcRef.current.send(
      JSON.stringify({
        type: 'session.update',
        session: {
          ...newParams,
        },
      }),
    );
  }, []);

  // toggle VAD mode
  const toggleVADMode = useCallback(async () => {
    if (!dcRef.current) return;
    if (turnDetection) {
      setTurnDetection(null);
      updateSession({
        turn_detection: null,
        modalities: ['text'],
      });
    } else {
      const newVAD: turn_detection = {
        type: 'server_vad',
      };
      setTurnDetection(newVAD);
      updateSession({
        turn_detection: newVAD,
        modalities: ['audio', 'text'],
      });
    }
  }, [turnDetection, updateSession]);

  // Provide function call output
  const provideFunctionOutput = useCallback(
    (callId: string, outputObj: Record<string, unknown>) => {
      if (!dcRef.current) return;
      dcRef.current.send(
        JSON.stringify({
          type: 'conversation.item.create',
          item: {
            type: 'function_call_output',
            call_id: callId,
            output: JSON.stringify(outputObj),
          },
        }),
      );
      dcRef.current.send(JSON.stringify({ type: 'response.create' }));
    },
    [],
  );

  /************************************************
   * 5) Effects to manage ephemeral key & WebRTC
   ************************************************/
  // 5a) create ephemeral key on mount
  useEffect(() => {
    if (!sessionData && !sessionLoading && !sessionError) {
      createSession();
    }
  }, [createSession, sessionData, sessionLoading, sessionError]);

  // 5b) retry ephemeral key if user clicks "Retry"
  const retryEphemeralKey = useCallback(() => {
    resetMutation();
    createSession();
  }, [createSession, resetMutation]);

  // 5c) once ephemeral key arrives, store it
  useEffect(() => {
    if (sessionData) {
      setEphemeralKey(sessionData.client_secret.value);
    }
  }, [sessionData]);

  // 5d) init WebRTC once ephemeralKey is ready
  useEffect(() => {
    if (!ephemeralKey) return;

    let pc: RTCPeerConnection | null = null;
    const init = async () => {
      setRtcLoading(true);
      pc = new RTCPeerConnection();

      // remote audio: create <audio>, attach ontrack
      let audioEl = audioRef.current;
      if (!audioEl) {
        audioEl = document.createElement('audio');
        audioEl.autoplay = true;
        audioRef.current = audioEl;
      }
      audioEl.srcObject = null;
      gotAudioTrackRef.current = false;

      pc.ontrack = event => {
        // When the model sends an audio track, attach it to <audio>
        if (!gotAudioTrackRef.current && event.streams && event.streams[0]) {
          audioEl!.srcObject = event.streams[0];
          gotAudioTrackRef.current = true;
        }
      };

      let localStream: MediaStream;
      try {
        localStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
      } catch (err) {
        console.error('Failed to get local audio stream:', err);
        setMicAccessError('Failed to access microphone');
        return;
      }

      // Add local audio track to peer connection
      localStream.getTracks().forEach(track => {
        pc?.addTrack(track, localStream);
      });

      localStreamRef.current = localStream;

      pcRef.current = pc;

      // create data channel
      dcRef.current = pc.createDataChannel('oai-events');
      dcRef.current.addEventListener('message', handleDataChannelMessage);

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      try {
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
          throw new Error(`SDP request failed: ${sdpResponse.statusText}`);
        }

        const answerSdp = await sdpResponse.text();
        await pc.setRemoteDescription({ type: 'answer', sdp: answerSdp });
      } catch (err) {
        console.error('Connection error:', err);
        setConnectionError('Failed to establish Realtime connection');
      } finally {
        setRtcLoading(false);
      }
    };

    init();

    return () => {
      pc?.close();
    };
  }, [ephemeralKey, handleDataChannelMessage]);

  return {
    messages,
    userInput,
    setUserInput,
    handleSend,
    turnDetection,
    toggleVADMode,
    sessionError,
    micAccessError,
    connectionError,
    retryEphemeralKey,
    sessionLoading,
    rtcLoading,

    // **NEW** -> We expose if the model is generating a response
    isResponseInProgress,

    updateSession,
    functionCallBuffer,
    provideFunctionOutput,
  };
}
