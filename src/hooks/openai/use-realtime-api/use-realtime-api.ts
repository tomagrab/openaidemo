'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ChatMessage,
  RealtimeTextDeltaEvent,
  RealtimeResponseDoneEvent,
  RealtimeFunctionCallDeltaEvent,
  RealtimeFileSearchResultsEvent,
  turn_detection,
} from '@/lib/types/openai/openai';
import { useOpenAIDemoContext } from '@/lib/context/openai-demo-context/openai-demo-context';
import { tryParseJson } from '@/lib/utilities/json/try-parse-json/try-parse-json';
import { useCreateSession } from '@/hooks/openai/use-create-session/use-create-session';
import { handleFunctionCall } from '@/lib/utilities/openai/realtime/handle-function-call/handle-function-call';

import { handleDataChannelMessage as handleEvent } from '@/lib/utilities/openai/realtime/handle-data-channel-message/handle-data-channel-message';
import { toast } from 'sonner';

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
      setIsDisconnected(true);
    }
    if (pcRef.current) {
      pcRef.current.close();
      setIsDisconnected(true);
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    setMessages([]);
  }, []);

  // 2) Local state
  const [ephemeralKey, setEphemeralKey] = useState<string | null>(null);
  const [isDisconnected, setIsDisconnected] = useState(false);
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

  const {
    setHeaderEmoji,
    setTheme,
    setHomePageContent,
    setUserLocation,
    setWeatherData,
    conversation,
    setConversation,
    addConversationItem,
  } = useOpenAIDemoContext();

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
          dcRef,
          fnCall,
          setHeaderEmoji,
          setTheme,
          setHomePageContent,
          setUserLocation,
          setWeatherData,
        );
      }

      setIsResponseInProgress(false);
    },
    [
      setHeaderEmoji,
      setTheme,
      setHomePageContent,
      setUserLocation,
      setWeatherData,
    ],
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

  // d) handleResponseFileSearchResults
  const handleResponseFileSearchResults = useCallback(
    (evt: RealtimeFileSearchResultsEvent) => {
      console.log('[File search results]', evt.results);
    },
    [],
  );

  const refreshPage = useCallback(() => {
    window.location.reload();
  }, []);

  const onDataChannelMessage = useCallback(
    (event: MessageEvent) => {
      handleEvent(event.data, {
        setIsResponseInProgress,
        conversation,
        setConversation,
        addConversationItem,
        handleDelta,
        handleResponseDone,
        handleFunctionCallDelta,
        handleResponseFileSearchResults,
        refreshPage,
        // Provide a function for session updates if you want:
        sendSessionUpdate: partialSession => {
          dcRef.current?.send(
            JSON.stringify({
              type: 'session.update',
              session: partialSession,
            }),
          );
        },
      });
    },
    [
      conversation,
      setConversation,
      addConversationItem,
      setIsResponseInProgress,
      handleDelta,
      handleResponseDone,
      handleFunctionCallDelta,
      handleResponseFileSearchResults,
      refreshPage,
    ],
  );

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

  const handleReconnect = async () => {
    setIsDisconnected(false);
    closeSessionAndConnection();
    // Possibly create ephemeral key again if needed
    createSession();
    // Then init
    init();
  };

  useEffect(() => {
    if (!sessionData && !sessionLoading && !sessionError) {
      createSession();
    }
  }, [createSession, sessionData, sessionLoading, sessionError]);

  const retryEphemeralKey = useCallback(() => {
    resetMutation();
    createSession();
  }, [createSession, resetMutation]);

  useEffect(() => {
    if (sessionData) {
      setEphemeralKey(sessionData.client_secret.value);
    }
  }, [sessionData]);

  const init = useCallback(async () => {
    if (!ephemeralKey) return;
    setRtcLoading(true);

    pcRef.current = new RTCPeerConnection();

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

    dcRef.current = pcRef.current.createDataChannel('oai-events');
    dcRef.current.addEventListener('message', onDataChannelMessage);

    dcRef.current.onclose = () => {
      console.log('Data channel closed');
      setIsDisconnected(true);
    };

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
  }, [ephemeralKey, onDataChannelMessage]);

  const handleSend = useCallback(() => {
    if (isDisconnected) {
      // show a toast or UI "Please reconnect"
      toast('Please reconnect to send messages');
      return;
    }

    if (!dcRef.current || !userInput.trim()) return;

    // 1) Check if data channel is open
    if (dcRef.current.readyState !== 'open') {
      console.warn('Data channel is not open. Attempting to re-init…');
      // Optionally show some toast: "Session expired, reconnecting…"

      // re-init the session
      closeSessionAndConnection(); // close old
      init(); // or do a new ephemeral key + init
      return; // or queue the userInput for sending after re-init
    }

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
  }, [userInput, closeSessionAndConnection, init, isDisconnected]);

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

    isResponseInProgress,

    handleReconnect,

    updateSession,
    functionCallBuffer,
    provideFunctionOutput,
  };
}
