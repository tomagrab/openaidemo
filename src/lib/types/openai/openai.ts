export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export type EphemeralKey = {
  id: string;
  object: string;
  client_secret: {
    value: string;
    expires_at: number;
  };
};

export type RealtimeAPISession = {
  id: string;
  object: 'realtime.session';
  model: string;
  modalities: string[];
  instructions: string;
  voice: string;
  input_audio_format: string;
  output_audio_format: string;
  input_audio_transcription: {
    model: string;
  } | null; // can be null if off
  turn_detection?: {
    type: 'server_vad';
    threshold?: number;
    prefix_padding_ms?: number;
    silence_duration_ms?: number;
    create_response?: boolean;
  } | null;
  tools?: Array<{
    type: 'function';
    name: string;
    description?: string;
    parameters?: Record<string, unknown>;
  }>;
  tool_choice: 'auto' | 'none' | 'required' | string;
  temperature: number;
  max_response_output_tokens: number | 'inf';
  client_secret: {
    value: string;
    expires_at: number;
  };
};

export type turn_detection = {
  type: 'server_vad';
  threshold?: number;
  prefix_padding_ms?: number;
  silence_duration_ms?: number;
  create_response?: boolean;
} | null;

export type BaseRealtimeEvent = {
  type: string;
  event_id: string;
  response_id?: string;
};

export type RealtimeTextDeltaEvent = BaseRealtimeEvent & {
  type: 'response.text.delta';
  delta: string;
  item_id?: string;
  output_index?: number;
  content_index?: number;
};

export type RealtimeResponseDoneEvent = BaseRealtimeEvent & {
  type: 'response.done';
  response?: {
    [key: string]: unknown;
    id?: string;
    status?: string;
    output?: Array<{
      [key: string]: unknown;
      id?: string;
      type?: 'message' | 'function_call' | 'function_call_output';
      content?: Array<{
        type?: 'text' | 'input_text' | 'input_audio' | 'item_reference';
        text?: string;
        audio?: string;
        transcript?: string;
      }>;
    }>;
  };
};

export type RealtimeFunctionCallDeltaEvent = BaseRealtimeEvent & {
  type: 'response.function_call_arguments.delta';
  delta?: string;
};

export type RealtimeFileSearchResultsEvent = BaseRealtimeEvent & {
  type: 'file.search.results';
  results?: Array<Record<string, unknown>>;
};

export type ConversationItemCreatedEvent = BaseRealtimeEvent & {
  type: 'conversation.item.created';
  previous_item_id?: string | null;
  item: {
    id: string;
    object?: 'realtime.item';
    type: 'message' | 'function_call' | 'function_call_output';
    status?: 'completed' | 'incomplete';
    role?: 'user' | 'assistant' | 'system';
    content?: Array<{
      type: 'text' | 'input_text' | 'input_audio' | 'item_reference';
      text?: string;
      audio?: string;
      transcript?: string;
    }>;
    call_id?: string;
    name?: string;
    arguments?: string;
    output?: string;
  };
};

export type RealtimeServerEvent =
  | RealtimeTextDeltaEvent
  | RealtimeResponseDoneEvent
  | RealtimeFunctionCallDeltaEvent
  | RealtimeFileSearchResultsEvent
  | ConversationItemCreatedEvent
  | (BaseRealtimeEvent & Record<string, unknown>);
