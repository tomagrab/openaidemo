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
} from '@/lib/types/openai/openai';

/************************************************
 * The Hook: useRealtimeAPI()
 ************************************************/
export function useRealtimeAPI() {
  /************************************************
   * 1) React Query mutation to create ephemeral key
   ************************************************/
  const {
    mutate: createSession,
    data: sessionData,
    error: sessionError,
    isPending: sessionLoading,
  } = useMutation<EphemeralKey, unknown, void>({
    mutationFn: async () => {
      const response = await fetch('/api/openai/session', {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error(
          `Failed to create ephemeral key: ${response.statusText}`,
        );
      }
      return response.json();
    },
  });

  /************************************************
   * 2) Local state
   ************************************************/
  const [ephemeralKey, setEphemeralKey] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');

  // References to the PeerConnection, DataChannel
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);

  /************************************************
   * 3) Handlers for Realtime events
   ************************************************/
  const handleDelta = useCallback((evt: RealtimeTextDeltaEvent) => {
    const deltaText = evt.delta;
    setMessages(old => {
      const lastMsg = old[old.length - 1];
      if (!lastMsg || lastMsg.role !== 'assistant') {
        return [
          ...old,
          { id: crypto.randomUUID(), role: 'assistant', content: deltaText },
        ];
      } else {
        const updatedLast = {
          ...lastMsg,
          content: lastMsg.content + deltaText,
        };
        return [...old.slice(0, old.length - 1), updatedLast];
      }
    });
  }, []);

  const handleResponseDone = useCallback((evt: RealtimeResponseDoneEvent) => {
    // Possibly handle final text from evt.response?.output
    console.log('handleResponseDone', evt);
  }, []);

  const handleFunctionCallDelta = useCallback(
    (evt: RealtimeFunctionCallDeltaEvent) => {
      console.log('[Function call partial]', evt.delta);
      // TODO: handle function-call arguments
    },
    [],
  );

  const handleFileSearchResults = useCallback(
    (evt: RealtimeFileSearchResultsEvent) => {
      console.log('[File search results]', evt.results);
      // TODO: store file search results in state if needed
    },
    [],
  );

  // Single entry point for all datachannel messages
  const handleDataChannelMessage = useCallback(
    (event: MessageEvent) => {
      let parsed: RealtimeServerEvent;
      try {
        parsed = JSON.parse(event.data) as RealtimeServerEvent;
      } catch (err) {
        console.error(
          'Could not parse message from data channel:',
          event.data,
          err,
        );
        return;
      }

      switch (parsed.type) {
        case 'response.text.delta':
          if ('delta' in parsed) {
            handleDelta(parsed as RealtimeTextDeltaEvent);
          }
          break;
        case 'response.done':
          handleResponseDone(parsed as RealtimeResponseDoneEvent);
          break;
        case 'response.function_call_arguments.delta':
          if ('delta' in parsed) {
            handleFunctionCallDelta(parsed as RealtimeFunctionCallDeltaEvent);
          }
          break;
        case 'file.search.results':
          if ('results' in parsed) {
            handleFileSearchResults(parsed as RealtimeFileSearchResultsEvent);
          }
          break;
        default:
          console.log('[Unhandled event]', parsed);
          break;
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
   * 4) Send a message to the Realtime API
   ************************************************/
  const handleSend = useCallback(() => {
    if (!dcRef.current) return;
    if (!userInput.trim()) return;

    // Add user message to local state
    const newUserMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: userInput.trim(),
    };
    setMessages(old => [...old, newUserMsg]);

    // conversation.item.create
    const conversationItem = {
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: userInput.trim(),
          },
        ],
      },
    };
    dcRef.current.send(JSON.stringify(conversationItem));

    // response.create
    const responseCreate = {
      type: 'response.create',
      response: { modalities: ['text'] },
    };
    dcRef.current.send(JSON.stringify(responseCreate));

    // reset local user input
    setUserInput('');
  }, [userInput]);

  /************************************************
   * 5) Effects to manage ephemeral key & WebRTC
   ************************************************/
  // 5a) Request ephemeral key on mount
  useEffect(() => {
    // Only create session if we haven't already
    if (!sessionData && !sessionLoading && !sessionError) {
      createSession();
    }
  }, [createSession, sessionData, sessionLoading, sessionError]);

  // 5b) Once ephemeral key arrives, store it
  useEffect(() => {
    if (sessionData) {
      setEphemeralKey(sessionData.client_secret.value);
    }
  }, [sessionData]);

  // 5c) Initialize PeerConnection once ephemeral key is ready
  useEffect(() => {
    if (!ephemeralKey) return;

    const init = async () => {
      pcRef.current = new RTCPeerConnection();

      // Optional: remote audio
      const audioEl = document.createElement('audio');
      audioEl.autoplay = true;
      pcRef.current.ontrack = e => {
        audioEl.srcObject = e.streams[0];
      };

      // Optional: local audio track
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        stream.getAudioTracks().forEach(track => {
          pcRef.current?.addTrack(track, stream);
        });
      } catch (err) {
        console.warn('Could not get user media:', err);
      }

      // DataChannel
      dcRef.current = pcRef.current.createDataChannel('oai-events');
      dcRef.current.addEventListener('message', handleDataChannelMessage);

      // Create offer, setLocalDescription, send to Realtime API
      const offer = await pcRef.current.createOffer();
      await pcRef.current.setLocalDescription(offer);

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
      const answerSdp = await sdpResponse.text();

      // set remote desc
      const answer: RTCSessionDescriptionInit = {
        type: 'answer',
        sdp: answerSdp,
      };
      await pcRef.current.setRemoteDescription(answer);
    };

    init();

    // Cleanup
    return () => {
      pcRef.current?.close();
    };
  }, [ephemeralKey, handleDataChannelMessage]);

  /************************************************
   * 6) Return the stuff our UI components need
   ************************************************/
  return {
    messages, // all current conversation messages
    userInput, // current typed input
    setUserInput, // to update typed input in the UI
    handleSend, // send a new user message to the model
    sessionError, // any error from ephemeral key creation
    sessionLoading, // whether ephemeral key is being created
  };
}
