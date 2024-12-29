export type ConversationItem = {
  id: string;
  type: 'message' | 'function_call' | 'function_call_output'; // or more
  role?: 'user' | 'assistant' | 'system';
  content?: string; // For text
  functionCallArgs?: Record<string, string | number | boolean | null>; // if type === "function_call"
  functionCallOutput?: string; // if type === "function_call_output"
  // ...whatever else you need
};
