import { ConversationItem } from '@/lib/types/openai/realtime/conversation/conversation-item/conversation-item';

export type ConversationState = {
  id: string;
  items: ConversationItem[];
};
