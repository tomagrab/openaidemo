'use client';

import { useState, useEffect, FormEvent } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useRealtimeConnection } from '@/hooks/openai/use-realtime-connection/use-realtime-connection';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatClient() {
  const { connected, error, responseText, sendMessage, attemptReconnect } =
    useRealtimeConnection();

  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);

  // Handle form submission: add a user message and send to the Realtime API
  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: trimmed }]);
    sendMessage(trimmed);
    setInputValue('');
  }

  // Whenever responseText changes, we use it to display assistant messages.
  useEffect(() => {
    if (responseText && responseText.length > 0) {
      // If the last message is from assistant, update it. Otherwise, add a new assistant message.
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last && last.role === 'assistant') {
          return [
            ...prev.slice(0, prev.length - 1),
            { ...last, content: responseText },
          ];
        } else {
          return [...prev, { role: 'assistant', content: responseText }];
        }
      });
    }
    // If responseText is empty, we do nothing. It's cleared when a new message is sent
    // and will soon be filled by streaming responses.
  }, [responseText]);

  return (
    <div
      style={{
        width: '400px',
        height: '600px',
        border: '1px solid #ccc',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'sans-serif',
      }}
    >
      {!connected && !error && (
        <div style={{ padding: '1rem' }}>
          Connecting to Realtime API... Please wait.
        </div>
      )}

      {error && (
        <div style={{ padding: '1rem' }}>
          <p style={{ color: 'red' }}>Unable to connect: {error}</p>
          <Button variant="secondary" onClick={attemptReconnect}>
            Attempt to Reconnect
          </Button>
        </div>
      )}

      {connected && (
        <>
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '0.5rem',
              background: '#f9f9f9',
            }}
          >
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  backgroundColor: m.role === 'user' ? '#cce5ff' : '#d4edda',
                  padding: '0.5rem',
                  margin: '0.5rem 0',
                  borderRadius: '4px',
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '80%',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {m.content}
              </div>
            ))}
          </div>
          <form
            onSubmit={handleSubmit}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              padding: '0.5rem',
              borderTop: '1px solid #ccc',
            }}
          >
            <Textarea
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="Type your message here..."
            />
            <Button type="submit">Send</Button>
          </form>
        </>
      )}
    </div>
  );
}
