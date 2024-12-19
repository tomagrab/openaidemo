'use client';

import { useState, useCallback } from 'react';

interface UseTextMessagingParams {
  send: (msg: object) => void;
  onTextResponse: (text: string) => void; // Called when text completes
}

/**
 * Handles sending/receiving text messages.
 * You get `send` from `useRealtimeConnection` and call it here.
 * onTextResponse can be used to set messages in your UI.
 */
export function useTextMessaging({
  send,
  onTextResponse,
}: UseTextMessagingParams) {
  const [responseText, setResponseText] = useState('');

  const sendMessage = useCallback(
    (prompt: string, voiceMode: boolean) => {
      setResponseText('');
      const userMsgEvent = {
        type: 'conversation.item.create',
        item: {
          type: 'message',
          role: 'user',
          content: [{ type: 'input_text', text: prompt }],
        },
      };
      send(userMsgEvent);

      const responseEvent = {
        type: 'response.create',
        response: {
          modalities: voiceMode ? ['text', 'audio'] : ['text'],
        },
      };
      send(responseEvent);
    },
    [send],
  );

  type MessageEvent = {
    type: 'response.text.delta' | 'response.done';
    delta?: string;
  };

  const handleMessageEvent = useCallback(
    (event: MessageEvent) => {
      if (event.type === 'response.text.delta') {
        setResponseText(prev => prev + event.delta);
      } else if (event.type === 'response.done') {
        onTextResponse(responseText);
      }
    },
    [responseText, onTextResponse],
  );

  return { sendMessage, handleMessageEvent, responseText };
}
