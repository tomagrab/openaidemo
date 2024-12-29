import { toast } from 'sonner';

import {
  RealtimeServerEvent,
  RealtimeTextDeltaEvent,
  RealtimeResponseDoneEvent,
  RealtimeFunctionCallDeltaEvent,
  RealtimeFileSearchResultsEvent,
  ConversationItemCreatedEvent,
} from '@/lib/types/openai/openai';

import type { ConversationState } from '@/lib/types/openai/realtime/conversation/conversation-state/conversation-state';
import type { ConversationItem } from '@/lib/types/openai/realtime/conversation/conversation-item/conversation-item';
import { setHeaderEmojiDefinition } from '@/lib/function-calls/definitions/set-header-emoji/set-header-emoji';
import { setThemeDefinition } from '@/lib/function-calls/definitions/set-theme/set-theme';
import { setHomePageContentDefinition } from '@/lib/function-calls/definitions/set-home-page-content/set-home-page-content';
import { getWeatherDefinition } from '@/lib/function-calls/definitions/get-weather-definition/get-weather-definition';

function handleSessionCreated(
  // we can define a 'SessionCreatedEvent' if you want more detail, or just cast
  event: RealtimeServerEvent & {
    type: 'session.created';
    session: Record<string, unknown>;
  },
  opts: {
    sendSessionUpdate?: (partialSession: Record<string, unknown>) => void;
  },
) {
  // Possibly store session or do initial session.update
  if (opts.sendSessionUpdate) {
    opts.sendSessionUpdate({
      turn_detection: null,
      modalities: ['text'],
      tools: [
        setHeaderEmojiDefinition,
        setThemeDefinition,
        setHomePageContentDefinition,
        getWeatherDefinition,
      ],
      tool_choice: 'auto',
    });
  }
}

function handleSessionUpdated(
  event: RealtimeServerEvent & {
    type: 'session.updated';
    session: Record<string, unknown>;
  },
) {
  console.log('Session updated:', event);
  toast.success('Session updated');
}

function handleConversationCreated(
  event: RealtimeServerEvent & {
    type: 'conversation.created';
    conversation: { id: string };
  },
  setConversation: React.Dispatch<
    React.SetStateAction<ConversationState | null>
  >,
) {
  setConversation({
    id: event.conversation.id,
    items: [],
  });
  toast.success(`Conversation created: ${event.conversation.id}`);
}

function handleConversationItemCreated(
  event: ConversationItemCreatedEvent,
  contextMethods: {
    conversation: ConversationState | null;
    setConversation: React.Dispatch<
      React.SetStateAction<ConversationState | null>
    >;
    addConversationItem: (item: ConversationItem) => void;
  },
) {
  // Build a local "ConversationItem" from the event
  const newItem: ConversationItem = {
    id: event.item.id,
    type: event.item.type,
    // fallback role if none specified
    role: event.item.role || 'assistant',
    content: '',
  };

  // If there is text content, gather it
  if (event.item.content && event.item.content.length > 0) {
    const textParts = event.item.content
      .filter(part => part.type === 'text' || part.type === 'input_text')
      .map(part => part.text || '')
      .join(' ');
    newItem.content = textParts;
  }

  contextMethods.addConversationItem(newItem);
  toast.success(`New conversation item: ${newItem.id}`);
}

// placeholders for truncated, etc.
function handleConversationItemTruncated(
  event: RealtimeServerEvent & { type: 'conversation.item.truncated' },
) {
  toast('Conversation item truncated');
  console.log('Conversation item truncated:', event);
}
function handleConversationItemDeleted(
  event: RealtimeServerEvent & { type: 'conversation.item.deleted' },
) {
  toast('Conversation item deleted');
  console.log('Conversation item deleted:', event);
}
function handleConversationItemInputAudioTranscriptionCompleted(
  event: RealtimeServerEvent & {
    type: 'conversation.item.input_audio_transcription.completed';
  },
) {
  toast('Audio transcription completed');
  console.log('Audio transcription completed:', event);
}
function handleConversationItemInputAudioTranscriptionFailed(
  event: RealtimeServerEvent & {
    type: 'conversation.item.input_audio_transcription.failed';
  },
) {
  toast.error('Audio transcription failed');
  console.log('Audio transcription failed:', event);
}

