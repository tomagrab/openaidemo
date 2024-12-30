import {
  ConversationItemCreatedEvent,
  RealtimeServerEvent,
} from '@/lib/types/openai/openai';
import { ConversationItem } from '@/lib/types/openai/realtime/conversation/conversation-item/conversation-item';
import { ConversationState } from '@/lib/types/openai/realtime/conversation/conversation-state/conversation-state';
import { toast } from 'sonner';

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

export {
  handleConversationCreated,
  handleConversationItemCreated,
  handleConversationItemTruncated,
  handleConversationItemDeleted,
  handleConversationItemInputAudioTranscriptionCompleted,
  handleConversationItemInputAudioTranscriptionFailed,
};
