'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ChatMessage,
  RealtimeTextDeltaEvent,
  RealtimeResponseDoneEvent,
  RealtimeFunctionCallDeltaEvent,
  RealtimeFileSearchResultsEvent,
  RealtimeServerEvent,
  turn_detection,
} from '@/lib/types/openai/openai';
import { setHeaderEmojiDefinition } from '@/lib/function-calls/definitions/set-header-emoji/set-header-emoji';
import { setThemeDefinition } from '@/lib/function-calls/definitions/set-theme/set-theme';
import { setHomePageContentDefinition } from '@/lib/function-calls/definitions/set-home-page-content/set-home-page-content';
import { useOpenAIDemoContext } from '@/lib/context/openai-demo-context/openai-demo-context';
import { tryParseJson } from '@/lib/utilities/json/try-parse-json/try-parse-json';
import { useCreateSession } from '@/hooks/openai/use-create-session/use-create-session';
import { handleFunctionCall } from '@/lib/utilities/realtime/handle-function-call/handle-function-call';

export function useRealtimeAPI() {
  // 1) React Query ephemeral key creation
  const {
    mutate: createSession,
    data: sessionData,
    isPending: sessionLoading,
    error: sessionError,
    reset: resetMutation,
  } = useCreateSession();

  const closeSessionAndConnection = useCallback(() => {
    if (dcRef.current) {
      dcRef.current.close();
    }
    if (pcRef.current) {
      pcRef.current.close();
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
  }, []);

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

  const { setHeaderEmoji, setTheme, setHomePageContent } =
    useOpenAIDemoContext();

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
  const handleResponseDone = useCallback(
    (evt: RealtimeResponseDoneEvent) => {
      console.log('handleResponseDone', evt);
      setFunctionCallBuffer('');

      // Check if there's a function call in output:
      const outputItems = evt.response?.output ?? [];
      const fnCall = outputItems.find(item => item.type === 'function_call');
      if (fnCall) {
        handleFunctionCall(
          fnCall,
          setHeaderEmoji,
          setTheme,
          setHomePageContent,
        );
      }

      setIsResponseInProgress(false);
    },
    [setHeaderEmoji, setTheme, setHomePageContent],
  );

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

  const refreshPage = useCallback(() => {
    window.location.reload();
  }, []);

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
          dcRef.current?.send(
            JSON.stringify({
              type: 'session.update',
              session: {
                turn_detection: null,
                modalities: ['text'],
                tools: [
                  setHeaderEmojiDefinition,
                  setThemeDefinition,
                  setHomePageContentDefinition,
                ],
                tool_choice: 'auto',
              },
            }),
          );
          break;
        case 'session.updated':
          console.log('[Session updated event]', parsed);
          break;
        case 'error':
          if (parsed.code === 'session_expired') {
            console.error('Session expired, refreshing...');
            refreshPage();
          } else {
            console.error('[Error event]', parsed);
          }
        default:
          console.log('[Unhandled event]', parsed);
      }
    },
    [
      refreshPage,
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

  const init = async () => {
    if (!ephemeralKey) return;
    setRtcLoading(true);

    pcRef.current = new RTCPeerConnection();

    // remote audio: create <audio>, attach ontrack
    let audioEl = audioRef.current;
    if (!audioEl) {
      audioEl = document.createElement('audio');
      audioEl.autoplay = true;
      audioRef.current = audioEl;
    }

    audioEl.srcObject = null;

    gotAudioTrackRef.current = false;

    pcRef.current.ontrack = event => {
      if (!gotAudioTrackRef.current && event.streams && event.streams[0]) {
        audioEl!.srcObject = event.streams[0];
        gotAudioTrackRef.current = true;
      }
    };

    let localStream: MediaStream;

    try {
      localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
    } catch (err) {
      console.error('Failed to get local audio stream:', err);
      setMicAccessError('Failed to access microphone');
      return;
    }

    localStream.getTracks().forEach(track => {
      pcRef.current?.addTrack(track, localStream);
    });

    localStreamRef.current = localStream;

    // create data channel
    dcRef.current = pcRef.current.createDataChannel('oai-events');

    dcRef.current.addEventListener('message', handleDataChannelMessage);

    const offer = await pcRef.current.createOffer();

    await pcRef.current.setLocalDescription(offer);

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

      await pcRef.current.setRemoteDescription({
        type: 'answer',
        sdp: answerSdp,
      });
    } catch (err) {
      console.error('Connection error:', err);
      setConnectionError('Failed to establish Realtime connection');
    } finally {
      setRtcLoading(false);
    }

    return () => {
      pcRef.current?.close();
    };
  };

  /* // 5d) init WebRTC once ephemeralKey is ready
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
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
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
  }, [ephemeralKey, handleDataChannelMessage]); */

  return {
    init,
    closeSessionAndConnection,

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
    refreshPage,
    sessionLoading,
    rtcLoading,

    // **NEW** -> We expose if the model is generating a response
    isResponseInProgress,

    updateSession,
    functionCallBuffer,
    provideFunctionOutput,
  };
}
