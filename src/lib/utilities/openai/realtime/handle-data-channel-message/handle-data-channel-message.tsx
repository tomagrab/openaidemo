import { toast } from 'sonner';

import {
  RealtimeServerEvent,
  RealtimeTextDeltaEvent,
  RealtimeResponseDoneEvent,
  RealtimeFunctionCallDeltaEvent,
  ConversationItemCreatedEvent,
} from '@/lib/types/openai/openai';

import type { ConversationState } from '@/lib/types/openai/realtime/conversation/conversation-state/conversation-state';
import type { ConversationItem } from '@/lib/types/openai/realtime/conversation/conversation-item/conversation-item';

import {
  handleConversationCreated,
  handleConversationItemCreated,
  handleConversationItemTruncated,
  handleConversationItemDeleted,
  handleConversationItemInputAudioTranscriptionCompleted,
  handleConversationItemInputAudioTranscriptionFailed,
} from '@/lib/utilities/openai/realtime/conversation-handlers/conversation-handlers';
import {
  handleSessionCreated,
  handleSessionUpdated,
} from '@/lib/utilities/openai/realtime/session-handlers/session-handlers';
import {
  handleInputAudioBufferCommitted,
  handleInputAudioBufferCleared,
  handleInputAudioBufferSpeechStarted,
  handleInputAudioBufferSpeechStopped,
  handleResponseAudioTranscriptDelta,
  handleResponseAudioTranscriptDone,
  handleResponseAudioDelta,
  handleResponseAudioDone,
} from '@/lib/utilities/openai/realtime/audio-handlers/audio-handlers';

import {
  handleResponseCreated,
  handleResponseDone,
  handleResponseCancelled,
  handleResponseTextDelta,
  handleResponseTextDone,
  handleResponseFunctionCallArgumentsDelta,
  handleResponseFunctionCallArgumentsDone,
  handleResponseOutputItemAdded,
  handleResponseOutputItemDone,
  handleResponseContentPartAdded,
  handleResponseContentPartDone,
  handleResponseRateLimitsUpdated,
  handleResponseErrorEvent,
} from '@/lib/utilities/openai/realtime/response-handlers/response-handlers';

function handleUnhandledEvent(event: RealtimeServerEvent) {
  console.warn('Unhandled event:', event);
}

export function handleDataChannelMessage(
  eventData: unknown,
  options: {
    conversation: ConversationState | null;
    setConversation: React.Dispatch<
      React.SetStateAction<ConversationState | null>
    >;
    addConversationItem: (item: ConversationItem) => void;
    setIsResponseInProgress: (inProgress: boolean) => void;
    handleDelta: (evt: RealtimeTextDeltaEvent) => void;
    handleResponseDone: (evt: RealtimeResponseDoneEvent) => void;
    handleFunctionCallDelta: (evt: RealtimeFunctionCallDeltaEvent) => void;
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
        options.setConversation,
      );

    case 'conversation.item.created':
      handleConversationItemCreated(parsed as ConversationItemCreatedEvent, {
        conversation: options.conversation,
        setConversation: options.setConversation,
        addConversationItem: options.addConversationItem,
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

    // 5) rate limits
    case 'rate_limits.updated':
      handleResponseRateLimitsUpdated(
        parsed as RealtimeServerEvent & { type: 'rate_limits.updated' },
      );
      return;

    // 6) error
    case 'error':
      handleResponseErrorEvent(
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
