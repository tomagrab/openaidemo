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
  object: string;
  model: string;
  modalities: string[];
  instructions: string;
  voice: string;
  input_audio_format: string;
  output_audio_format: string;
  input_audio_transcription: {
    model: string;
  };
  turn_detection?: string;
  tools?: string[];
  tool_choice: string;
  temperature: number;
  max_response_output_tokens: number;
  client_secret: {
    value: string;
    expires_at: number;
  };
};

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
    output?: Array<{
      content?: string;
      [key: string]: unknown;
    }>;
    [key: string]: unknown;
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

export type RealtimeServerEvent =
  | RealtimeTextDeltaEvent
  | RealtimeResponseDoneEvent
  | RealtimeFunctionCallDeltaEvent
  | RealtimeFileSearchResultsEvent
  | (BaseRealtimeEvent & Record<string, unknown>);

export type turn_detection = {
  type: 'server_vad';
} | null;