function handleInputAudioBufferCommitted(
  event: RealtimeServerEvent & { type: 'input_audio_buffer.committed' },
) {
  toast('Audio buffer committed');
  console.log('Audio buffer committed:', event);
}
function handleInputAudioBufferCleared(
  event: RealtimeServerEvent & { type: 'input_audio_buffer.cleared' },
) {
  toast('Audio buffer cleared');
  console.log('Audio buffer cleared:', event);
}
function handleInputAudioBufferSpeechStarted(
  event: RealtimeServerEvent & { type: 'input_audio_buffer.speech_started' },
) {
  toast('Speech started');
  console.log('Speech started:', event);
}
function handleInputAudioBufferSpeechStopped(
  event: RealtimeServerEvent & { type: 'input_audio_buffer.speech_stopped' },
) {
  toast('Speech stopped');
  console.log('Speech stopped:', event);
}

function handleResponseCreated(
  event: RealtimeServerEvent & { type: 'response.created' },
  setIsResponseInProgress: (val: boolean) => void,
) {
  setIsResponseInProgress(true);
}

// We pass the final event to the user’s callback
function handleResponseDone(
  event: RealtimeResponseDoneEvent,
  userCallback: (evt: RealtimeResponseDoneEvent) => void,
) {
  userCallback(event);
}

function handleResponseCancelled(
  event: RealtimeServerEvent & { type: 'response.cancelled' },
) {
  toast('Response cancelled');
  console.log('Response cancelled: ', event);
}

/**
 * For text streaming
 */
function handleResponseTextDelta(
  event: RealtimeTextDeltaEvent,
  userCallback: (evt: RealtimeTextDeltaEvent) => void,
) {
  userCallback(event);
}
function handleResponseTextDone(
  event: RealtimeServerEvent & { type: 'response.text.done' },
) {
  toast('response.text.done');
  console.log('response.text.done: ', event);
}

/**
 * For audio transcripts
 */
function handleResponseAudioTranscriptDelta(
  event: RealtimeServerEvent & { type: 'response.audio_transcript.delta' },
) {
  toast('Audio transcript delta');
  console.log('Audio transcript delta: ', event);
}
function handleResponseAudioTranscriptDone(
  event: RealtimeServerEvent & { type: 'response.audio_transcript.done' },
) {
  toast('Audio transcript done');
  console.log('Audio transcript done: ', event);
}

/**
 * For streaming audio
 */
function handleResponseAudioDelta(
  event: RealtimeServerEvent & { type: 'response.audio.delta' },
) {
  toast('Audio delta arrived');
  console.log('Audio delta: ', event);
}
function handleResponseAudioDone(
  event: RealtimeServerEvent & { type: 'response.audio.done' },
) {
  toast('Audio done streaming');
  console.log('Audio done: ', event);
}

/**
 * For function call argument streaming
 */
function handleResponseFunctionCallArgumentsDelta(
  event: RealtimeFunctionCallDeltaEvent,
  userCallback: (evt: RealtimeFunctionCallDeltaEvent) => void,
) {
  userCallback(event);
}
function handleResponseFunctionCallArgumentsDone(
  event: RealtimeServerEvent & {
    type: 'response.function_call_arguments.done';
  },
) {
  toast('Function call arguments done');
  console.log('Function call arguments done: ', event);
}

/**
 * For newly added items mid-response, or content parts
 */
function handleResponseOutputItemAdded(
  event: RealtimeServerEvent & { type: 'response.output_item.added' },
) {
  toast('Response output item added');
  console.log('Response output item added: ', event);
}
function handleResponseOutputItemDone(
  event: RealtimeServerEvent & { type: 'response.output_item.done' },
) {
  toast('Response output item done');
  console.log('Response output item done: ', event);
}
function handleResponseContentPartAdded(
  event: RealtimeServerEvent & { type: 'response.content_part.added' },
) {
  toast('Response content part added');
  console.log('Response content part added: ', event);
}
function handleResponseContentPartDone(
  event: RealtimeServerEvent & { type: 'response.content_part.done' },
) {
  toast('Response content part done');
  console.log('Response content part done: ', event);
}

