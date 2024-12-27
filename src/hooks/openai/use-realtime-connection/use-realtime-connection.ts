'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

// Base URL for your Next.js app (likely set in .env)
const BASE_APP_URL = process.env.NEXT_PUBLIC_BASE_APP_URL;

// Server route for ephemeral key (points to /api/openai/session)
const BASE_EPH_KEY_URL = '/api/openai/session';

// Base Realtime API endpoint
const BASE_REALTIME_URL = 'https://api.openai.com/v1/realtime';

// The default model ID to use
const MODEL_ID = 'gpt-4o-realtime-preview-2024-12-17';

// Label for the data channel
const DATA_CHANNEL_LABEL = 'oai-events';

interface RealtimeConnectionHook {
  loading: boolean;
  connected: boolean;
  error: string | null;
  responseText: string;
  sendMessage: (prompt: string) => void;
  attemptReconnect: () => void;
  // You can add more methods here if you want (e.g. sendAudio, toggleMute, etc.)
}

// Represents an event from the server. It can contain many different fields, so
// we keep it open-ended. The "type" is the main discriminator.
type ServerEvent = {
  type: string;
  message?: string;
  session?: unknown;
  delta?: string;
  text?: string;
  response?: {
    output?: Array<{
      type: string;
      [key: string]: unknown;
    }>;
  };
  [key: string]: unknown;
};

/**
 * buildSessionUrl
 * Constructs a query to your /api/openai/session endpoint so you can fetch an
 * ephemeral key. If voiceMode is true, we pass both text & audio modalities and
 * set the selected voice. Otherwise, we pass only text.
 */
const buildSessionUrl = (voiceMode: boolean, selectedVoice: string) => {
  const url = new URL(BASE_EPH_KEY_URL, BASE_APP_URL);

  // Clear existing to avoid stacking params
  url.searchParams.delete('modalities');
  url.searchParams.delete('voice');

  if (voiceMode) {
    // We want both audio + text
    url.searchParams.append('modalities', 'audio');
    url.searchParams.append('modalities', 'text');
    url.searchParams.set('voice', selectedVoice);
  } else {
    // Only text
    url.searchParams.append('modalities', 'text');
  }

  return url;
};

/**
 * fetchEphemeralKey
 * Grabs a fresh ephemeral key from your Next.js server route.
 * Ephemeral keys are valid for ~1 minute, so if you reconnect
 * after some time, you'll fetch a new one.
 */
