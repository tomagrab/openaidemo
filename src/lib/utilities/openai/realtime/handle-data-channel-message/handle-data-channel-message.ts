import {
  RealtimeServerEvent,
  RealtimeTextDeltaEvent,
  RealtimeResponseDoneEvent,
  RealtimeFunctionCallDeltaEvent,
  RealtimeFileSearchResultsEvent,
} from '@/lib/types/openai/openai';

/**
 * A mapping of all possible server event types -> we handle them here.
 * We pass in callback references from your use-realtime-api, so that we can call
 * them for text deltas, function calls, etc.
 */
export function handleDataChannelMessage(
  eventData: unknown,
  options: {
    setIsResponseInProgress: (inProgress: boolean) => void;
    handleDelta: (evt: RealtimeTextDeltaEvent) => void;
    handleResponseDone: (evt: RealtimeResponseDoneEvent) => void;
    handleFunctionCallDelta: (evt: RealtimeFunctionCallDeltaEvent) => void;
    handleFileSearchResults: (evt: RealtimeFileSearchResultsEvent) => void;
    refreshPage: () => void;
    // If you have a DC ref, pass it in or pass a function to do "dcRef.send(...)"
    sendSessionUpdate?: (partialSession: Record<string, unknown>) => void;
  },
) {
  let parsed: RealtimeServerEvent;
  try {
    parsed = JSON.parse(String(eventData));
  } catch (err) {
    console.error('Could not parse message from data channel:', eventData, err);
    return;
  }

  // destructure options for convenience
  const {
    setIsResponseInProgress,
    handleDelta,
    handleResponseDone,
    handleFunctionCallDelta,
    handleFileSearchResults,
    refreshPage,
    sendSessionUpdate,
  } = options;

  // Switch on parsed.type
  switch (parsed.type) {
    //
    // 1) session
    //
    case 'session.created': {
      console.log('[session.created]', parsed);
      // Possibly do a default session.update after creation:
      if (sendSessionUpdate) {
        // You can send the default config, e.g. turning off voice, adding tools, etc.
        sendSessionUpdate({
          turn_detection: null,
          modalities: ['text'],
          // example tools
          tools: [
            // e.g. setHeaderEmojiDefinition,
            // setThemeDefinition,
            // setHomePageContentDefinition,
            // getWeatherDefinition,
          ],
          tool_choice: 'auto',
        });
      }
      return;
    }

    case 'session.updated': {
      console.log('[session.updated]', parsed);
      return;
    }

    //
    // 2) conversation
    //
    case 'conversation.created': {
      console.log('[conversation.created]', parsed);
      return;
    }
    case 'conversation.item.created': {
      console.log('[conversation.item.created]', parsed);
      return;
    }
    case 'conversation.item.truncated': {
      console.log('[conversation.item.truncated]', parsed);
      return;
    }
    case 'conversation.item.deleted': {
      console.log('[conversation.item.deleted]', parsed);
      return;
    }
    case 'conversation.item.input_audio_transcription.completed': {
      console.log(
        '[conversation.item.input_audio_transcription.completed]',
        parsed,
      );
      return;
    }
    case 'conversation.item.input_audio_transcription.failed': {
      console.log(
        '[conversation.item.input_audio_transcription.failed]',
        parsed,
      );
      return;
    }

    //
    // 3) input_audio_buffer
    //
    case 'input_audio_buffer.committed': {
      console.log('[input_audio_buffer.committed]', parsed);
      return;
    }
    case 'input_audio_buffer.cleared': {
      console.log('[input_audio_buffer.cleared]', parsed);
      return;
    }
    case 'input_audio_buffer.speech_started': {
      console.log('[input_audio_buffer.speech_started]', parsed);
      return;
    }
    case 'input_audio_buffer.speech_stopped': {
      console.log('[input_audio_buffer.speech_stopped]', parsed);
      return;
    }

    //
    // 4) response
    //
    case 'response.created': {
      console.log('[response.created]', parsed);
      setIsResponseInProgress(true);
      return;
    }
    case 'response.done': {
      console.log('[response.done]', parsed);
      handleResponseDone(parsed as RealtimeResponseDoneEvent);
      return;
    }
    case 'response.cancelled': {
      console.log('[response.cancelled]', parsed);
      // Possibly handle in-progress response cancellation
      return;
    }
    case 'response.text.delta': {
      // For partial streaming text
      handleDelta(parsed as RealtimeTextDeltaEvent);
      return;
    }
    case 'response.text.done': {
      console.log('[response.text.done]', parsed);
      return;
    }
    case 'response.audio_transcript.delta': {
      console.log('[response.audio_transcript.delta]', parsed);
      return;
    }
    case 'response.audio_transcript.done': {
      console.log('[response.audio_transcript.done]', parsed);
      return;
    }
    case 'response.audio.delta': {
      console.log('[response.audio.delta]', parsed);
      // You could handle partial audio streaming here
      return;
    }
    case 'response.audio.done': {
      console.log('[response.audio.done]', parsed);
      return;
    }
    case 'response.function_call_arguments.delta': {
      handleFunctionCallDelta(parsed as RealtimeFunctionCallDeltaEvent);
      return;
    }
    case 'response.function_call_arguments.done': {
      console.log('[response.function_call_arguments.done]', parsed);
      // If you want to do something once arguments are final
      return;
    }
    case 'response.output_item.added': {
      console.log('[response.output_item.added]', parsed);
      return;
    }
    case 'response.output_item.done': {
      console.log('[response.output_item.done]', parsed);
      return;
    }
    case 'response.content_part.added': {
      console.log('[response.content_part.added]', parsed);
      return;
    }
    case 'response.content_part.done': {
      console.log('[response.content_part.done]', parsed);
      return;
    }

    case 'file.search.results': {
      handleFileSearchResults(parsed as RealtimeFileSearchResultsEvent);
      return;
    }

    //
    // 5) rate limits
    //
    case 'rate_limits.updated': {
      console.log('[rate_limits.updated]', parsed);
      return;
    }

    //
    // 6) error
    //
    case 'error': {
      console.log('[error]', parsed);
      if (parsed.code === 'session_expired') {
        console.error('Session expired, refreshing...');
        refreshPage();
      } else {
        console.error('[Error event]', parsed);
      }
      return;
    }

    //
    // default
    //
    default: {
      console.log('[Unhandled event]', parsed);
      return;
    }
  }
}

function onSessionCreated(event: Extract<RealtimeServerEvent, { type: 'session.created' }>) {
    // 1) set or update some internal or global state
    //    e.g. store the session ID, update session config in a store, etc.
  
    // 2) Optionally update UI or show ephemeral message
    //    e.g. showToast("Session created! Session ID: " + event.session.id);
  }
  
  function onConversationCreated(event: Extract<RealtimeServerEvent, { type: 'conversation.created' }>) {
    // Possibly store conversation info, e.g. chat ID
  }
  
  function onResponseCreated(event: Extract<RealtimeServerEvent, { type: 'response.created' }>) {
    // Maybe set an internal “responseInProgress = true”
    // or update state to show “Assistant is thinking…”
  }
  
  // ...similar for input_audio_buffer.committed, etc.
  