/**
 * file.search.results
 */
function handleFileSearchResults(evt: RealtimeFileSearchResultsEvent) {
  // do whatever you like
  toast.success(`File search results: ${evt.results?.length || 0} found`);
}

/**
 * rate_limits.updated
 */
function handleRateLimitsUpdated(
  event: RealtimeServerEvent & { type: 'rate_limits.updated' },
) {
  toast(`Rate limits updated`);
  console.log('Rate limits updated:', event);
}

/**
 * error
 */
function handleErrorEvent(
  event: RealtimeServerEvent & { type: 'error'; code?: string },
  refreshPage: () => void,
) {
  if (event.code === 'session_expired') {
    toast.error('Session expired. Reloading...');
    refreshPage();
  } else {
    toast.error('Realtime error occurred.');
  }
}

/**
 * default
 */
function handleUnhandledEvent(event: RealtimeServerEvent) {
  console.warn('Unhandled event:', event);
}

export function handleDataChannelMessage(
  eventData: unknown,
  options: {
    setIsResponseInProgress: (inProgress: boolean) => void;
    handleDelta: (evt: RealtimeTextDeltaEvent) => void;
    handleResponseDone: (evt: RealtimeResponseDoneEvent) => void;
    handleFunctionCallDelta: (evt: RealtimeFunctionCallDeltaEvent) => void;
    handleFileSearchResults: (evt: RealtimeFileSearchResultsEvent) => void;
    refreshPage: () => void;
    sendSessionUpdate?: (partialSession: Record<string, unknown>) => void;
  },
) {
  let parsed: RealtimeServerEvent;
  try {
    parsed = JSON.parse(String(eventData)) as RealtimeServerEvent;
  } catch (err) {
    toast.error(`Failed to parse data channel message. Error: ${String(err)}`);
    return;
  }

  const {
    setIsResponseInProgress,
    handleDelta,
    handleFunctionCallDelta,
    refreshPage,
    sendSessionUpdate,
  } = options;

  switch (parsed.type) {
    // 1) session
    case 'session.created':
      handleSessionCreated(
        parsed as RealtimeServerEvent & {
          type: 'session.created';
          session: Record<string, unknown>;
        },
        { sendSessionUpdate },
      );
      return;
    case 'session.updated':
      handleSessionUpdated(
        parsed as RealtimeServerEvent & {
          type: 'session.updated';
          session: Record<string, unknown>;
        },
      );
      return;

    // 2) conversation
    case 'conversation.created':
      handleConversationCreated(
        parsed as RealtimeServerEvent & {
          type: 'conversation.created';
          conversation: { id: string };
        },
        () => {},
      );
      return;

    case 'conversation.item.created':
      handleConversationItemCreated(parsed as ConversationItemCreatedEvent, {
        conversation: null,
        setConversation: () => {},
        addConversationItem: () => {},
      });
      return;

    case 'conversation.item.truncated':
      handleConversationItemTruncated(
        parsed as RealtimeServerEvent & { type: 'conversation.item.truncated' },
      );
      return;
    case 'conversation.item.deleted':
      handleConversationItemDeleted(
        parsed as RealtimeServerEvent & { type: 'conversation.item.deleted' },
      );
      return;
    case 'conversation.item.input_audio_transcription.completed':
      handleConversationItemInputAudioTranscriptionCompleted(
        parsed as RealtimeServerEvent & {
          type: 'conversation.item.input_audio_transcription.completed';
        },
      );
      return;
    case 'conversation.item.input_audio_transcription.failed':
      handleConversationItemInputAudioTranscriptionFailed(
        parsed as RealtimeServerEvent & {
          type: 'conversation.item.input_audio_transcription.failed';
        },
      );
      return;

    // 3) input_audio_buffer
    case 'input_audio_buffer.committed':
      handleInputAudioBufferCommitted(
        parsed as RealtimeServerEvent & {
          type: 'input_audio_buffer.committed';
        },
      );
      return;
    case 'input_audio_buffer.cleared':
      handleInputAudioBufferCleared(
        parsed as RealtimeServerEvent & { type: 'input_audio_buffer.cleared' },
      );
      return;
    case 'input_audio_buffer.speech_started':
      handleInputAudioBufferSpeechStarted(
        parsed as RealtimeServerEvent & {
          type: 'input_audio_buffer.speech_started';
        },
      );
      return;
    case 'input_audio_buffer.speech_stopped':
      handleInputAudioBufferSpeechStopped(
        parsed as RealtimeServerEvent & {
          type: 'input_audio_buffer.speech_stopped';
        },
      );
      return;

    // 4) response
    case 'response.created':
      handleResponseCreated(
        parsed as RealtimeServerEvent & { type: 'response.created' },
        setIsResponseInProgress,
      );
      return;
    case 'response.done':
      handleResponseDone(
        parsed as RealtimeResponseDoneEvent,
        options.handleResponseDone,
      );
      return;
    case 'response.cancelled':
      handleResponseCancelled(
        parsed as RealtimeServerEvent & { type: 'response.cancelled' },
      );
      return;
    case 'response.text.delta':
      handleResponseTextDelta(parsed as RealtimeTextDeltaEvent, handleDelta);
      return;
    case 'response.text.done':
      handleResponseTextDone(
        parsed as RealtimeServerEvent & { type: 'response.text.done' },
      );
      return;
    case 'response.audio_transcript.delta':
      handleResponseAudioTranscriptDelta(
        parsed as RealtimeServerEvent & {
          type: 'response.audio_transcript.delta';
        },
      );
      return;
    case 'response.audio_transcript.done':
      handleResponseAudioTranscriptDone(
        parsed as RealtimeServerEvent & {
          type: 'response.audio_transcript.done';
        },
      );
      return;
    case 'response.audio.delta':
      handleResponseAudioDelta(
        parsed as RealtimeServerEvent & { type: 'response.audio.delta' },
      );
      return;
    case 'response.audio.done':
      handleResponseAudioDone(
        parsed as RealtimeServerEvent & { type: 'response.audio.done' },
      );
      return;
    case 'response.function_call_arguments.delta':
      handleResponseFunctionCallArgumentsDelta(
        parsed as RealtimeFunctionCallDeltaEvent,
        handleFunctionCallDelta,
      );
      return;
    case 'response.function_call_arguments.done':
      handleResponseFunctionCallArgumentsDone(
        parsed as RealtimeServerEvent & {
          type: 'response.function_call_arguments.done';
        },
      );
      return;
    case 'response.output_item.added':
      handleResponseOutputItemAdded(
        parsed as RealtimeServerEvent & { type: 'response.output_item.added' },
      );
      return;
    case 'response.output_item.done':
      handleResponseOutputItemDone(
        parsed as RealtimeServerEvent & { type: 'response.output_item.done' },
      );
      return;
    case 'response.content_part.added':
      handleResponseContentPartAdded(
        parsed as RealtimeServerEvent & { type: 'response.content_part.added' },
      );
      return;
    case 'response.content_part.done':
      handleResponseContentPartDone(
        parsed as RealtimeServerEvent & { type: 'response.content_part.done' },
      );
      return;

    case 'file.search.results':
      handleFileSearchResults(parsed as RealtimeFileSearchResultsEvent);
      return;

    // 5) rate limits
    case 'rate_limits.updated':
      handleRateLimitsUpdated(
        parsed as RealtimeServerEvent & { type: 'rate_limits.updated' },
      );
      return;

    // 6) error
    case 'error':
      handleErrorEvent(
        parsed as RealtimeServerEvent & { type: 'error'; code?: string },
        refreshPage,
      );
      return;

    // default
    default:
      handleUnhandledEvent(parsed);
      return;
  }
}