const fetchEphemeralKey = async (
  voiceMode: boolean,
  selectedVoice: string,
): Promise<string> => {
  const reqUrl = buildSessionUrl(voiceMode, selectedVoice);

  const res = await fetch(reqUrl.toString(), { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Failed to fetch ephemeral key');
  }
  const data = await res.json();
  // The ephemeral key is typically at data.client_secret.value
  return data.client_secret.value;
};

export function useRealtimeConnection({
  voiceMode,
  selectedVoice,
}: {
  voiceMode: boolean;
  selectedVoice: string;
}): RealtimeConnectionHook {
  // Loading = whether we are establishing or processing a new request
  const [loading, setLoading] = useState(false);

  // Connected = once data channel is open, we say we’re “connected”
  const [connected, setConnected] = useState(false);

  // Store partial or full response text that is streaming from the model
  const [responseText, setResponseText] = useState('');

  // Track if we have encountered an error
  const [error, setError] = useState<string | null>(null);

  // RTCPeerConnection and RTCDataChannel references
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);

  // A ref for the <audio> element that will play the model’s voice
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // A flag to ensure we only attach the remote audio track once
  const gotAudioTrackRef = useRef(false);

  /**
   * handleFunctionCall
   *  - If the model chooses to call a function (function_call),
   *    you can parse the arguments and do something (like calling an external API).
   *  - Then you can send the "function_call_output" item back to the model,
   *    followed by a "response.create" if you want a final text answer from it.
   */
  interface FunctionCallItem {
    name: string;
    call_id: string;
    arguments: string;
    type: string;
  }

  const handleFunctionCall = useCallback(
    (funcItem: FunctionCallItem) => {
      try {
        // For example, the function name is in funcItem.name
        // The JSON arguments are in funcItem.arguments
        const fnName = funcItem.name;
        const callId = funcItem.call_id; // needed to respond
        const args = JSON.parse(funcItem.arguments);

        console.log(`Model wants to call function: ${fnName}`, args);

        // Execute your local code or an external API here.
        // For demonstration, let's produce a pretend "result" data.
        const sampleResult = {
          message: `Hello from function ${fnName}, you passed: ${JSON.stringify(
            args,
          )}`,
        };

        // Then send the function_call_output item back to the Realtime API
        const funcEvent = {
          type: 'conversation.item.create',
          item: {
            // Must be "function_call_output"
            type: 'function_call_output',
            call_id: callId,
            // Must be JSON string
            output: JSON.stringify(sampleResult),
          },
        };
        dcRef.current?.send(JSON.stringify(funcEvent));

        // Optionally, ask the model to respond now that it has the function result
        const respEvent = {
          type: 'response.create',
          response: {
            // If you have voice enabled, or both text and audio
            modalities: voiceMode ? ['audio', 'text'] : ['text'],
          },
        };
        dcRef.current?.send(JSON.stringify(respEvent));
      } catch (err) {
        console.error('Failed to handle function call:', err);
      }
    },
    [voiceMode],
  );

  /**
   * handleServerEvent
   *  - This function interprets messages from the Realtime API over the data channel.
   *  - We can listen for:
   *      session.created / session.updated
   *      response.text.delta
   *      response.text.done
   *      response.done
   *      function calls (function_call)
   *      error events
   *      etc.
   */
  const handleServerEvent = useCallback(
    (event: ServerEvent) => {
      // You might not always want to setLoading(true) here,
      // but if you want to show some spinner while processing, that’s fine
      setLoading(true);

      switch (event.type) {
        case 'session.created':
          // The Realtime session is ready for conversation
          // Optionally store event.session in your state or log it
          console.log('Session created:', event.session);
          break;

        case 'session.updated':
          // The session instructions or parameters changed
          console.log('Session updated:', event.session);
          break;

        case 'response.text.delta':
          // The model is streaming partial text tokens
          setResponseText(prev => prev + (event.delta || ''));
          break;

        case 'response.done':
          // The model’s text generation is finished
          // If event.text is provided, append any last chunk
          if (event.text) {
            setResponseText(prev => prev + event.text);
          }
          // You could also parse event.response or event.response.output if needed
          break;

        case 'response.function_call_arguments.delta':
          // If the model is sending partial function call arguments, handle them
          // Combine deltas until you have the complete JSON
          break;

        case 'response.done':
          // Check if there's a function call in the final output
          if (
            event.response &&
            event.response.output &&
            Array.isArray(event.response.output)
          ) {
            const outputItem = event.response.output.find(
              (o: { type: string; [key: string]: unknown }) =>
                o.type === 'function_call',
            );
            if (
              outputItem &&
              typeof outputItem.name === 'string' &&
              typeof outputItem.call_id === 'string' &&
              typeof outputItem.arguments === 'string'
            ) {
              handleFunctionCall({
                name: outputItem.name,
                call_id: outputItem.call_id,
                arguments: outputItem.arguments,
                type: outputItem.type,
              });
            }
          }
          break;

        case 'error':
        case 'invalid_request_error':
          // The server encountered an error, or our client event was invalid
          console.error('Error from server:', event);
          setError(
            event.message || 'An error occurred in the Realtime session.',
          );
          break;

        default:
          // Some events you might see:
          //   conversation.item.created
          //   input_audio_buffer.speech_started
          //   input_audio_buffer.speech_stopped
          //   ...
          console.log('Unhandled server event type:', event.type, event);
          break;
      }

      setLoading(false);
    },
    [handleFunctionCall],
  );

  /**
   * initConnection
   *  - Fetches an ephemeral key
   *  - Creates a PeerConnection (pc)
   *  - Grabs the local audio track
   *  - Creates a data channel
   *  - Handles server events on that data channel
   *  - Performs the SDP Offer/Answer
   */
  const initConnection = useCallback(async () => {
    setLoading(true);
    setError(null);
    setConnected(false);

    try {
      // 1. Get ephemeral key
      const ephemeralKey = await fetchEphemeralKey(voiceMode, selectedVoice);

      // 2. Tear down any existing connection if still active
      if (dcRef.current) {
        dcRef.current.close();
        dcRef.current = null;
      }
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }

      // 3. Create a new RTCPeerConnection
      const pc = new RTCPeerConnection();
      pcRef.current = pc;

      // 4. Handle the model's incoming audio track
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

      // 5. Get local microphone (if voiceMode = false, still do it, so we can talk if needed)
      let localStream: MediaStream;
      try {
        localStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
      } catch {
        setError('User denied microphone permissions or an error occurred.');
        setLoading(false);
        return;
      }

      // 6. Add local mic tracks to RTCPeerConnection
      localStream.getTracks().forEach(track => {
        if (pc.signalingState !== 'closed') {
          pc.addTrack(track, localStream);
        }
      });

      // 7. Create a DataChannel for text-based communication
      const dc = pc.createDataChannel(DATA_CHANNEL_LABEL);
      dcRef.current = dc;

      dc.onopen = () => {
        setConnected(true);
      };

      dc.onclose = () => {
        setConnected(false);
        setError('Data channel closed unexpectedly. Please reconnect.');
      };

      dc.onmessage = e => {
        try {
          const event: ServerEvent = JSON.parse(e.data);
          handleServerEvent(event);
        } catch (err) {
          console.error('Failed to parse server event', err);
        }
      };

      // 8. Create an SDP Offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // 9. Send Offer to the Realtime API
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
        throw new Error('Failed to establish SDP connection with Realtime API');
      }

      // 10. Parse the Answer from Realtime API
      const answer: RTCSessionDescriptionInit = {
        type: 'answer',
        sdp: await sdpResponse.text(),
      };

      // 11. Set the remote description
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
  }, [voiceMode, selectedVoice, handleServerEvent]);

  /**
   * sendMessage
   *  - Takes a text prompt from the user
   *  - Creates a conversation.item.create to add the user's message
   *  - Then triggers a response.create to have the model respond
   */
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

      // Clear existing text so we can watch new text stream in
      setResponseText('');

      // We are sending a user item (like a chat message)
      const userMsgEvent = {
        type: 'conversation.item.create',
        item: {
          type: 'message',
          role: 'user',
          content: [{ type: 'input_text', text: prompt }],
        },
      };

      // Next, we ask the model to respond
      const responseEvent = {
        type: 'response.create',
        response: {
          // If voiceMode is active, we might want both audio & text
          modalities: voiceMode ? ['audio', 'text'] : ['text'],
          // Optionally, you can pass instructions or input array here
          // instructions: "...", input: [...]
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
      }
    },
    [voiceMode],
  );

  /**
   * attemptReconnect
   *  - Closes any existing connections
   *  - Calls initConnection() to rebuild everything
   */
  const attemptReconnect = useCallback(() => {
    initConnection();
  }, [initConnection]);

  useEffect(() => {
    initConnection();

    // Optionally, return a cleanup function to close the connection on unmount
    return () => {
      if (dcRef.current) {
        dcRef.current.close();
      }
      if (pcRef.current) {
        pcRef.current.close();
      }
    };
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
